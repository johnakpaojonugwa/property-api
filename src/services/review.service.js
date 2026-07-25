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

const getReviews = async (query = {}) => {
  const filter = {};
  if (query.property_id) filter.property_id = query.property_id;
  if (query.user_id) filter.user_id = query.user_id;

  const page = Number.parseInt(query.page ?? '0', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);
  const skip = page * limit;

  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  return await Review.find(filter).skip(skip).limit(limit).lean();
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

const updateReview = async (id, data) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, ...data };
  }
  const updated = await Review.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Review not found');
  }
  return updated;
};

const deleteReview = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }
  const deleted = await Review.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw ApiError.notFound('Review not found');
  }
  return deleted;
};

export default {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};