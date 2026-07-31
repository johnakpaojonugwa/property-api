import Notification from '../models/notification.model.js';
import NotificationPreference from '../models/notificationPreference.model.js';
import NotificationTemplate from '../models/notificationTemplate.model.js';
import User from '../models/user.model.js';
import { getIO } from '../utils/socket.js';
import Redis from 'ioredis';

// Try to initialize Redis client for Pub/Sub if MONGODB_URI/REDIS_URL is configured
let redisPub = null;
let redisSub = null;

if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  const redisConfig = process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  };
  const redisOptions = {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
  };

  if (typeof redisConfig === 'string') {
    redisPub = new Redis(redisConfig, redisOptions);
    redisSub = new Redis(redisConfig, redisOptions);
  } else {
    redisPub = new Redis({ ...redisConfig, ...redisOptions });
    redisSub = new Redis({ ...redisConfig, ...redisOptions });
  }

  // Attach error listeners to prevent unhandled rejection/crash in environments where Redis is not running
  redisPub.on('error', (err) => console.error('Notification Service Redis Pub error:', err.message));
  redisSub.on('error', (err) => console.error('Notification Service Redis Sub error:', err.message));
  
  // Subscribe to notification channel
  redisSub.subscribe('notifications:pubsub', (err) => {
    if (!err) {
      console.log('Notification Redis Pub/Sub subscription successful.');
    }
  });

  redisSub.on('message', (channel, message) => {
    if (channel === 'notifications:pubsub') {
      try {
        const payload = JSON.parse(message);
        NotificationService.emitLocal(payload);
      } catch (err) {
        console.error('Error handling Redis pubsub message:', err);
      }
    }
  });
}

/**
 * Text interpolation helper
 */
export function interpolate(text, data = {}) {
  return text.replace(/{(\w+)}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

/**
 * Check if target is currently in quiet hours
 */
export function inQuietHours(pref) {
  if (!pref?.quietHours?.enabled) return false;
  const { start, end, timezone } = pref.quietHours;

  try {
    const options = { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat([], options);
    const parts = formatter.formatToParts(new Date());
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    
    if (!hour || !minute) return false;
    const currentStr = `${hour}:${minute}`;

    if (start <= end) {
      return currentStr >= start && currentStr <= end;
    } else {
      return currentStr >= start || currentStr <= end;
    }
  } catch (err) {
    console.error('Error checking quiet hours:', err);
    return false; // Fallback to sending if timezone is invalid
  }
}

export class NotificationService {
  /**
   * Fetch preferences or create default if not found
   */
  static async getPreferences(userId, guestSessionId) {
    let query = {};
    if (userId) query.userId = userId;
    else if (guestSessionId) query.guestSessionId = guestSessionId;
    else return null;

    let pref = await NotificationPreference.findOne(query);
    if (!pref) {
      pref = await NotificationPreference.create({
        userId: userId || undefined,
        guestSessionId: guestSessionId || undefined,
      });
      if (userId) {
        await User.findByIdAndUpdate(userId, { preferences: pref._id });
      }
    }
    return pref;
  }

  /**
   * Resolve template title and message
   */
  static async resolveTemplate(type, recipientRole, variables = {}) {
    const template = await NotificationTemplate.findOne({ type });
    if (!template) {
      return {
        title: variables.title || `Alert: ${type}`,
        message: variables.message || `Notification event of type ${type} occurred.`,
        channels: { inApp: true },
        defaultPriority: 'medium',
      };
    }

    // Check if template supports the target role
    const normalise = (r) => r.toLowerCase();
    const matchesRole = template.roles.map(normalise).includes(recipientRole.toLowerCase());
    
    return {
      title: matchesRole ? interpolate(template.titleTemplate, variables) : variables.title || 'Notification',
      message: matchesRole ? interpolate(template.messageTemplate, variables) : variables.message || 'Details not available',
      channels: template.channels,
      defaultPriority: template.defaultPriority,
    };
  }

  /**
   * Core notification creation and delivery function
   */
  static async send(params) {
    const {
      recipientId,
      guestSessionId,
      recipientRole,
      actorRole = 'system',
      triggeredByUserId,
      sourceType,
      sourceId,
      type,
      category,
      priority,
      data = {},
      actions = [],
      expiresAt,
    } = params;

    // 1. Fetch preferences
    const pref = await this.getPreferences(recipientId, guestSessionId);

    // 2. Resolve template
    const templated = await this.resolveTemplate(type, recipientRole, { ...data, ...params });
    const finalTitle = params.title || templated.title;
    const finalMessage = params.message || templated.message;
    const defaultChannels = templated.channels;
    const finalPriority = priority || templated.defaultPriority || 'medium';

    // 3. Determine active channels based on preferences and template defaults
    const activeChannels = {
      inApp: pref ? pref.channels.inApp && defaultChannels.inApp : defaultChannels.inApp,
      email: pref ? pref.channels.email && defaultChannels.email : defaultChannels.email,
      push: pref ? pref.channels.push && defaultChannels.push : defaultChannels.push,
      sms: pref ? pref.channels.sms && defaultChannels.sms : defaultChannels.sms,
    };

    // Filter categories if preference is defined
    if (pref && !pref.categories[category]) {
      // If user disabled this notification category, disable all channels
      activeChannels.inApp = false;
      activeChannels.email = false;
      activeChannels.push = false;
      activeChannels.sms = false;
    }

    // 4. Handle Quiet Hours (defer/schedule notification if active)
    let scheduledFor = params.scheduledFor || new Date();
    if (pref && inQuietHours(pref)) {
      // For quiet hours, we can postpone the delivery by e.g. 1 hour or set schedule target
      const endHour = parseInt(pref.quietHours.end.split(':')[0], 10);
      const endMin = parseInt(pref.quietHours.end.split(':')[1], 10);
      const deferredDate = new Date();
      deferredDate.setHours(endHour, endMin + 1, 0, 0);
      if (deferredDate <= new Date()) {
        deferredDate.setDate(deferredDate.getDate() + 1);
      }
      scheduledFor = deferredDate;
    }

    // Initialize delivery status values
    const deliveryStatus = {
      inApp: activeChannels.inApp ? 'pending' : 'skipped',
      email: activeChannels.email ? 'pending' : 'skipped',
      push: activeChannels.push ? 'pending' : 'skipped',
      sms: activeChannels.sms ? 'pending' : 'skipped',
    };

    // 5. Create notification record
    const notification = await Notification.create({
      recipientId: recipientId || undefined,
      guestSessionId: guestSessionId || undefined,
      recipientRole,
      actorRole,
      triggeredByUserId: triggeredByUserId || undefined,
      sourceType,
      sourceId: sourceId || undefined,
      type,
      category,
      priority: finalPriority,
      title: finalTitle,
      message: finalMessage,
      data,
      actions,
      isRead: false,
      isArchived: false,
      channels: activeChannels,
      deliveryStatus,
      scheduledFor,
      expiresAt: expiresAt || (scheduledFor ? new Date(scheduledFor.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined), // default 30 days TTL
    });

    // 6. Delivery Routing (Immediate if scheduledFor is now)
    const isImmediate = scheduledFor.getTime() <= Date.now();
    if (isImmediate) {
      await this.deliver(notification);
    }

    return notification;
  }

  /**
   * Execute delivery across channels
   */
  static async deliver(notification) {
    const deliveryPromises = [];

    // In-App channel delivery
    if (notification.channels.inApp) {
      deliveryPromises.push(
        (async () => {
          try {
            await this.dispatchInApp(notification);
            notification.deliveryStatus.inApp = 'sent';
          } catch (err) {
            console.error('InApp delivery failed:', err);
            notification.deliveryStatus.inApp = 'failed';
          }
        })()
      );
    }

    // Email mock / hooks
    if (notification.channels.email) {
      deliveryPromises.push(
        (async () => {
          try {
            await this.sendMockEmail(notification);
            notification.deliveryStatus.email = 'sent';
          } catch (err) {
            notification.deliveryStatus.email = 'failed';
          }
        })()
      );
    }

    // Push Notification mock / hooks
    if (notification.channels.push) {
      deliveryPromises.push(
        (async () => {
          try {
            await this.sendMockPush(notification);
            notification.deliveryStatus.push = 'sent';
          } catch (err) {
            notification.deliveryStatus.push = 'failed';
          }
        })()
      );
    }

    // SMS mock / hooks
    if (notification.channels.sms) {
      deliveryPromises.push(
        (async () => {
          try {
            await this.sendMockSMS(notification);
            notification.deliveryStatus.sms = 'sent';
          } catch (err) {
            notification.deliveryStatus.sms = 'failed';
          }
        })()
      );
    }

    await Promise.all(deliveryPromises);
    await notification.save();
  }

  /**
   * Dispatch in-app notifications in real-time
   */
  static async dispatchInApp(notification) {
    const payload = {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      category: notification.category,
      priority: notification.priority,
      data: notification.data,
      actions: notification.actions,
      recipientId: notification.recipientId,
      guestSessionId: notification.guestSessionId,
      recipientRole: notification.recipientRole,
      createdAt: notification.createdAt,
    };

    if (redisPub) {
      // Publish to Redis channel for multi-instance support
      await redisPub.publish('notifications:pubsub', JSON.stringify(payload));
    } else {
      // Fallback: emit locally on this instance
      this.emitLocal(payload);
    }
  }

  /**
   * Emit socket events to connected clients on this instance
   */
  static emitLocal(payload) {
    const io = getIO();
    if (!io) return;

    const { recipientId, guestSessionId, recipientRole } = payload;

    // Select target rooms based on role and identifier
    if (recipientId) {
      const userRoom = `${recipientRole.toLowerCase()}:${recipientId}`;
      io.to(userRoom).emit('notification', payload);
    } else if (guestSessionId) {
      const guestRoom = `guest:${guestSessionId}`;
      io.to(guestRoom).emit('notification', payload);
    }

    // Always emit to admin room for compliance / global monitoring
    io.to('admin:broadcast').emit('notification', payload);
  }

  // --- MOCK DELIVERY CHANNELS ---
  static async sendMockEmail(notification) {
    // This is a placeholder hook for Resend or another mail utility.
    // In production, fetch user's email, render HTML template, and send via Resend.
    return true;
  }

  static async sendMockPush(notification) {
    // Hook for FCM (Firebase Cloud Messaging) or Web Push API.
    return true;
  }

  static async sendMockSMS(notification) {
    // Hook for Twilio or SMS gateway API.
    return true;
  }

  /**
   * Helper to seed standard templates
   */
  static async seedDefaultTemplates() {
    const defaultTemplates = [
      {
        type: 'instant_price_drop',
        roles: ['guest'],
        titleTemplate: 'Price Drop Alert!',
        messageTemplate: 'The property "{property_title}" you tracked just dropped to {new_price}!',
      },
      {
        type: 'price_drop',
        roles: ['user'],
        titleTemplate: 'Price Drop on your Favorite!',
        messageTemplate: 'Great news! The price of "{property_title}" has been lowered to {new_price}.',
      },
      {
        type: 'new_lead',
        roles: ['agent'],
        titleTemplate: 'New Client Lead Assigned',
        messageTemplate: 'You have been assigned a new client lead: {user_name}. Contact them soon!',
      },
      {
        type: 'offer_received',
        roles: ['merchant'],
        titleTemplate: 'New Offer Received',
        messageTemplate: 'You received a new offer of {offer_amount} for "{property_title}".',
      },
      {
        type: 'dispute_raised',
        roles: ['admin'],
        titleTemplate: 'Dispute Raised - Critical Review Required',
        messageTemplate: 'User {user_name} raised a dispute on property "{property_title}". Transaction ID: {transaction_id}.',
      },
    ];

    for (const temp of defaultTemplates) {
      await NotificationTemplate.findOneAndUpdate(
        { type: temp.type },
        temp,
        { upsert: true, returnDocument: 'after' }
      );
    }
  }
}
