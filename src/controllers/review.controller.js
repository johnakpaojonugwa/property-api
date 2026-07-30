import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import reviewService from '../services/review.service.js';

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.body, req.actor);
  return res.status(201).json(ApiResponse.success(review, 'Review created'));
});

const getReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getReviews(req.query);
  return res.status(200).json(ApiResponse.success(reviews, 'Reviews retrieved'));
});

const updateReview = asyncHandler(async (req, res) => {
  const updated = await reviewService.updateReview(req.params.review_id, req.body, req.actor);
  return res.status(200).json(ApiResponse.success(updated, 'Review updated'));
});

const deleteReview = asyncHandler(async (req, res) => {
  const deleted = await reviewService.deleteReview(req.params.review_id, req.actor);
  return res.status(200).json(ApiResponse.success(deleted, 'Review deleted'));
});

export default {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
};
