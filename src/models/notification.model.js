import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'GET' },
  permissionRequired: { type: String, default: null },
});

const deliveryStatusSchema = new mongoose.Schema({
  inApp: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  email: { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], default: 'pending' },
  push: { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], default: 'pending' },
  sms: { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], default: 'pending' },
});

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    guestSessionId: { type: String, index: true },
    recipientRole: {
      type: String,
      enum: ['guest', 'user', 'agent', 'merchant', 'admin', 'GUEST', 'USER', 'AGENT', 'MERCHANT', 'ADMIN'],
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['guest', 'user', 'agent', 'merchant', 'admin', 'GUEST', 'USER', 'AGENT', 'MERCHANT', 'ADMIN'],
      default: 'system',
    },
    triggeredByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sourceType: {
      type: String,
      enum: ['property', 'inquiry', 'offer', 'showing', 'lease', 'system'],
      required: true,
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['engagement', 'management', 'sales', 'system', 'compliance'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    actions: [actionSchema],
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isArchived: { type: Boolean, default: false },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    deliveryStatus: { type: deliveryStatusSchema, default: () => ({}) },
    scheduledFor: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// TTL Index for expiration
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound Indexes for queries
notificationSchema.index({ recipientId: 1, isRead: 1, isArchived: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, recipientRole: 1, isRead: 1 });
notificationSchema.index({ guestSessionId: 1, isRead: 1, isArchived: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
