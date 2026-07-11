import express from 'express';
import validate from '../middlewares/validate.js';
import propertyController from '../controllers/property.controller.js';
import { createPropertySchema } from '../validators/property.validator.js';

const router = express.Router();

router.post('/properties', validate(createPropertySchema), propertyController.createProperty);
router.get('/properties', propertyController.getProperties);

export default router;
