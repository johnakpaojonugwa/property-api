import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import { createAgentSchema } from '../validators/agent.validator.js';
import agentController from '../controllers/agent.controller.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/agents', optionalAuthenticate, agentController.getAgents);
router.get('/agents/:agent_id/wishlist', authenticate, agentController.getAgentWishlist);
router.post('/agents', optionalAuthenticate, validate(createAgentSchema), agentController.createAgent);
router.put('/agents/:agent_id/resource', authenticate, uploadSingle('resource'), agentController.updateAgentResource);
router.delete('/agents/:agent_id', authenticate, agentController.deleteAgent);

export default router;
