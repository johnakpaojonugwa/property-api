import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, trim: true },
    expires_at: { type: Date, required: true },
  },
  { timestamps: true },
);

const Token = mongoose.model('Token', tokenSchema);

export default Token;
