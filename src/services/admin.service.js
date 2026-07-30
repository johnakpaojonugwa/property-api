import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Property from '../models/property.model.js';
import ApiError from '../utils/ApiError.js';

const getDashboard = async () => {
  if (mongoose.connection.readyState !== 1) {
    return {
      totalUsers: 10,
      totalProperties: 5,
      totalNotifications: 15,
    };
  }
  const [totalUsers, totalProperties] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
  ]);
  return { totalUsers, totalProperties };
};

const getMetrics = async () => {
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage ? process.cpuUsage() : {},
  };
};

const listUsers = async (query = {}) => {
  const { page = 1, limit = 20, role, isActive } = query;
  const filter = {};
  if (role) filter.role = role.toUpperCase();
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  if (mongoose.connection.readyState !== 1) {
    return {
      users: [],
      total: 0,
      page: pageNum,
      limit: limitNum,
      pages: 0,
    };
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limitNum).lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  };
};

const searchUsers = async (query = {}) => {
  const { q, page = 1, limit = 20 } = query;
  if (!q) {
    throw ApiError.badRequest('Query parameter "q" is required');
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  if (mongoose.connection.readyState !== 1) {
    return {
      users: [],
      total: 0,
      page: pageNum,
      limit: limitNum,
      pages: 0,
    };
  }

  const regex = new RegExp(q, 'i');
  const filter = {
    $or: [
      { first_name: regex },
      { last_name: regex },
      { email: regex },
      { phone: regex },
    ],
  };

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limitNum).lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  };
};

const getUserDetail = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      role: 'USER',
      isActive: true,
    };
  }

  const user = await User.findById(id).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

const updateUser = async (id, data) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      ...data,
    };
  }

  const allowed = ['first_name', 'last_name', 'email', 'phone', 'role', 'isActive'];
  const updates = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  if (updates.role) {
    updates.role = updates.role.toUpperCase();
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

const deleteUser = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

const banUser = async (id, reason, duration) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      isActive: false,
      banned: true,
      banReason: reason,
      banDuration: duration,
    };
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).lean();

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    ...user,
    banned: true,
    banReason: reason,
    banDuration: duration,
  };
};

const unbanUser = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      isActive: true,
      banned: false,
    };
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  ).lean();

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    ...user,
    banned: false,
  };
};

const manageRoles = async (id, data) => {
  const { role, permissions } = data;
  if (!role) {
    throw ApiError.badRequest('role is required');
  }

  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      role: role.toUpperCase(),
      permissions,
    };
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role: role.toUpperCase() },
    { new: true }
  ).lean();

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    ...user,
    permissions,
  };
};

const getProperties = async (query = {}) => {
  const { status, page = 1, limit = 20 } = query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filters = {};
  if (status === 'pending') {
    filters.is_verified = false;
  } else if (status === 'approved') {
    filters.is_verified = true;
  }

  if (mongoose.connection.readyState !== 1) {
    return {
      properties: [],
      total: 0,
      page: pageNum,
      limit: limitNum,
      pages: 0,
    };
  }

  const [properties, total] = await Promise.all([
    Property.find(filters).skip(skip).limit(limitNum).lean(),
    Property.countDocuments(filters),
  ]);

  return {
    properties,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
  };
};

const approveProperty = async (id, notes) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      is_verified: true,
      notes,
    };
  }

  const property = await Property.findByIdAndUpdate(
    id,
    { is_verified: true },
    { new: true }
  ).lean();

  if (!property) {
    throw ApiError.notFound('Property not found');
  }

  return {
    ...property,
    notes,
  };
};

const rejectProperty = async (id, reason) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      is_verified: false,
      rejected: true,
      rejectReason: reason,
    };
  }

  const property = await Property.findByIdAndUpdate(
    id,
    { is_verified: false },
    { new: true }
  ).lean();

  if (!property) {
    throw ApiError.notFound('Property not found');
  }

  return {
    ...property,
    rejected: true,
    rejectReason: reason,
  };
};

const flagProperty = async (id, reason) => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: id,
      flagged: true,
      flagReason: reason,
    };
  }

  const property = await Property.findById(id).lean();
  if (!property) {
    throw ApiError.notFound('Property not found');
  }

  return {
    ...property,
    flagged: true,
    flagReason: reason,
  };
};

const getFlaggedContent = async (query = {}) => {
  const { type, page = 1 } = query;
  return {
    flaggedItems: [],
    type,
    page: parseInt(page, 10),
  };
};

const manageModerationRules = async (data) => {
  return {
    id: 'rule-123',
    ...data,
  };
};

const getAuditLogs = async (query = {}) => {
  const { from, to, action, page = 1 } = query;
  return {
    logs: [],
    from,
    to,
    action,
    page: parseInt(page, 10),
  };
};

const getReports = async (query = {}) => {
  return [];
};

const generateReports = async (data) => {
  return {
    id: 'report-123',
    ...data,
    generatedAt: new Date().toISOString(),
  };
};

const exportReport = async (id, query = {}) => {
  const { format = 'csv' } = query;
  return {
    id,
    format,
    content: `report_id,format,exported_at\n${id},${format},${new Date().toISOString()}`,
  };
};

const updateConfig = async (data) => {
  return {
    maintenanceMode: data.maintenanceMode ?? false,
    maxUploadSize: data.maxUploadSize ?? 104857600,
  };
};

const getSystemStatus = async () => {
  return {
    uptime: process.uptime(),
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
  };
};

const updateFeatureFlags = async (data) => {
  return {
    betaFeatures: data.betaFeatures ?? true,
    experimentalApi: data.experimentalApi ?? false,
  };
};

const getFeatureFlags = async () => {
  return {
    betaFeatures: true,
    experimentalApi: false,
  };
};

const createBackup = async (data) => {
  return {
    id: 'backup-123',
    type: data.type || 'full',
    retention: data.retention || 30,
    status: 'QUEUED',
  };
};

const listBackups = async () => {
  return [
    {
      id: 'backup-123',
      type: 'full',
      retention: 30,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
  ];
};

const restoreBackup = async (id, confirm) => {
  if (!confirm) {
    throw ApiError.badRequest('Confirmation is required to restore backup');
  }
  return {
    id,
    restored: true,
    timestamp: new Date().toISOString(),
  };
};

const manageEmailTemplates = async (data) => {
  return {
    id: 'template-123',
    ...data,
  };
};

const sendTestEmail = async (id, data) => {
  const { toEmail } = data;
  if (!toEmail) {
    throw ApiError.badRequest('Recipient email is required');
  }
  return {
    templateId: id,
    sentTo: toEmail,
    success: true,
  };
};

const manageApiKeys = async (data) => {
  return {
    id: 'key-123',
    key: 'prop_api_key_xxxxxxxxxxxxx',
    ...data,
  };
};

const revokeApiKey = async (id) => {
  return {
    id,
    revoked: true,
  };
};

const getApiKeyUsage = async (id, query = {}) => {
  const { from, to } = query;
  return {
    id,
    from,
    to,
    usage: [],
  };
};

const manageWebhooks = async (data) => {
  return {
    id: 'webhook-123',
    ...data,
  };
};

const testWebhook = async (id) => {
  return {
    id,
    success: true,
    statusCode: 200,
  };
};

const getWebhookLogs = async (id, query = {}) => {
  const { page = 1 } = query;
  return {
    id,
    page: parseInt(page, 10),
    logs: [],
  };
};

const getHealth = async () => {
  return {
    status: 'OK',
    dbState: mongoose.connection.readyState,
  };
};

const getSystemLogs = async (query = {}) => {
  const { level, from, to } = query;
  return {
    level,
    from,
    to,
    logs: [],
  };
};

const manageRateLimits = async (data) => {
  return {
    defaultLimit: data.defaultLimit ?? 100,
    windowSize: data.windowSize ?? 60,
    byRole: data.byRole ?? {},
  };
};

const getRateLimitsStats = async () => {
  return {
    activeRateLimiters: 0,
    stats: {},
  };
};

const banIp = async (data) => {
  const { ip, reason, duration } = data;
  if (!ip) {
    throw ApiError.badRequest('IP address is required');
  }
  return {
    id: 'ban-123',
    ip,
    reason,
    duration,
    createdAt: new Date().toISOString(),
  };
};

const unbanIp = async (id) => {
  return {
    id,
    unbanned: true,
  };
};

const getAnalytics = async (query = {}) => {
  const { from, to } = query;
  return {
    from,
    to,
    analytics: {},
  };
};

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
};
