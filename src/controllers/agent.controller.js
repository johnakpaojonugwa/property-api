import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import agentService from '../services/agent.service.js';

const createAgent = asyncHandler(async (req, res) => {
  const agent = await agentService.createAgent(req.body);
  return res.status(201).json(ApiResponse.success(agent, 'Agent created'));
});

const getAgents = asyncHandler(async (req, res) => {
  const agents = await agentService.getAgents(req.query);
  return res.status(200).json(ApiResponse.success(agents, 'Agents retrieved'));
});

const getAgentWishlist = asyncHandler(async (req, res) => {
  const wishlist = await agentService.getAgentWishlist(req.params.agent_id);
  return res.status(200).json(ApiResponse.success(wishlist, 'Agent wishlist retrieved'));
});

const updateAgentResource = asyncHandler(async (req, res) => {
  const updatedAgent = await agentService.updateAgentResource(req.params.agent_id, req.body);
  return res.status(200).json(ApiResponse.success(updatedAgent, 'Agent resource updated'));
});

export default {
  createAgent,
  getAgents,
  getAgentWishlist,
  updateAgentResource,
};
