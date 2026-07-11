import { describe, it, expect } from 'vitest';
import Wishlist from '../models/wishlist.model.js';

describe('Phase 32: Wishlist model validation', () => {
  it('should require user_id and property_id', () => {
    const wishlist = new Wishlist({});
    const error = wishlist.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.user_id).toBeDefined();
    expect(error.errors.property_id).toBeDefined();
  });

  it('should create a valid wishlist with all required fields', () => {
    const wishlist = new Wishlist({
      user_id: '507f1f77bcf86cd799439011',
      property_id: '507f1f77bcf86cd799439012',
    });

    const error = wishlist.validateSync();
    expect(error).toBeUndefined();
  });
});
