import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, 'full_name is required'],
      trim: true,
      minlength: [2, 'full_name must be at least 2 characters'],
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
    is_verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Merchant = mongoose.model('Merchant', merchantSchema);

export default Merchant;
