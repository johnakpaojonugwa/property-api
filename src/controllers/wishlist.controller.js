import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createWishlist = asyncHandler(async (req, res) => {
  const wishlist = { ...req.body };
  return res.status(201).json(ApiResponse.success(wishlist, 'Wishlist entry created'));
});

export default { createWishlist };
