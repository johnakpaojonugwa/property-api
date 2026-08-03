import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import propertyController from '../controllers/property.controller.js';
import { createPropertySchema, updatePropertySchema } from '../validators/property.validator.js';
import { uploadArray } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/properties', optionalAuthenticate, propertyController.getProperties);
router.post('/properties/buy', authenticate, authorize(['USER']), propertyController.buyProperty);
router.get('/properties/:property_id', optionalAuthenticate, propertyController.getPropertyById);
router.post('/properties', authenticate, authorize(['AGENT', 'MERCHANT', 'ADMIN']), validate(createPropertySchema), propertyController.createProperty);
router.put('/properties/:property_id', authenticate, authorize(['AGENT', 'MERCHANT', 'ADMIN']), validate(updatePropertySchema), propertyController.updateProperty);
router.put('/properties/:property_id/resource', authenticate, authorize(['AGENT', 'MERCHANT', 'ADMIN']), uploadArray('images', 5), propertyController.updatePropertyResource);
router.put('/properties/:property_id/set-verified', authenticate, authorize(['ADMIN']), propertyController.setVerified);
router.delete('/properties/:property_id', authenticate, authorize(['AGENT', 'MERCHANT', 'ADMIN']), propertyController.deleteProperty);

export default router;
