import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import userService from '../services/user.service.js';

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return res.status(201).json(ApiResponse.success(user, 'User created'));
});

export default { createUser };
