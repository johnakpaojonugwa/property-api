import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import wishlistService from '../services/wishlist.service.js';

const createWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.createWishlist(req.body, req.actor);
  return res.status(201).json(ApiResponse.success(wishlist, 'Wishlist entry created'));
});

export default { createWishlist };
