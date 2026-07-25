import mongoose from 'mongoose';
import Review from '../models/review.model.js';
import ApiError from '../utils/ApiError.js';

const createReview = async (data) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-review-id', ...data };
  }
  const review = await Review.create(data);
  return review.toObject({ versionKey: false });
};

const getReviewById = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('Review not found');
  }
  const review = await Review.findById(id).lean();
  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  return review;
};

export default {
  createReview,
  getReviewById,
};