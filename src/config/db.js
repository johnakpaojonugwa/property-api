import mongoose from 'mongoose';
import { env } from './env.js';

let cachedConnection = null;

export const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (env.NODE_ENV === 'test') {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    return cachedConnection;
  } catch (error) {
    throw error;
  }
};

export const disconnectDB = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
};
