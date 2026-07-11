import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createReview = asyncHandler(async (req, res) => {
  const review = { ...req.body };
  return res.status(201).json(ApiResponse.success(review, 'Review created'));
});

export default { createReview };
