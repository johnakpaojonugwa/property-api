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

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return res.status(200).json(ApiResponse.success(result, 'Password reset link generated'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  return res.status(200).json(ApiResponse.success(result, 'Password has been reset successfully'));
});

export default { login, createToken, forgotPassword, resetPassword };

