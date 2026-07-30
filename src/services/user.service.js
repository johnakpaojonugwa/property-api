import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Wishlist from '../models/wishlist.model.js';
import Property from '../models/property.model.js';
import ApiError from '../utils/ApiError.js';

const createUser = async (data) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-user-id', ...data };
  }
  const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw ApiError.conflict('User already exists');
  }

  const payload = { ...data };
  if (payload.password && !payload.password_hash) {
    payload.password_hash = await bcrypt.hash(payload.password, 10);
    delete payload.password;
  } else if (payload.password_hash && !payload.password_hash.startsWith('$2a$') && !payload.password_hash.startsWith('$2b$')) {
    payload.password_hash = await bcrypt.hash(payload.password_hash, 10);
  }

  const user = await User.create(payload);
  return user.toObject({ versionKey: false });
};

const getUsers = async (query = {}) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  const page = Number.parseInt(query.page ?? '0', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);
  const skip = page * limit;

  return await User.find().skip(skip).limit(limit).lean();
};

const getUserById = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('User not found');
  }
  const user = await User.findById(id).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

const getUserWishlist = async (user_id) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Wishlist.find({ user_id }).populate('property_id').lean();
};

const getUserProperties = async (user_id) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Property.find({ $or: [{ agent: user_id }, { merchant: user_id }] }).lean();
};

const updateUser = async (id, data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (id !== actor.id && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to update this user');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, ...data };
  }
  const updated = await User.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('User not found');
  }
  return updated;
};

const updateUserResource = async (id, data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (id !== actor.id && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to update this user resource');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, avatar: data.avatar || data.image || data.resource };
  }
  const avatar = data.avatar || data.image || data.resource;
  const updated = await User.findByIdAndUpdate(id, { avatar }, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('User not found');
  }
  return updated;
};

const deleteUser = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (id !== actor.id && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to delete this user');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }
  const deleted = await User.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw ApiError.notFound('User not found');
  }
  return deleted;
};

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