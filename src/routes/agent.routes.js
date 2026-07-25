import express from 'express';
import validate from '../middlewares/validate.js';
import { optionalAuthenticate } from '../middlewares/authenticate.js';
import { createAgentSchema } from '../validators/agent.validator.js';
import agentController from '../controllers/agent.controller.js';

const router = express.Router();

router.get('/agents', optionalAuthenticate, agentController.getAgents);
router.get('/agents/:agent_id/wishlist', optionalAuthenticate, agentController.getAgentWishlist);
router.post('/agents', optionalAuthenticate, validate(createAgentSchema), agentController.createAgent);
router.put('/agents/:agent_id/resource', optionalAuthenticate, agentController.updateAgentResource);
router.delete('/agents/:agent_id', optionalAuthenticate, agentController.deleteAgent);

export default router;
