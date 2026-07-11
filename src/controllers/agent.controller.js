import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createAgent = asyncHandler(async (req, res) => {
  const agent = { ...req.body };
  return res.status(201).json(ApiResponse.success(agent, 'Agent created'));
});

export default { createAgent };
