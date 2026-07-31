import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import adminService from '../services/admin.service.js';

const getDashboard = asyncHandler(async (req, res) => {
  const result = await adminService.getDashboard();
  return res.status(200).json(ApiResponse.success(result, 'Dashboard data retrieved'));
});

const getMetrics = asyncHandler(async (req, res) => {
  const result = await adminService.getMetrics();
  return res.status(200).json(ApiResponse.success(result, 'Metrics retrieved'));
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  return res.status(200).json(ApiResponse.success(result, 'Users retrieved'));
});

const searchUsers = asyncHandler(async (req, res) => {
  const result = await adminService.searchUsers(req.query);
  return res.status(200).json(ApiResponse.success(result, 'Users search results'));
});

const getUserDetail = asyncHandler(async (req, res) => {
  const result = await adminService.getUserDetail(req.params.id);
  return res.status(200).json(ApiResponse.success(result, 'User detail retrieved'));
});

const updateUser = asyncHandler(async (req, res) => {
  const result = await adminService.updateUser(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result, 'User updated'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await adminService.deleteUser(req.params.id);
  return res.status(200).json(ApiResponse.success(result, 'User deleted'));
});

const banUser = asyncHandler(async (req, res) => {
  const { reason, duration } = req.body;
  const result = await adminService.banUser(req.params.id, reason, duration);
  return res.status(200).json(ApiResponse.success(result, 'User banned'));
});

const unbanUser = asyncHandler(async (req, res) => {
  const result = await adminService.unbanUser(req.params.id);
  return res.status(200).json(ApiResponse.success(result, 'User unbanned'));
});

const manageRoles = asyncHandler(async (req, res) => {
  const result = await adminService.manageRoles(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result, 'User role/permissions updated'));
});

const getProperties = asyncHandler(async (req, res) => {
  const result = await adminService.getProperties(req.query);
  return res.status(200).json(ApiResponse.success(result, 'Properties retrieved'));
});

const approveProperty = asyncHandler(async (req, res) => {
  const result = await adminService.approveProperty(req.params.id, req.body.notes);
  return res.status(200).json(ApiResponse.success(result, 'Property approved'));
});

const rejectProperty = asyncHandler(async (req, res) => {
  const result = await adminService.rejectProperty(req.params.id, req.body.reason);
  return res.status(200).json(ApiResponse.success(result, 'Property rejected'));
});

const flagProperty = asyncHandler(async (req, res) => {
  const result = await adminService.flagProperty(req.params.id, req.body.reason);
  return res.status(200).json(ApiResponse.success(result, 'Property flagged'));
});

const getFlaggedContent = asyncHandler(async (req, res) => {
  const result = await adminService.getFlaggedContent(req.query);
  return res.status(200).json(ApiResponse.success(result, 'Flagged content retrieved'));
});

const manageModerationRules = asyncHandler(async (req, res) => {
  const result = await adminService.manageModerationRules(req.body);
  return res.status(200).json(ApiResponse.success(result, 'Moderation rule created'));
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  return res.status(200).json(ApiResponse.success(result, 'Audit logs retrieved'));
});

const getReports = asyncHandler(async (req, res) => {
  const result = await adminService.getReports(req.query);
  return res.status(200).json(ApiResponse.success(result, 'Reports retrieved'));
});

const generateReports = asyncHandler(async (req, res) => {
  const result = await adminService.generateReports(req.body);
  return res.status(200).json(ApiResponse.success(result, 'Report generated'));
});

const exportReport = asyncHandler(async (req, res) => {
  const result = await adminService.exportReport(req.params.id, req.query);
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.csv"`);
    return res.status(200).send(result.content);
  }
  return res.status(200).json(ApiResponse.success(result, 'Report exported'));
});

const updateConfig = asyncHandler(async (req, res) => {
  const result = await adminService.updateConfig(req.body);
  return res.status(200).json(ApiResponse.success(result, 'System configuration updated'));
});

const getSystemStatus = asyncHandler(async (req, res) => {
  const result = await adminService.getSystemStatus();
  return res.status(200).json(ApiResponse.success(result, 'System status retrieved'));
});

const updateFeatureFlags = asyncHandler(async (req, res) => {
  const result = await adminService.updateFeatureFlags(req.body);
  return res.status(200).json(ApiResponse.success(result, 'Feature flags updated'));
});

const getFeatureFlags = asyncHandler(async (req, res) => {
  const result = await adminService.getFeatureFlags();
  return res.status(200).json(ApiResponse.success(result, 'Feature flags retrieved'));
});

const createBackup = asyncHandler(async (req, res) => {
  const result = await adminService.createBackup(req.body);
  return res.status(200).json(ApiResponse.success(result, 'Backup initiated'));
});

const listBackups = asyncHandler(async (req, res) => {
  const result = await adminService.listBackups();
  return res.status(200).json(ApiResponse.success(result, 'Backups list retrieved'));
});

const restoreBackup = asyncHandler(async (req, res) => {
  const result = await adminService.restoreBackup(req.params.id, req.body.confirm);
  return res.status(200).json(ApiResponse.success(result, 'Backup restore completed'));
});

const manageEmailTemplates = asyncHandler(async (req, res) => {
  const result = await adminService.manageEmailTemplates(req.body);
  return res.status(200).json(ApiResponse.success(result, 'Email template created'));
});

const sendTestEmail = asyncHandler(async (req, res) => {
  const result = await adminService.sendTestEmail(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result, 'Test email sent'));
});

const manageApiKeys = asyncHandler(async (req, res) => {
  const result = await adminService.manageApiKeys(req.body);
  return res.status(200).json(ApiResponse.success(result, 'API key generated'));
});

const revokeApiKey = asyncHandler(async (req, res) => {
  const result = await adminService.revokeApiKey(req.params.id);
  return res.status(200).json(ApiResponse.success(result, 'API key revoked'));
});

const getApiKeyUsage = asyncHandler(async (req, res) => {
  const result = await adminService.getApiKeyUsage(req.params.id, req.query);
  return res.status(200).json(ApiResponse.success(result, 'API key usage retrieved'));
});

const manageWebhooks = asyncHandler(async (req, res) => {
  const result = await adminService.manageWebhooks(req.body);
  return res.status(200).json(ApiResponse.success(result, 'Webhook registered'));
});

const testWebhook = asyncHandler(async (req, res) => {
  const result = await adminService.testWebhook(req.params.id);
  return res.status(200).json(ApiResponse.success(result, 'Webhook test completed'));
});

const getWebhookLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getWebhookLogs(req.params.id, req.query);
  return res.status(200).json(ApiResponse.success(result, 'Webhook logs retrieved'));
});

const getHealth = asyncHandler(async (req, res) => {
  const result = await adminService.getHealth();
  return res.status(200).json(ApiResponse.success(result, 'Health status retrieved'));
});

const getSystemLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getSystemLogs(req.query);
  return res.status(200).json(ApiResponse.success(result, 'System logs retrieved'));
});

const manageRateLimits = asyncHandler(async (req, res) => {
  const result = await adminService.manageRateLimits(req.body);
  return res.status(200).json(ApiResponse.success(result, 'Rate limits updated'));
});

const getRateLimitsStats = asyncHandler(async (req, res) => {
  const result = await adminService.getRateLimitsStats();
  return res.status(200).json(ApiResponse.success(result, 'Rate limits stats retrieved'));
});

const banIp = asyncHandler(async (req, res) => {
  const result = await adminService.banIp(req.body);
  return res.status(200).json(ApiResponse.success(result, 'IP banned'));
});

const unbanIp = asyncHandler(async (req, res) => {
  const result = await adminService.unbanIp(req.params.id);
  return res.status(200).json(ApiResponse.success(result, 'IP unbanned'));
});

const getAnalytics = asyncHandler(async (req, res) => {
  const result = await adminService.getAnalytics(req.query);
  return res.status(200).json(ApiResponse.success(result, 'Analytics retrieved'));
});

const verifyMerchant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_verified } = req.body;
  const result = await adminService.verifyMerchant(id, is_verified);
  return res.status(200).json(ApiResponse.success(result, 'Merchant verification status updated'));
});

export default {
  getDashboard,
  getMetrics,
  listUsers,
  searchUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  manageRoles,
  getProperties,
  approveProperty,
  rejectProperty,
  flagProperty,
  getFlaggedContent,
  manageModerationRules,
  getAuditLogs,
  getReports,
  generateReports,
  exportReport,
  updateConfig,
  getSystemStatus,
  updateFeatureFlags,
  getFeatureFlags,
  createBackup,
  listBackups,
  restoreBackup,
  manageEmailTemplates,
  sendTestEmail,
  manageApiKeys,
  revokeApiKey,
  getApiKeyUsage,
  manageWebhooks,
  testWebhook,
  getWebhookLogs,
  getHealth,
  getSystemLogs,
  manageRateLimits,
  getRateLimitsStats,
  banIp,
  unbanIp,
  getAnalytics,
  verifyMerchant,
};
