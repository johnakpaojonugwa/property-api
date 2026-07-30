import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import userService from '../services/user.service.js';

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return res.status(201).json(ApiResponse.success(user, 'User created'));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers(req.query);
  return res.status(200).json(ApiResponse.success(users, 'Users retrieved'));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.user_id);
  return res.status(200).json(ApiResponse.success(user, 'User retrieved'));
});

const getUserWishlist = asyncHandler(async (req, res) => {
  const wishlist = await userService.getUserWishlist(req.params.user_id);
  return res.status(200).json(ApiResponse.success(wishlist, 'User wishlist retrieved'));
});

const getUserProperties = asyncHandler(async (req, res) => {
  const properties = await userService.getUserProperties(req.params.user_id);
  return res.status(200).json(ApiResponse.success(properties, 'User properties retrieved'));
});

const updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUser(req.params.user_id, req.body, req.actor);
  return res.status(200).json(ApiResponse.success(updated, 'User updated'));
});

const updateUserResource = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserResource(req.params.user_id, req.body, req.actor);
  return res.status(200).json(ApiResponse.success(updated, 'User resource updated'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const deleted = await userService.deleteUser(req.params.user_id, req.actor);
  return res.status(200).json(ApiResponse.success(deleted, 'User deleted'));
});

export default {
  createUser,
  getUsers,
  getUserById,
  getUserWishlist,
  getUserProperties,
  updateUser,
  updateUserResource,
  deleteUser,
};
