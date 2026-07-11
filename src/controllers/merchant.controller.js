import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createMerchant = asyncHandler(async (req, res) => {
  const merchant = { ...req.body };
  return res.status(201).json(ApiResponse.success(merchant, 'Merchant created'));
});

export default { createMerchant };
