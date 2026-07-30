import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import merchantService from '../services/merchant.service.js';
import agentService from '../services/agent.service.js';

const createMerchant = asyncHandler(async (req, res) => {
  const merchant = await merchantService.createMerchant(req.body);
  return res.status(201).json(ApiResponse.success(merchant, 'Merchant created'));
});

const getMerchants = asyncHandler(async (req, res) => {
  const merchants = await merchantService.getMerchants();
  return res.status(200).json(ApiResponse.success(merchants, 'Merchants retrieved'));
});

const getMerchantAgents = asyncHandler(async (req, res) => {
  const merchant_id = req.params.merchant_id || req.query.merchant_id || req.actor?.id;
  const agents = await merchantService.getMerchantAgents(merchant_id, req.query);
  return res.status(200).json(ApiResponse.success(agents, 'Agents retrieved'));
});

const getMerchantWishlist = asyncHandler(async (req, res) => {
  const merchant_id = req.params.merchant_id;
  const wishlist = await merchantService.getMerchantWishlist(merchant_id);
  return res.status(200).json(ApiResponse.success(wishlist, 'Merchant wishlist retrieved'));
});

const createAgentByMerchant = asyncHandler(async (req, res) => {
  const agentData = { ...req.body, merchant: req.actor?.id };
  const agent = await agentService.createAgent(agentData, req.actor);
  return res.status(201).json(ApiResponse.success(agent, 'Agent created by merchant'));
});

const verifyAgent = asyncHandler(async (req, res) => {
  const { agent_id, is_verified } = req.body;
  const updatedAgent = await merchantService.verifyAgent(agent_id, is_verified, req.actor);
  return res.status(200).json(ApiResponse.success(updatedAgent, 'Agent verification status updated'));
});

export default {
  createMerchant,
  getMerchants,
  getMerchantAgents,
  getMerchantWishlist,
  createAgentByMerchant,
  verifyAgent,
};
