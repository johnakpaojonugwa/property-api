import ApiError from '../utils/ApiError.js';
import Property from '../models/property.model.js';
import Appointment from '../models/appointment.model.js';
import Notification from '../models/notification.model.js';

/**
 * Middleware to populate req.actor for guest sessions if not already authenticated.
 */
export const injectGuestActor = (req, res, next) => {
  if (req.actor) {
    // Normalise role/type to uppercase for consistent checking
    req.actor.role = (req.actor.role || req.actor.type || 'USER').toUpperCase();
    req.actor.type = req.actor.role;
    return next();
  }

  const guestSessionId = req.headers['x-guest-session-id'] || req.headers['X-Guest-Session-ID'];
  if (guestSessionId) {
    req.actor = {
      id: guestSessionId,
      role: 'GUEST',
      type: 'GUEST',
      merchant_id: null,
    };
  }

  next();
};

/**
 * Helper to verify cross-actor relationship permissions
 */
export async function verifyRelation(actor, notification) {
  if (actor.role === 'ADMIN') return true;

  // Check if it's the actor's own notification
  const isOwn = (notification.recipientId && notification.recipientId.toString() === actor.id) ||
                (notification.guestSessionId && notification.guestSessionId === actor.id);
  if (isOwn) return true;

  // AGENT cross-actor logic
  if (actor.role === 'AGENT') {
    // Can view if related to a property they manage
    if (notification.sourceType === 'property' && notification.sourceId) {
      const property = await Property.findById(notification.sourceId).select('agent').lean();
      if (property && property.agent.toString() === actor.id) return true;
    }
    // Or if related to a client they have an appointment with
    if (notification.recipientId) {
      const hasAppointment = await Appointment.findOne({
        user_id: notification.recipientId,
        agent_id: actor.id,
      }).select('_id').lean();
      if (hasAppointment) return true;
    }
  }

  // MERCHANT cross-actor logic
  if (actor.role === 'MERCHANT') {
    // Can view if related to a property they own
    if (notification.sourceType === 'property' && notification.sourceId) {
      const property = await Property.findById(notification.sourceId).select('merchant').lean();
      if (property && property.merchant && property.merchant.toString() === actor.id) return true;
    }
    if (notification.data?.propertyId) {
      const property = await Property.findById(notification.data.propertyId).select('merchant').lean();
      if (property && property.merchant && property.merchant.toString() === actor.id) return true;
    }
  }

  // USER cross-actor logic
  if (actor.role === 'USER') {
    // Can view inquiries they triggered
    if (notification.sourceType === 'inquiry' && notification.data?.userId === actor.id) {
      return true;
    }
  }

  return false;
}

/**
 * Enforce RBAC rules at the middleware level
 */
export const rbacGuard = (action) => async (req, res, next) => {
  const actor = req.actor;
  if (!actor) {
    return next(ApiError.unauthorized('Authentication or guest session is required'));
  }

  const role = actor.role;

  switch (action) {
    case 'viewOwn':
      // Handled dynamically in queries: users retrieve their own notifications,
      // but admins bypass it. Non-admins requesting another user's notifications are guarded here.
      if (req.query.recipientId && req.query.recipientId !== actor.id && role !== 'ADMIN') {
        // If requesting someone else's feed, check cross-actor capability
        if (role === 'AGENT' || role === 'MERCHANT') {
          return next(); // Let controller query filter enforce relation
        }
        return next(ApiError.forbidden('You are not allowed to view notifications for other actors'));
      }
      return next();

    case 'viewAll':
      if (role !== 'ADMIN') {
        return next(ApiError.forbidden('Only administrators can view all notifications'));
      }
      return next();

    case 'create':
      // Direct broadcast creation is Admin only. Other actors generate notifications via system events.
      if (role !== 'ADMIN') {
        return next(ApiError.forbidden('Only administrators can broadcast notifications'));
      }
      return next();

    case 'markRead': {
      const { id } = req.params;
      try {
        const notification = await Notification.findById(id);
        if (!notification) {
          return next(ApiError.notFound('Notification not found'));
        }
        const hasAccess = await verifyRelation(actor, notification);
        if (!hasAccess) {
          return next(ApiError.forbidden('You do not have permission to modify this notification'));
        }
        req.notification = notification; // Pass it along to save database query in controller
        return next();
      } catch (err) {
        return next(err);
      }
    }

    case 'delete':
      if (role !== 'ADMIN') {
        return next(ApiError.forbidden('Only administrators can delete notifications'));
      }
      return next();

    case 'preferences':
      if (role === 'GUEST') {
        return next(ApiError.forbidden('Guest preferences are managed via Local Storage only'));
      }
      return next();

    case 'analytics':
      if (role === 'GUEST' || role === 'USER') {
        return next(ApiError.forbidden('You do not have access to notification analytics'));
      }
      return next();

    default:
      return next(ApiError.forbidden('Action not supported'));
  }
};
