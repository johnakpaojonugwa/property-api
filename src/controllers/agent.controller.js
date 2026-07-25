import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import agentService from '../services/agent.service.js';

const createAgent = asyncHandler(async (req, res) => {
  const agent = await agentService.createAgent(req.body);
  return res.status(201).json(ApiResponse.success(agent, 'Agent created'));
});

export default { createAgent };
