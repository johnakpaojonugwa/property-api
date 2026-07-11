import express from 'express';
import validate from '../middlewares/validate.js';
import { createAgentSchema } from '../validators/agent.validator.js';
import agentController from '../controllers/agent.controller.js';

const router = express.Router();

router.post('/agents', validate(createAgentSchema), agentController.createAgent);

export default router;
