import mongoose from 'mongoose';

const notificationTemplateSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true, index: true },
    roles: [{
      type: String,
      enum: ['guest', 'user', 'agent', 'merchant', 'admin', 'GUEST', 'USER', 'AGENT', 'MERCHANT', 'ADMIN'],
    }],
    titleTemplate: { type: String, required: true },
    messageTemplate: { type: String, required: true },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    defaultPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);

export default NotificationTemplate;
