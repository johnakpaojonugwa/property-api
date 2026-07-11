import { describe, expect, it } from 'vitest';
import { buildPaginationMeta, buildFilterQuery } from '../utils/pagination.js';

describe('Phase 9 shared list helpers', () => {
  it('builds pagination metadata from counts and limits', () => {
    const meta = buildPaginationMeta({ page: 1, limit: 10, total: 25 });

    expect(meta).toEqual({ page: 1, limit: 10, total: 25, pages: 3 });
  });

  it('builds a safe filter object from allow-listed keys', () => {
    const filters = buildFilterQuery({ city: 'Lekki', verified: 'true', bad: 'value' }, ['city', 'verified']);

    expect(filters).toEqual({ city: 'Lekki', verified: 'true' });
  });
});
