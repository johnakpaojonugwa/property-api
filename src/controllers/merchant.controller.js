import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import merchantService from '../services/merchant.service.js';

const createMerchant = asyncHandler(async (req, res) => {
  const merchant = await merchantService.createMerchant(req.body);
  return res.status(201).json(ApiResponse.success(merchant, 'Merchant created'));
});

export default { createMerchant };
