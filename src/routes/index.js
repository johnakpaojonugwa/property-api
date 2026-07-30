import express from 'express';
import authRoutes from './auth.routes.js';
import propertyRoutes from './property.routes.js';
import userRoutes from './user.routes.js';
import merchantRoutes from './merchant.routes.js';
import agentRoutes from './agent.routes.js';
import appointmentRoutes from './appointment.routes.js';
import reviewRoutes from './review.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import notificationRoutes from './notification.routes.js';

import tokenRoutes from './token.routes.js';

const router = express.Router();
router.use('/v1', tokenRoutes);
router.use('/v1', authRoutes);
router.use('/v1', propertyRoutes);
router.use('/v1', userRoutes);
router.use('/v1', merchantRoutes);
router.use('/v1', agentRoutes);
router.use('/v1', appointmentRoutes);
router.use('/v1', reviewRoutes);
router.use('/v1', wishlistRoutes);
router.use('/v1', notificationRoutes);

export default router;
