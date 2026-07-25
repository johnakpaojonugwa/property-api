import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value) => {
  const parsed = Number.parseInt(value ?? '5000', 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 5000 : parsed;
};

const requiredEnv = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '5000',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret',
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/property-platform',
};

const validNodeEnvs = new Set(['development', 'test', 'production']);

for (const [key, value] of Object.entries(requiredEnv)) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Environment variable ${key} must be a non-empty string.`);
  }
}

if (!validNodeEnvs.has(requiredEnv.NODE_ENV)) {
  throw new Error('NODE_ENV must be one of: development, test, production.');
}

if (requiredEnv.NODE_ENV === 'production') {
  if (requiredEnv.JWT_SECRET === 'dev-jwt-secret') {
    throw new Error('JWT_SECRET must be explicitly configured in production environment.');
  }
}

export const env = Object.freeze({
  NODE_ENV: requiredEnv.NODE_ENV,
  PORT: parsePort(requiredEnv.PORT),
  JWT_SECRET: requiredEnv.JWT_SECRET,
  MONGODB_URI: requiredEnv.MONGODB_URI,
});

export default env;
