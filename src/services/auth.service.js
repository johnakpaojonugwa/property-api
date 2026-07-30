import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Agent from '../models/agent.model.js';
import Merchant from '../models/merchant.model.js';
import Token from '../models/token.model.js';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const createJwt = (payload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });

const login = async ({ email, password, actor_type }) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const normalizedEmail = email.toLowerCase().trim();
  let principal = null;
  let resolvedActorType = actor_type;

  if (!actor_type || actor_type === 'USER') {
    principal = await User.findOne({ email: normalizedEmail }).select('+password_hash');
    if (principal && !actor_type) {
      resolvedActorType = 'USER';
    }
  }

  if (!principal && actor_type !== 'USER') {
    if (actor_type === 'AGENT') {
      principal = await Agent.findOne({ email: normalizedEmail }).select('+password_hash');
      resolvedActorType = 'AGENT';
    } else if (actor_type === 'MERCHANT') {
      principal = await Merchant.findOne({ email: normalizedEmail }).select('+password_hash');
      resolvedActorType = 'MERCHANT';
    } else if (!actor_type) {
      principal = await Agent.findOne({ email: normalizedEmail }).select('+password_hash');
      if (principal) {
        resolvedActorType = 'AGENT';
      } else {
        principal = await Merchant.findOne({ email: normalizedEmail }).select('+password_hash');
        if (principal) {
          resolvedActorType = 'MERCHANT';
        }
      }
    }
  }

  if (!principal) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(password, principal.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const jwtPayload = {
    id: principal._id.toString(),
    actor_type: resolvedActorType || principal.role || 'USER',
    role: resolvedActorType || principal.role || 'USER',
  };

  if (resolvedActorType === 'AGENT' && principal.merchant) {
    jwtPayload.merchant_id = principal.merchant.toString();
  }

  const token = createJwt(jwtPayload);

  const userObj = principal.toObject();
  delete userObj.password_hash;

  return {
    token,
    role: resolvedActorType || 'USER',
    user: userObj,
  };
};

const verifyToken = async (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw ApiError.unauthorized('Invalid token');
  }
};

const storeToken = async (email, token) => {
  const expires_at = new Date(Date.now() + 60 * 60 * 1000);
  const saved = await Token.create({ email: email.toLowerCase().trim(), token, expires_at });
  return saved.toObject({ versionKey: false });
};

const createGuestToken = async () => {
  const token = createJwt({ role: 'GUEST', is_public: true });
  return { token };
};

export default {
  login,
  verifyToken,
  storeToken,
  createGuestToken,
};