import express from 'express';
import validate from '../middlewares/validate.js';
import { createMerchantSchema } from '../validators/merchant.validator.js';
import merchantController from '../controllers/merchant.controller.js';

const router = express.Router();

router.post('/merchants', validate(createMerchantSchema), merchantController.createMerchant);

export default router;
