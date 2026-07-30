import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [
        function () {
          return this.role !== 'GUEST' && this.role !== 'guest';
        },
        'first_name is required',
      ],
      trim: true,
      minlength: [2, 'first_name must be at least 2 characters'],
    },
    last_name: {
      type: String,
      required: [
        function () {
          return this.role !== 'GUEST' && this.role !== 'guest';
        },
        'last_name is required',
      ],
      trim: true,
      minlength: [2, 'last_name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [
        function () {
          return this.role !== 'GUEST' && this.role !== 'guest';
        },
        'email is required',
      ],
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email must be a valid email'],
    },
    phone: {
      type: String,
      required: [
        function () {
          return this.role !== 'GUEST' && this.role !== 'guest';
        },
        'phone is required',
      ],
      trim: true,
      minlength: [7, 'phone must be at least 7 characters'],
    },
    password_hash: {
      type: String,
      required: [
        function () {
          return this.role !== 'GUEST' && this.role !== 'guest';
        },
        'password_hash is required',
      ],
      select: false,
    },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['USER', 'AGENT', 'MERCHANT', 'ADMIN', 'GUEST', 'user', 'agent', 'merchant', 'admin', 'guest'],
      default: 'USER',
    },
    isActive: { type: Boolean, default: true },
    guestSessionId: { type: String, index: true },
    preferences: { type: mongoose.Schema.Types.ObjectId, ref: 'NotificationPreference' },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
