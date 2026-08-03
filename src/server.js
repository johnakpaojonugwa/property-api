import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket, getIO } from './utils/socket.js';
import { NotificationService } from './services/notification.service.js';

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed during startup:', error.message);
    process.exit(1);
  }
  
  try {
    await NotificationService.seedDefaultTemplates();
  } catch (err) {
    console.error('Failed to seed default templates:', err);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });

  initSocket(server);

  const handleShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    
    // Force close after timeout to prevent hanging connections
    const forceExitTimeout = setTimeout(() => {
      console.warn('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 5000);
    forceExitTimeout.unref();

    // Close socket connections
    const io = getIO();
    if (io) {
      try {
        io.close();
      } catch (err) {
        console.error('Error closing Socket.io:', err);
      }
    }

    server.close(async () => {
      clearTimeout(forceExitTimeout);
      await disconnectDB();
      console.log('HTTP server closed and DB disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer();


