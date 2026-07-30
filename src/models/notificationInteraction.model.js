import mongoose from 'mongoose';

const notificationInteractionSchema = new mongoose.Schema(
  {
    notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    guestSessionId: { type: String, index: true },
    actionTaken: {
      type: String,
      enum: ['viewed', 'clicked', 'archived', 'deleted'],
      required: true,
    },
    actionDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const NotificationInteraction = mongoose.model('NotificationInteraction', notificationInteractionSchema);

export default NotificationInteraction;
