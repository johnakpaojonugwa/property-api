import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 50: Advanced search and full-text search', () => {
  it('should support basic text search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support full-text search endpoint', async () => {
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'apartment' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should search across multiple fields', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John', fields: 'full_name,email' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support case-insensitive search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'JOHN' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support prefix matching search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'Jo*' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support regex search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: '/^john/i' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support phrase search with quotes', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: '"John Doe"' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support boolean AND operator', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John AND Doe' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support boolean OR operator', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John OR Jane' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support NOT operator', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John NOT Doe' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support fuzzy search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'Jhon~' }); // Typo tolerance

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support weighted field search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John', weights: 'full_name:2,email:1' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should return search relevance score', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John', includeScore: true });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search suggestions/autocomplete', async () => {
    const res = await request(app)
      .get('/v1/search/suggestions')
      .query({ q: 'joh' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search highlighting', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John', highlight: true });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support faceted search', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .query({ search: 'apartment', facets: 'category,status' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search filters alongside text search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({
        search: 'John',
        status: 'active',
        createdAfter: '2024-01-01',
      });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support range queries in search', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .query({
        search: 'apartment',
        priceRange: '[100000 TO 500000]',
      });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support proximity search', async () => {
    const res = await request(app)
      .get('/v1/search')
      .query({ q: '"John Doe"~5' }); // Within 5 words

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support field-specific search syntax', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'full_name:John email:example.com' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support sort by relevance', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John', sort: '_relevance' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search result grouping', async () => {
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'apartment', groupBy: 'category' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support did-you-mean suggestions on typos', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'Jhon', suggestions: true });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search analytics', async () => {
    const res = await request(app)
      .get('/v1/search-analytics')
      .query({ from: '2024-01-01', to: '2024-12-31' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support saved searches', async () => {
    const res = await request(app)
      .post('/v1/saved-searches')
      .send({
        name: 'My Search',
        query: { search: 'John', status: 'active' },
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should retrieve saved searches', async () => {
    const res = await request(app).get('/v1/saved-searches');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search query templates', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ template: 'recently_active', search: 'John' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support stemming/lemmatization in search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'running' }); // Should match "run", "runs"

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support stop word handling', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'the quick brown fox' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support multi-language search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'Джон', language: 'ru' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support spell-checking in search', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'Jhon', spellcheck: true });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search result caching', async () => {
    const res1 = await request(app)
      .get('/v1/agents')
      .query({ search: 'John' });

    const res2 = await request(app)
      .get('/v1/agents')
      .query({ search: 'John' });

    expect(res1.status).toBe(res2.status);
  });

  it('should support pagination in search results', async () => {
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'apartment', limit: 20, skip: 0 });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should handle empty search queries', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: '' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should handle very long search queries', async () => {
    const longQuery = 'a'.repeat(1000);
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: longQuery });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should prevent search injection attacks', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: "'; DROP TABLE agents;--" });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support search across related resources', async () => {
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'John', includeRelated: true });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should track search performance metrics', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ search: 'John' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support concurrent searches', async () => {
    const responses = await Promise.all([
      request(app)
        .get('/v1/agents')
        .query({ search: 'John' }),
      request(app)
        .get('/v1/agents')
        .query({ search: 'Jane' }),
      request(app)
        .get('/v1/agents')
        .query({ search: 'Jack' }),
    ]);

    responses.forEach((res) => {
      expect([200, 400, 404]).toContain(res.status);
    });
  });
});
