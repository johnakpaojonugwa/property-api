import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
};

startServer();
