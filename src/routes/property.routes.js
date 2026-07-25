import express from 'express';
import validate from '../middlewares/validate.js';
import { optionalAuthenticate } from '../middlewares/authenticate.js';
import propertyController from '../controllers/property.controller.js';
import { createPropertySchema } from '../validators/property.validator.js';

const router = express.Router();

router.get('/properties', optionalAuthenticate, propertyController.getProperties);
router.post('/properties/buy', optionalAuthenticate, propertyController.buyProperty);
router.get('/properties/:property_id', optionalAuthenticate, propertyController.getPropertyById);
router.post('/properties', optionalAuthenticate, validate(createPropertySchema), propertyController.createProperty);
router.put('/properties/:property_id', optionalAuthenticate, propertyController.updateProperty);
router.put('/properties/:property_id/resource', optionalAuthenticate, propertyController.updatePropertyResource);
router.put('/properties/:property_id/set-verified', optionalAuthenticate, propertyController.setVerified);
router.delete('/properties/:property_id', optionalAuthenticate, propertyController.deleteProperty);

export default router;
