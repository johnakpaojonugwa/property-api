import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: {
      type: String,
      required: [true, 'text is required'],
      trim: true,
      minlength: [5, 'text must be at least 5 characters'],
    },
  },
  { timestamps: true },
);

reviewSchema.index({ property_id: 1, createdAt: -1 });
reviewSchema.index({ user_id: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
