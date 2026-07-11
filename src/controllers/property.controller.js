import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createProperty = asyncHandler(async (req, res) => {
  const property = {
    ...req.body,
    is_verified: false,
    is_sold: false,
  };

  return res.status(201).json(ApiResponse.success(property, 'Property created'));
});

const getProperties = asyncHandler(async (req, res) => {
  return res.status(200).json(ApiResponse.success([], 'Properties retrieved'));
});

export default { createProperty, getProperties };
