import { describe, expect, it } from 'vitest';
import propertyService from '../services/property.service.js';

describe('Phase 8 service layer', () => {
  it('builds a safe property filter from query params', () => {
    const filters = propertyService.buildFilters({ city: 'Lekki', verified: 'true', agent: 'agent-1' });

    expect(filters).toEqual({ city: 'Lekki', is_verified: true, agent: 'agent-1' });
  });

  it('normalizes pagination defaults', () => {
    const pagination = propertyService.normalizePagination({ page: '2', limit: '5' });

    expect(pagination).toEqual({ page: 2, limit: 5 });
  });
});
