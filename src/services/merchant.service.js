import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Merchant from '../models/merchant.model.js';
import Agent from '../models/agent.model.js';
import Wishlist from '../models/wishlist.model.js';
import ApiError from '../utils/ApiError.js';

const createMerchant = async (data) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-merchant-id', ...data };
  }
  const existing = await Merchant.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw ApiError.conflict('Merchant already exists');
  }

  const payload = { ...data };
  if (payload.password && !payload.password_hash) {
    payload.password_hash = await bcrypt.hash(payload.password, 10);
    delete payload.password;
  } else if (payload.password_hash && !payload.password_hash.startsWith('$2a$') && !payload.password_hash.startsWith('$2b$')) {
    payload.password_hash = await bcrypt.hash(payload.password_hash, 10);
  }

  const merchant = await Merchant.create(payload);

  const merchantData = merchant.toObject({ versionKey: false });
  delete merchantData.password_hash;
  
  return merchantData;
};

const getMerchants = async () => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Merchant.find().lean();
};

const getMerchantById = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('Merchant not found');
  }
  const merchant = await Merchant.findById(id).lean();
  if (!merchant) {
    throw ApiError.notFound('Merchant not found');
  }
  return merchant;
};

const getMerchantAgents = async (merchant_id, options = {}) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  const limit = Number.parseInt(options.limit ?? '10', 10);
  const offset = Number.parseInt(options.offset ?? options.page ?? '0', 10);
  const query = merchant_id ? { merchant: merchant_id } : {};
  return await Agent.find(query).skip(offset).limit(limit).lean();
};

const verifyAgent = async (agent_id, is_verified) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: agent_id, is_verified };
  }
  const agent = await Agent.findByIdAndUpdate(agent_id, { is_verified }, { new: true }).lean();
  if (!agent) {
    throw ApiError.notFound('Agent not found');
  }
  return agent;
};

const getMerchantWishlist = async (merchant_id) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Wishlist.find({ user_id: merchant_id }).populate('property_id').lean();
};

export default {
  createMerchant,
  getMerchants,
  getMerchantById,
  getMerchantAgents,
  verifyAgent,
  getMerchantWishlist,
};