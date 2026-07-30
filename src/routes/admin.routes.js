import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import adminController from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin endpoints with authentication and ADMIN role check
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Dashboard and metrics
router.get('/admin/dashboard', adminController.getDashboard);
router.get('/admin/metrics', adminController.getMetrics);

// User management
router.get('/admin/users', adminController.listUsers);
router.get('/admin/users/search', adminController.searchUsers);
router.get('/admin/users/:id', adminController.getUserDetail);
router.patch('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);
router.post('/admin/users/:id/ban', adminController.banUser);
router.post('/admin/users/:id/unban', adminController.unbanUser);
router.patch('/admin/users/:id/role', adminController.manageRoles);

// Property moderation
router.get('/admin/properties', adminController.getProperties);
router.post('/admin/properties/:id/approve', adminController.approveProperty);
router.post('/admin/properties/:id/reject', adminController.rejectProperty);
router.post('/admin/properties/:id/flag', adminController.flagProperty);

// Content moderation
router.get('/admin/flagged-content', adminController.getFlaggedContent);
router.post('/admin/moderation-rules', adminController.manageModerationRules);

// Audit logs
router.get('/admin/audit-logs', adminController.getAuditLogs);

// Reports
router.get('/admin/reports', adminController.getReports);
router.post('/admin/reports', adminController.generateReports);
router.get('/admin/reports/:id/export', adminController.exportReport);

// System config and status
router.patch('/admin/config', adminController.updateConfig);
router.get('/admin/system-status', adminController.getSystemStatus);

// Feature flags
router.get('/admin/feature-flags', adminController.getFeatureFlags);
router.patch('/admin/feature-flags', adminController.updateFeatureFlags);

// Backups
router.post('/admin/backups', adminController.createBackup);
router.get('/admin/backups', adminController.listBackups);
router.post('/admin/backups/:id/restore', adminController.restoreBackup);

// Email templates
router.post('/admin/email-templates', adminController.manageEmailTemplates);
router.post('/admin/email-templates/:id/test', adminController.sendTestEmail);

// API keys
router.post('/admin/api-keys', adminController.manageApiKeys);
router.delete('/admin/api-keys/:id', adminController.revokeApiKey);
router.get('/admin/api-keys/:id/usage', adminController.getApiKeyUsage);

// Webhooks
router.post('/admin/webhooks', adminController.manageWebhooks);
router.post('/admin/webhooks/:id/test', adminController.testWebhook);
router.get('/admin/webhooks/:id/logs', adminController.getWebhookLogs);

// System logs and health
router.get('/admin/health', adminController.getHealth);
router.get('/admin/logs', adminController.getSystemLogs);

// Rate limiting
router.patch('/admin/rate-limits', adminController.manageRateLimits);
router.get('/admin/rate-limits/stats', adminController.getRateLimitsStats);

// IP Ban List
router.post('/admin/banned-ips', adminController.banIp);
router.delete('/admin/banned-ips/:id', adminController.unbanIp);

// Analytics
router.get('/admin/analytics', adminController.getAnalytics);

export default router;
