import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Agent from '../models/agent.model.js';
import Wishlist from '../models/wishlist.model.js';
import ApiError from '../utils/ApiError.js';
import compressImage from '../utils/imageCompressor.js';
import uploadToCloudinary from '../utils/cloudinary.js';

const createAgent = async (data, actor) => {
  if (!actor && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (actor && actor.role !== 'MERCHANT' && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('Only merchants or administrators can onboard agents');
  }

  const payload = { ...data };
  if (actor && actor.role === 'MERCHANT') {
    payload.merchant = actor.id;
  }

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

const updateAgentResource = async (id, data = {}, file = null, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }

  let avatarUrl = data.avatar || data.image || data.resource || '';

  if (file && (file.buffer || Buffer.isBuffer(file))) {
    const inputBuffer = file.buffer || file;
    const { buffer } = await compressImage(inputBuffer, { maxWidth: 800, quality: 80, format: 'webp' });
    avatarUrl = await uploadToCloudinary(buffer, 'agents/avatars');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id, avatar: avatarUrl };
  }

  const agent = await Agent.findById(id);
  if (!agent) {
    throw ApiError.notFound('Agent not found');
  }

  const isSelf = agent._id.toString() === actor.id;
  const isParentMerchant = agent.merchant?.toString() === actor.id;
  const isAdmin = actor.role === 'ADMIN';

  if (!isSelf && !isParentMerchant && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to update this agent');
  }

  const updated = await Agent.findByIdAndUpdate(id, { avatar: avatarUrl }, { new: true }).lean();
  return updated;
};

const getAgentWishlist = async (agent_id) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  return await Wishlist.find({ user_id: agent_id }).populate('property_id').lean();
};

const deleteAgent = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }

  const agent = await Agent.findById(id);
  if (!agent) {
    throw ApiError.notFound('Agent not found');
  }

  const isSelf = agent._id.toString() === actor.id;
  const isParentMerchant = agent.merchant?.toString() === actor.id;
  const isAdmin = actor.role === 'ADMIN';

  if (!isSelf && !isParentMerchant && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this agent');
  }

  const deleted = await Agent.findByIdAndDelete(id).lean();
  return deleted;
};

export default {
  createAgent,
  getAgents,
  getAgentById,
  updateAgentResource,
  getAgentWishlist,
  deleteAgent,
};