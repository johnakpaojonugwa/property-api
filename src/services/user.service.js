import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Wishlist from '../models/wishlist.model.js';
import Property from '../models/property.model.js';
import Appointment from '../models/appointment.model.js';
import Agent from '../models/agent.model.js';
import ApiError from '../utils/ApiError.js';
import compressImage from '../utils/imageCompressor.js';
import uploadToCloudinary from '../utils/cloudinary.js';

const createUser = async (data, actor) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-user-id', ...data };
  }
  const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw ApiError.conflict('User already exists');
  }

  const payload = { ...data };

  // Prevent privilege escalation: only ADMIN can set custom roles
  if (!actor || actor.role !== 'ADMIN') {
    payload.role = 'USER';
  } else if (payload.role) {
    payload.role = payload.role.toUpperCase();
  }

  // Link client to agent and/or merchant based on creator
  if (actor) {
    if (actor.role === 'AGENT') {
      payload.agent = actor.id;
      const agentProfile = await Agent.findById(actor.id).lean();
      if (agentProfile && agentProfile.merchant) {
        payload.merchant = agentProfile.merchant.toString();
      }
    } else if (actor.role === 'MERCHANT') {
      payload.merchant = actor.id;
    }
  }

  if (payload.password && !payload.password_hash) {
    payload.password_hash = await bcrypt.hash(payload.password, 10);
    delete payload.password;
  } else if (payload.password_hash && !payload.password_hash.startsWith('$2a$') && !payload.password_hash.startsWith('$2b$')) {
    payload.password_hash = await bcrypt.hash(payload.password_hash, 10);
  }

  const user = await User.create(payload);
  return user.toObject({ versionKey: false });
};

const getUsers = async (query = {}, actor) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  const page = Number.parseInt(query.page ?? '0', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);
  const skip = page * limit;

  let filter = {};
  if (actor) {
    if (actor.role === 'AGENT') {
      const appointments = await Appointment.find({ agent_id: actor.id }).select('user_id').lean();
      const clientIds = appointments.map((a) => a.user_id);
      filter = {
        role: { $nin: ['ADMIN', 'admin'] },
        $or: [
          { agent: actor.id },
          { _id: { $in: clientIds } },
        ],
      };
    } else if (actor.role === 'MERCHANT') {
      filter = {
        role: { $nin: ['ADMIN', 'admin'] },
        merchant: actor.id,
      };
    }
  }

  return await User.find(filter).skip(skip).limit(limit).lean();
};

const verifyUserAccess = async (targetUser, actor) => {
  if (!actor) return false;

  // Admins always have access
  if (actor.role === 'ADMIN') return true;

  // Users always have access to their own data
  const isSelf = targetUser._id.toString() === actor.id;
  if (isSelf) return true;

  // Non-admins cannot see admins
  const isTargetAdmin = targetUser.role === 'ADMIN' || targetUser.role === 'admin';
  if (isTargetAdmin) return false;

  // Merchant access check: target user's merchant matches merchant's ID
  if (actor.role === 'MERCHANT') {
    return targetUser.merchant && targetUser.merchant.toString() === actor.id;
  }

  // Agent access check: target user's agent matches agent's ID OR there is an active appointment
  if (actor.role === 'AGENT') {
    const isCreatedByAgent = targetUser.agent && targetUser.agent.toString() === actor.id;
    if (isCreatedByAgent) return true;

    const hasAppointment = await Appointment.exists({ user_id: targetUser._id, agent_id: actor.id });
    if (hasAppointment) return true;
  }

  return false;
};

const getUserById = async (id, actor) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('User not found');
  }
  const user = await User.findById(id).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  const hasAccess = await verifyUserAccess(user, actor);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have permission to view this user information');
  }
  return user;
};

const getUserWishlist = async (user_id, actor) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  const user = await User.findById(user_id).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  const hasAccess = await verifyUserAccess(user, actor);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have permission to view this wishlist');
  }
  return await Wishlist.find({ user_id }).populate('property_id').lean();
};

const getUserProperties = async (user_id, actor) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  const user = await User.findById(user_id).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  const hasAccess = await verifyUserAccess(user, actor);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have permission to view these properties');
  }
  return await Property.find({ $or: [{ agent: user_id }, { merchant: user_id }] }).lean();
};

const updateUser = async (id, data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, ...data };
  }
  const targetUser = await User.findById(id).lean();
  if (!targetUser) {
    throw ApiError.notFound('User not found');
  }
  const hasAccess = await verifyUserAccess(targetUser, actor);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have permission to update this user');
  }
  // Sanitize updating roles or custom associations for non-admins
  if (actor.role !== 'ADMIN') {
    delete data.role;
    delete data.type;
    delete data.agent;
    delete data.merchant;
  }
  const updated = await User.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  if (!updated) {
    throw ApiError.notFound('User not found');
  }
  return updated;
};

const updateUserResource = async (id, data = {}, file = null, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, avatar: '' };
  }
  const targetUser = await User.findById(id).lean();
  if (!targetUser) {
    throw ApiError.notFound('User not found');
  }
  const hasAccess = await verifyUserAccess(targetUser, actor);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have permission to update this user resource');
  }

  let avatarUrl = data.avatar || data.image || data.resource || '';

  if (file && (file.buffer || Buffer.isBuffer(file))) {
    const inputBuffer = file.buffer || file;
    const { buffer } = await compressImage(inputBuffer, { maxWidth: 800, quality: 80, format: 'webp' });
    avatarUrl = await uploadToCloudinary(buffer, 'users/avatars');
  }

  const updated = await User.findByIdAndUpdate(id, { avatar: avatarUrl }, { returnDocument: 'after' }).lean();
  if (!updated) {
    throw ApiError.notFound('User not found');
  }
  return updated;
};

const deleteUser = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }
  const targetUser = await User.findById(id).lean();
  if (!targetUser) {
    throw ApiError.notFound('User not found');
  }
  const hasAccess = await verifyUserAccess(targetUser, actor);
  if (!hasAccess) {
    throw ApiError.forbidden('You do not have permission to delete this user');
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