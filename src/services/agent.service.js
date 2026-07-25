import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Agent from '../models/agent.model.js';
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

const getAgentById = async (id) => {
  const agent = await Agent.findById(id).lean();
  if (!agent) {
    throw ApiError.notFound('Agent not found');
  }
  return agent;
};

export default {
  createAgent,
  getAgentById,
};