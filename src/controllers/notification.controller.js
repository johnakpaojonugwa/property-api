import Notification from '../models/notification.model.js';
import NotificationPreference from '../models/notificationPreference.model.js';
import NotificationAuditLog from '../models/notificationAuditLog.model.js';
import User from '../models/user.model.js';
import { NotificationService } from '../services/notification.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Property from '../models/property.model.js';
import Appointment from '../models/appointment.model.js';

export const getNotifications = async (req, res, next) => {
  try {
    const actor = req.actor;
    const { page = 1, limit = 10, isRead, category, priority, sourceType, recipientId } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build base query
    const query = { isArchived: false };

    // Role-based scoping and Cross-Actor enforcement
    if (actor.role === 'ADMIN') {
      if (recipientId) {
        query.recipientId = recipientId;
      }
    } else if (actor.role === 'AGENT') {
      if (recipientId && recipientId !== actor.id) {
        // Cross-Actor Agent check: Can only view client notifications related to their properties or appointments
        const properties = await Property.find({ agent: actor.id }).select('_id');
        const propertyIds = properties.map((p) => p._id);
        const appointments = await Appointment.find({ user_id: recipientId, agent_id: actor.id }).select('_id');
        const appointmentIds = appointments.map((a) => a._id);

        query.recipientId = recipientId;
        query.$or = [
          { sourceType: 'property', sourceId: { $in: propertyIds } },
          { 'data.propertyId': { $in: propertyIds } },
          { sourceType: 'showing', sourceId: { $in: appointmentIds } },
          { 'data.appointmentId': { $in: appointmentIds } },
        ];
      } else {
        query.recipientId = actor.id;
      }
    } else if (actor.role === 'MERCHANT') {
      if (recipientId && recipientId !== actor.id) {
        // Cross-Actor Merchant check: Can only view lead/properties they own
        const properties = await Property.find({ merchant: actor.id }).select('_id');
        const propertyIds = properties.map((p) => p._id);
        query.recipientId = recipientId;
        query.$or = [
          { sourceType: 'property', sourceId: { $in: propertyIds } },
          { 'data.propertyId': { $in: propertyIds } },
        ];
      } else {
        query.recipientId = actor.id;
      }
    } else if (actor.role === 'GUEST') {
      query.guestSessionId = actor.id;
      query.recipientRole = 'GUEST';
    } else {
      // Standard USER
      query.recipientId = actor.id;
    }

    // Apply filters
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    if (category) {
      query.category = category;
    }
    if (priority) {
      query.priority = priority;
    }
    if (sourceType) {
      query.sourceType = sourceType;
    }

    // Fetch notifications and unread count in parallel
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        ...query,
        isRead: false,
      }),
    ]);

    res.status(200).json(
      ApiResponse.success(
        {
          notifications,
          unreadCount,
        },
        'Notifications retrieved successfully',
        {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        }
      )
    );
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = req.notification; // Populated by rbacGuard('markRead')
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json(
      ApiResponse.success(notification, 'Notification marked as read')
    );
  } catch (err) {
    next(err);
  }
};

export const broadcastNotification = async (req, res, next) => {
  try {
    const actor = req.actor;
    const { recipientRoles, title, message, priority = 'medium', data = {}, actions = [] } = req.body;

    if (!title || !message) {
      return next(ApiError.badRequest('Title and message are required for broadcast'));
    }

    if (!recipientRoles || !Array.isArray(recipientRoles) || recipientRoles.length === 0) {
      return next(ApiError.badRequest('recipientRoles array is required and cannot be empty'));
    }

    // Convert roles to uppercase for consistency with User model role casing
    const targetRoles = recipientRoles.map((r) => r.toUpperCase());

    // Fetch all users with targeted roles
    const users = await User.find({ role: { $in: targetRoles }, isActive: true }).select('_id role');

    if (users.length === 0) {
      return res.status(200).json(
        ApiResponse.success([], 'No active users found matching target roles')
      );
    }

    const notificationOps = users.map((user) => ({
      recipientId: user._id,
      recipientRole: user.role,
      actorRole: 'ADMIN',
      triggeredByUserId: actor.id,
      sourceType: 'system',
      type: 'system_broadcast',
      category: 'system',
      priority,
      title,
      message,
      data,
      actions,
      isRead: false,
      channels: { inApp: true, email: true },
    }));

    const createdNotifications = await Notification.insertMany(notificationOps);

    // Trigger deliveries asynchronously
    Promise.all(
      createdNotifications.map((notification) => NotificationService.deliver(notification))
    ).catch((err) => console.error('Error during broadcast delivery:', err));

    // Audit Log
    await NotificationAuditLog.create({
      adminId: actor.id,
      action: 'broadcast',
      details: {
        targetRoles,
        title,
        count: users.length,
      },
    });

    res.status(201).json(
      ApiResponse.success(
        { count: users.length },
        `Successfully broadcasted to ${users.length} actors`
      )
    );
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const actor = req.actor;
    const { channels, categories, quietHours, digestFrequency } = req.body;

    let pref = await NotificationPreference.findOne({ userId: actor.id });
    if (!pref) {
      pref = new NotificationPreference({ userId: actor.id });
    }

    if (channels) {
      pref.channels = { ...pref.channels.toObject(), ...channels };
    }
    if (categories) {
      pref.categories = { ...pref.categories.toObject(), ...categories };
    }
    if (quietHours) {
      pref.quietHours = { ...pref.quietHours.toObject(), ...quietHours };
    }
    if (digestFrequency) {
      pref.digestFrequency = digestFrequency;
    }

    await pref.save();

    // Link preference to user if not done
    await User.findByIdAndUpdate(actor.id, { preferences: pref._id });

    res.status(200).json(
      ApiResponse.success(pref, 'Notification preferences updated successfully')
    );
  } catch (err) {
    next(err);
  }
};
