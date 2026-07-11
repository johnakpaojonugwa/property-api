import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, 'full_name is required'],
      trim: true,
      minlength: [2, 'full_name must be at least 2 characters'],
    },
    company: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          return value === '' || value.length >= 2;
        },
        message: 'company must be at least 2 characters',
      },
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
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
    is_verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;
