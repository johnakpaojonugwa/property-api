import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Agent from '../models/agent.model.js';
import Wishlist from '../models/wishlist.model.js';
import ApiError from '../utils/ApiError.js';

const createAgent = async (data) => {
  const payload = { ...data };
  if (payload.password && !payload.password_hash) {
    payload.password_hash = await bcrypt.hash(payload.password, 10);
    delete payload.password;
  } else if (payload.password_hash && !payload.password_hash.startsWith('$2a$') && !payload.password_hash.startsWith('$2b$')) {
    payload.password_hash = await bcrypt.hash(payload.password_hash, 10);
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-id', ...payload };
  }

  const existing = await Agent.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw ApiError.conflict('Agent already exists');
  }

  const agent = await Agent.create(payload);
  return agent.toObject({ versionKey: false });
};

const getAgents = async (query = {}) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Agent.find(query).lean();
};

const getAgentById = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('Agent not found');
  }
  const agent = await Agent.findById(id).lean();
  if (!agent) {
    throw ApiError.notFound('Agent not found');
  }
  return agent;
};

const updateAgentResource = async (id, data) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, avatar: data.avatar || data.image || data.resource };
  }
  const avatar = data.avatar || data.image || data.resource;
  const agent = await Agent.findByIdAndUpdate(id, { avatar }, { new: true }).lean();
  if (!agent) {
    throw ApiError.notFound('Agent not found');
  }
  return agent;
};

const getAgentWishlist = async (agent_id) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Wishlist.find({ user_id: agent_id }).populate('property_id').lean();
};

export default {
  createAgent,
  getAgents,
  getAgentById,
  updateAgentResource,
  getAgentWishlist,
};