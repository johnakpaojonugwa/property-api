import { describe, it, expect } from 'vitest';
import Review from '../models/review.model.js';

describe('Phase 31: Review model validation', () => {
  it('should require property_id, user_id, and text', () => {
    const review = new Review({});
    const error = review.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.property_id).toBeDefined();
    expect(error.errors.user_id).toBeDefined();
    expect(error.errors.text).toBeDefined();
  });

  it('should enforce text minimum length of 5', () => {
    const review = new Review({
      property_id: '507f1f77bcf86cd799439011',
      user_id: '507f1f77bcf86cd799439012',
      text: 'Good',
    });

    const error = review.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.text.message).toBe('text must be at least 5 characters');
  });

  it('should create a valid review with all required fields', () => {
    const review = new Review({
      property_id: '507f1f77bcf86cd799439011',
      user_id: '507f1f77bcf86cd799439012',
      text: 'Great property, highly recommended!',
    });

    const error = review.validateSync();
    expect(error).toBeUndefined();
  });
});
