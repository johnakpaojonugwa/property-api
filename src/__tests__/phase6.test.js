import { describe, expect, it } from 'vitest';
import { connectDB } from '../config/db.js';
import app from '../app.js';

describe('Phase 6 app bootstrap', () => {
  it('creates an express app instance', () => {
    expect(app).toBeDefined();
  });

  it('connects to mongo using the configured uri', async () => {
    const connection = await connectDB();
    expect(connection).toBeDefined();
  });
});
