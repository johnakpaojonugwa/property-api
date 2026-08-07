import mongoose from 'mongoose';
import { env } from './env.js';

let cachedConnection = null;

// Sanitize MongoDB URI to hide password credentials
export const sanitizeURI = (uri) => {
  if (!uri) return uri;
  return uri.replace(/:([^:@]+)@/, ':****@');
};

// Setup mongoose connection listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database successfully.');
});

mongoose.connection.on('error', (err) => {
  let msg = err.message || 'Unknown error';
  if (env.MONGODB_URI) {
    msg = msg.replaceAll(env.MONGODB_URI, sanitizeURI(env.MONGODB_URI));
  }
  console.error('Mongoose connection error:', msg);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from database.');
});

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
      maxPoolSize: 20,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    return cachedConnection;
  } catch (error) {
    const sanitizedURI = sanitizeURI(env.MONGODB_URI);
    let cleanMessage = error.message || '';
    if (env.MONGODB_URI) {
      cleanMessage = cleanMessage.replaceAll(env.MONGODB_URI, sanitizedURI);
    }
    const cleanError = new Error(cleanMessage);
    if (error.stack && env.MONGODB_URI) {
      cleanError.stack = error.stack.replaceAll(env.MONGODB_URI, sanitizedURI);
    } else {
      cleanError.stack = error.stack;
    }
    throw cleanError;
  }
};

export const disconnectDB = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
};

