import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

let io = null;

/**
 * Initialize Socket.io server and auth middleware
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware for WebSocket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    const guestSessionId = socket.handshake.auth?.guestSessionId || socket.handshake.headers?.['x-guest-session-id'];

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.actor = {
          id: decoded.id,
          role: (decoded.role || decoded.actor_type || 'USER').toUpperCase(),
          merchant_id: decoded.merchant_id || null,
        };
        return next();
      } catch (err) {
        return next(new Error('Authentication failed: Invalid or expired token'));
      }
    }

    if (guestSessionId) {
      socket.actor = {
        id: guestSessionId,
        role: 'GUEST',
        merchant_id: null,
      };
      return next();
    }

    return next(new Error('Authentication failed: Token or Guest Session ID required'));
  });

  // Client connection handler
  io.on('connection', (socket) => {
    const { id, role } = socket.actor;
    const roomName = `${role.toLowerCase()}:${id}`;
    
    socket.join(roomName);
    
    // Admins join compliance room
    if (role === 'ADMIN') {
      socket.join('admin:broadcast');
    }

    socket.on('disconnect', () => {
      socket.leave(roomName);
      if (role === 'ADMIN') {
        socket.leave('admin:broadcast');
      }
    });
  });

  return io;
};

/**
 * Get Socket.io server instance
 */
export const getIO = () => {
  return io;
};
