import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { createMerchantSchema, verifyAgentSchema } from '../validators/merchant.validator.js';
import { createAgentSchema } from '../validators/agent.validator.js';
import merchantController from '../controllers/merchant.controller.js';

const router = express.Router();

router.get('/merchants', optionalAuthenticate, merchantController.getMerchants);
router.get('/merchants/agents', optionalAuthenticate, merchantController.getMerchantAgents);
router.get('/merchants/:merchant_id/wishlist', authenticate, authorize(['MERCHANT', 'ADMIN']), merchantController.getMerchantWishlist);
router.post('/merchants', validate(createMerchantSchema), merchantController.createMerchant);
router.post('/merchants/agents', authenticate, authorize(['MERCHANT', 'ADMIN']), validate(createAgentSchema), merchantController.createAgentByMerchant);
router.post('/merchants/verify-agent', authenticate, authorize(['MERCHANT', 'ADMIN']), validate(verifyAgentSchema), merchantController.verifyAgent);

export default router;
