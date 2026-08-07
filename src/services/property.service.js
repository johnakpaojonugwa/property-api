import mongoose from 'mongoose';
import Property from '../models/property.model.js';
import Agent from '../models/agent.model.js';
import ApiError from '../utils/ApiError.js';
import compressImage from '../utils/imageCompressor.js';
import uploadToCloudinary from '../utils/cloudinary.js';
import redisService from './redis.service.js';
import { getOrSetCache } from '../utils/cacheHelper.js';

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

const createProperty = async (data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (actor.role === 'AGENT') {
    data.agent = actor.id;
    data.merchant = actor.merchant_id || undefined;
  } else if (actor.role === 'MERCHANT') {
    const agent = await Agent.findById(data.agent);
    if (!agent || agent.merchant?.toString() !== actor.id) {
      throw ApiError.forbidden('The specified agent does not belong to your merchant organization');
    }
    data.merchant = actor.id;
  } else if (actor.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to create a property listing');
  }

  const property = await Property.create(data);

  // Invalidate property list cache on new listings
  redisService.invalidateTag('properties:list').catch((err) =>
    console.error('Failed to invalidate properties list cache on creation:', err)
  );

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

  const cacheKey = `properties:list:${JSON.stringify(filters)}:${page}:${limit}`;

  try {
    return await getOrSetCache(
      cacheKey,
      async () => {
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
      },
      { ttl: 3600, tags: ['properties:list'] }
    );
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

  const cacheKey = `property:id:${id}`;

  try {
    const property = await getOrSetCache(
      cacheKey,
      async () => {
        const doc = await Property.findById(id).lean();
        if (!doc) {
          throw ApiError.notFound('Property not found');
        }
        return doc;
      },
      { ttl: 3600 }
    );
    return property;
  } catch (error) {
    throw ApiError.notFound('Property not found');
  }
};

const updateProperty = async (id, data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id, ...data };
  }

  const property = await Property.findById(id);
  if (!property) {
    throw ApiError.notFound('Property not found');
  }

  const isAgentOwner = property.agent.toString() === actor.id;
  const isMerchantOwner = actor.role === 'MERCHANT' && property.merchant?.toString() === actor.id;
  const isAdmin = actor.role === 'ADMIN';

  if (!isAgentOwner && !isMerchantOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to modify this property listing');
  }

  if (!isAdmin) {
    delete data.is_verified;
  }

  const updated = await Property.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  if (updated) {
    Promise.all([
      redisService.del(`property:id:${id}`),
      redisService.invalidateTag('properties:list'),
    ]).catch((err) => console.error('Failed to invalidate cache after property update:', err));
  }
  return updated;
};

const updatePropertyResources = async (id, imagesData = {}, files = null, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }

  let uploadedImages = [];

  const fileList = Array.isArray(files) ? files : files ? [files] : [];
  if (fileList.length > 0) {
    for (const fileItem of fileList) {
      const inputBuffer = fileItem.buffer || (Buffer.isBuffer(fileItem) ? fileItem : null);
      if (inputBuffer) {
        const { buffer } = await compressImage(inputBuffer, { maxWidth: 1200, quality: 80, format: 'webp' });
        const url = await uploadToCloudinary(buffer, 'properties/images');
        uploadedImages.push(url);
      }
    }
  }

  if (uploadedImages.length === 0) {
    const imagesVal = imagesData.images || imagesData.image || imagesData.resource || imagesData;
    uploadedImages = Array.isArray(imagesVal) ? imagesVal : typeof imagesVal === 'string' && imagesVal ? [imagesVal] : [];
  }

  const maxImages = uploadedImages.slice(0, 5);

  if (mongoose.connection.readyState !== 1) {
    return { _id: id, images: maxImages };
  }

  const property = await Property.findById(id);
  if (!property) {
    throw ApiError.notFound('Property not found');
  }

  const isAgentOwner = property.agent.toString() === actor.id;
  const isMerchantOwner = actor.role === 'MERCHANT' && property.merchant?.toString() === actor.id;
  const isAdmin = actor.role === 'ADMIN';

  if (!isAgentOwner && !isMerchantOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to modify this property listing');
  }

  const updated = await Property.findByIdAndUpdate(id, { images: maxImages }, { returnDocument: 'after' }).lean();
  if (updated) {
    Promise.all([
      redisService.del(`property:id:${id}`),
      redisService.invalidateTag('properties:list'),
    ]).catch((err) => console.error('Failed to invalidate cache after property resource update:', err));
  }
  return updated;
};

const setVerified = async (id, is_verified, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (actor.role !== 'ADMIN') {
    throw ApiError.forbidden('Only administrators can verify properties');
  }
  const updated = await Property.findByIdAndUpdate(id, { is_verified }, { returnDocument: 'after' }).lean();
  if (!updated) {
    throw ApiError.notFound('Property not found');
  }
  Promise.all([
    redisService.del(`property:id:${id}`),
    redisService.invalidateTag('properties:list'),
  ]).catch((err) => console.error('Failed to invalidate cache after property verification:', err));
  return updated;
};

const buyProperty = async (property_id, user_id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (actor.role !== 'USER') {
    throw ApiError.forbidden('Only regular users can buy properties');
  }
  if (user_id !== actor.id) {
    throw ApiError.forbidden('You can only buy properties for yourself');
  }
  if (mongoose.connection.readyState !== 1) {
    return { property_id, user_id, status: 'BOUGHT' };
  }
  const property = await Property.findByIdAndUpdate(property_id, { is_sold: true }, { returnDocument: 'after' }).lean();
  if (!property) {
    throw ApiError.notFound('Property not found');
  }
  Promise.all([
    redisService.del(`property:id:${property_id}`),
    redisService.invalidateTag('properties:list'),
  ]).catch((err) => console.error('Failed to invalidate cache after property purchase:', err));
  return { property_id, user_id, status: 'BOUGHT', property };
};

const deleteProperty = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }

  const property = await Property.findById(id);
  if (!property) {
    throw ApiError.notFound('Property not found');
  }

  const isAgentOwner = property.agent.toString() === actor.id;
  const isMerchantOwner = actor.role === 'MERCHANT' && property.merchant?.toString() === actor.id;
  const isAdmin = actor.role === 'ADMIN';

  
  if (!isAgentOwner && !isMerchantOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this property');
  }

  const deleted = await Property.findByIdAndDelete(id).lean();
  if (deleted) {
    Promise.all([
      redisService.del(`property:id:${id}`),
      redisService.invalidateTag('properties:list'),
    ]).catch((err) => console.error('Failed to invalidate cache after property deletion:', err));
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
