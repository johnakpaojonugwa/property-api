import bcrypt from 'bcryptjs';
import Merchant from '../models/merchant.model.js';
import ApiError from '../utils/ApiError.js';

const createMerchant = async (data) => {
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
  return merchant.toObject({ versionKey: false });
};

const getMerchantById = async (id) => {
  const merchant = await Merchant.findById(id).lean();
  if (!merchant) {
    throw ApiError.notFound('Merchant not found');
  }
  return merchant;
};

export default {
  createMerchant,
  getMerchantById,
};