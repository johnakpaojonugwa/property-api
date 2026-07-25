import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import propertyService from '../services/property.service.js';

const createProperty = asyncHandler(async (req, res) => {
  const property = {
    ...req.body,
    is_verified: false,
    is_sold: false,
  };

  const createdProperty = await propertyService.createProperty(property);
  return res.status(201).json(ApiResponse.success(createdProperty, 'Property created'));
});

const getProperties = asyncHandler(async (req, res) => {
  const properties = await propertyService.getProperties(req.query);
  return res.status(200).json(ApiResponse.success(properties, 'Properties retrieved'));
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  return res.status(200).json(ApiResponse.success(property, 'Property retrieved'));
});

export default { createProperty, getProperties, getPropertyById };
