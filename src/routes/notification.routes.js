import express from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import { injectGuestActor, rbacGuard } from '../middlewares/rbac.middleware.js';
import {
  getNotifications,
  markAsRead,
  broadcastNotification,
  updatePreferences,
} from '../controllers/notification.controller.js';

const router = express.Router();

// List notifications (supports guests via x-guest-session-id or JWT)
router.get(
  '/notifications',
  optionalAuthenticate,
  injectGuestActor,
  rbacGuard('viewOwn'), // Let's call it viewOwn, we have a guard check for it.
  getNotifications
);

// Mark read (supports guests via x-guest-session-id or JWT)
router.patch(
  '/notifications/:id/read',
  optionalAuthenticate,
  injectGuestActor,
  rbacGuard('markRead'),
  markAsRead
);

// Admin system broadcast (requires admin token)
router.post(
  '/admin/notifications/broadcast',
  authenticate,
  rbacGuard('create'),
  broadcastNotification
);

// Manage preferences (requires user token)
router.put(
  '/notifications/preferences',
  authenticate,
  rbacGuard('preferences'),
  updatePreferences
);

export default router;
