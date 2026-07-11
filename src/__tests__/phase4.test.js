import { describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import authRoutes from '../routes/auth.routes.js';
import errorHandler from '../middlewares/errorHandler.js';

describe('Phase 4 route foundation', () => {
  it('mounts auth routes and returns a structured response for invalid payloads', async () => {
    const app = express();
    app.use(express.json());
    app.use('/v1', authRoutes);
    app.use(errorHandler);

    const response = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});
