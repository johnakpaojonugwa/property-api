import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

const createUser = async (data) => {
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

const getUserById = async (id) => {
  const user = await User.findById(id).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

export default {
  createUser,
  getUserById,
};