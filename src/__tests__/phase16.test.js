import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 16 request logging', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs incoming requests with method, path, and status', async () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await request(app).get('/health');

    expect(consoleSpy).toHaveBeenCalled();
    const [message] = consoleSpy.mock.calls[0];
    expect(message).toContain('GET');
    expect(message).toContain('/health');
  });
});
