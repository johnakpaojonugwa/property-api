import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './utils/socket.js';
import { NotificationService } from './services/notification.service.js';

const startServer = async () => {
  await connectDB();
  
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
    server.close(async () => {
      await disconnectDB();
      console.log('HTTP server closed and DB disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer();

