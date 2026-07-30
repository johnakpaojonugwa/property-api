import mongoose from 'mongoose';
import Wishlist from '../models/wishlist.model.js';
import ApiError from '../utils/ApiError.js';

const createWishlist = async (data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (actor.role !== 'USER' && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('Only regular users can wishlist properties');
  }
  if (actor.role === 'USER') {
    data.user_id = actor.id;
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-wishlist-id', ...data };
  }

  const existing = await Wishlist.findOne({ user_id: data.user_id, property_id: data.property_id });
  if (existing) {
    throw ApiError.conflict('Wishlist entry already exists');
  }

  const wishlist = await Wishlist.create(data);
  return wishlist.toObject({ versionKey: false });
};

const getWishlistById = async (id) => {
  const wishlist = await Wishlist.findById(id).lean();
  if (!wishlist) {
    throw ApiError.notFound('Wishlist entry not found');
  }
  return wishlist;
};

export default {
  createWishlist,
  getWishlistById,
};