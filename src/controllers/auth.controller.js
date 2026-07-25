import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import authService from '../services/auth.service.js';

const login = asyncHandler(async (req, res) => {
  const authResult = await authService.login(req.body);
  return res.status(200).json(ApiResponse.success(authResult, 'Login successful'));
});

const createToken = asyncHandler(async (req, res) => {
  const result = await authService.createGuestToken();
  return res.status(200).json(ApiResponse.success(result, 'Token created'));
});

export default { login, createToken };
