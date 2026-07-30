import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    guestSessionId: { type: String, unique: true, sparse: true },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    categories: {
      engagement: { type: Boolean, default: true },
      management: { type: Boolean, default: true },
      sales: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      compliance: { type: Boolean, default: true },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '07:00' },
      timezone: { type: String, default: 'UTC' },
    },
    digestFrequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'instant',
    },
  },
  { timestamps: true }
);

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

export default NotificationPreference;
