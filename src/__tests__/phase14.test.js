import { describe, expect, it } from 'vitest';
import { createReviewSchema } from '../validators/review.validator.js';
import { createWishlistSchema } from '../validators/wishlist.validator.js';

describe('Phase 14 review and wishlist contracts', () => {
  it('validates a review creation payload', () => {
    const { error } = createReviewSchema.validate({
      property_id: '64b6f5c6f9d0c2a1b2c3d4e5',
      user_id: '64b6f5c6f9d0c2a1b2c3d4e6',
      text: 'Excellent place',
    });

    expect(error).toBeUndefined();
  });

  it('validates a wishlist creation payload', () => {
    const { error } = createWishlistSchema.validate({
      user_id: '64b6f5c6f9d0c2a1b2c3d4e6',
      property_id: '64b6f5c6f9d0c2a1b2c3d4e5',
    });

    expect(error).toBeUndefined();
  });
});
