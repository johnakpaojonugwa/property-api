import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import propertyService from '../services/property.service.js';

const createProperty = asyncHandler(async (req, res) => {
  const property = {
    ...req.body,
    is_verified: false,
    is_sold: false,
  };

  const createdProperty = await propertyService.createProperty(property, req.actor);
  return res.status(201).json(ApiResponse.success(createdProperty, 'Property created'));
});

const getProperties = asyncHandler(async (req, res) => {
  const properties = await propertyService.getProperties(req.query);
  return res.status(200).json(ApiResponse.success(properties, 'Properties retrieved'));
});

const getPropertyById = asyncHandler(async (req, res) => {
  const id = req.params.property_id || req.params.id;
  const property = await propertyService.getPropertyById(id);
  return res.status(200).json(ApiResponse.success(property, 'Property retrieved'));
});

const updateProperty = asyncHandler(async (req, res) => {
  const id = req.params.property_id || req.params.id;
  const updated = await propertyService.updateProperty(id, req.body, req.actor);
  return res.status(200).json(ApiResponse.success(updated, 'Property updated'));
});

const updatePropertyResource = asyncHandler(async (req, res) => {
  const id = req.params.property_id || req.params.id;
  const updated = await propertyService.updatePropertyResources(id, req.body, req.actor);
  return res.status(200).json(ApiResponse.success(updated, 'Property resources updated'));
});

const setVerified = asyncHandler(async (req, res) => {
  const id = req.params.property_id || req.params.id;
  const { is_verified } = req.body;
  const updated = await propertyService.setVerified(id, is_verified, req.actor);
  return res.status(200).json(ApiResponse.success(updated, 'Property verification status updated'));
});

const buyProperty = asyncHandler(async (req, res) => {
  const { property_id, user_id } = req.body;
  const result = await propertyService.buyProperty(property_id, user_id, req.actor);
  return res.status(200).json(ApiResponse.success(result, 'Property bought successfully'));
});

const deleteProperty = asyncHandler(async (req, res) => {
  const id = req.params.property_id || req.params.id;
  const deleted = await propertyService.deleteProperty(id, req.actor);
  return res.status(200).json(ApiResponse.success(deleted, 'Property deleted'));
});

export default {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  updatePropertyResource,
  setVerified,
  buyProperty,
  deleteProperty,
};
