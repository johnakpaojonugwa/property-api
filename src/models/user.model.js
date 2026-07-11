import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'first_name is required'],
      trim: true,
      minlength: [2, 'first_name must be at least 2 characters'],
    },
    last_name: {
      type: String,
      required: [true, 'last_name is required'],
      trim: true,
      minlength: [2, 'last_name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email must be a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'phone is required'],
      trim: true,
      minlength: [7, 'phone must be at least 7 characters'],
    },
    password_hash: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['USER'], default: 'USER' },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
