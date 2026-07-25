import mongoose from 'mongoose';
import Property from '../models/property.model.js';
import ApiError from '../utils/ApiError.js';

const buildFilters = (query = {}) => {
  const filters = {};

  if (query.city) {
    filters.city = query.city;
  }

  if (query.verified !== undefined) {
    filters.is_verified = query.verified === 'true' || query.verified === true;
  }

  if (query.agent) {
    filters.agent = query.agent;
  }

  if (query.merchant) {
    filters.merchant = query.merchant;
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.property_use) {
    filters.property_use = query.property_use;
  }

  if (query.type) {
    filters.type = query.type;
  }

  return filters;
};

const normalizePagination = (query = {}) => {
  const page = Number.parseInt(query.page ?? '0', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);

  return {
    page: Number.isNaN(page) || page < 0 ? 0 : page,
    limit: Number.isNaN(limit) || limit <= 0 ? 10 : Math.min(limit, 100),
  };
};

const createProperty = async (data) => {
  const property = await Property.create(data);
  return property.toObject({ versionKey: false });
};

const getProperties = async (query = {}) => {
  const filters = buildFilters(query);
  const { page, limit } = normalizePagination(query);
  const skip = page * limit;

  if (mongoose.connection.readyState !== 1) {
    return {
      data: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }

  try {
    const [properties, total] = await Promise.all([
      Property.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(filters),
    ]);

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return {
      data: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
};

const getPropertyById = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('Property not found');
  }

  try {
    const property = await Property.findById(id).lean();
    if (!property) {
      throw ApiError.notFound('Property not found');
    }
    return property;
  } catch (error) {
    throw ApiError.notFound('Property not found');
  }
};

const updateProperty = async (id, data) => {
  const updated = await Property.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Property not found');
  }
  return updated;
};

const updatePropertyResources = async (id, imagesData) => {
  const images = Array.isArray(imagesData) ? imagesData : [imagesData.images || imagesData].flat();
  const maxImages = images.slice(0, 5);
  const updated = await Property.findByIdAndUpdate(id, { images: maxImages }, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Property not found');
  }
  return updated;
};

const setVerified = async (id, is_verified) => {
  const updated = await Property.findByIdAndUpdate(id, { is_verified }, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Property not found');
  }
  return updated;
};

const buyProperty = async (property_id, user_id) => {
  const property = await Property.findByIdAndUpdate(property_id, { is_sold: true }, { new: true }).lean();
  if (!property) {
    throw ApiError.notFound('Property not found');
  }
  return { property_id, user_id, status: 'BOUGHT', property };
};

const deleteProperty = async (id) => {
  const deleted = await Property.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw ApiError.notFound('Property not found');
  }
  return deleted;
};

export default {
  buildFilters,
  normalizePagination,
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  updatePropertyResources,
  setVerified,
  buyProperty,
  deleteProperty,
};
