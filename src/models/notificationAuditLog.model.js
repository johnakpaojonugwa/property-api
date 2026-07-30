import mongoose from 'mongoose';

const notificationAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      required: true,
      enum: ['broadcast', 'create_template', 'update_template', 'delete_template', 'delete_notification', 'update_preference_override'],
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const NotificationAuditLog = mongoose.model('NotificationAuditLog', notificationAuditLogSchema);

export default NotificationAuditLog;
