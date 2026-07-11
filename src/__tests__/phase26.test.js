import { describe, expect, it } from 'vitest';
import Agent from '../models/agent.model.js';

describe('Phase 26 agent model validation', () => {
  it('requires a full name and email before saving', async () => {
    const agent = new Agent({ company: 'Example' });
    const error = agent.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.full_name).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });
});
