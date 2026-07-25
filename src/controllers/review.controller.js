import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import reviewService from '../services/review.service.js';

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.body);
  return res.status(201).json(ApiResponse.success(review, 'Review created'));
});

export default { createReview };
