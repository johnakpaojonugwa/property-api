import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';
import Merchant from '../models/merchant.model.js';
import Agent from '../models/agent.model.js';
import Appointment from '../models/appointment.model.js';
import Review from '../models/review.model.js';
import Wishlist from '../models/wishlist.model.js';
import Token from '../models/token.model.js';

describe('Phase 7 domain models', () => {
  it('creates merchant, agent, appointment, review, wishlist, and token documents', () => {
    const merchant = new Merchant({ full_name: 'Jane Doe', email: 'jane@example.com', phone: '08012345678', password_hash: 'hashed' });
    const agent = new Agent({ full_name: 'John Doe', email: 'john@example.com', phone: '08087654321', password_hash: 'hashed', merchant: merchant._id });
    const appointment = new Appointment({ property_id: '64b6f5c6f9d0c2a1b2c3d4e5', user_id: '64b6f5c6f9d0c2a1b2c3d4e6', agent_id: agent._id, date: '2026-07-15', msg: 'Viewing', time: { from: '10:00', to: '11:00' } });
    const review = new Review({ property_id: '64b6f5c6f9d0c2a1b2c3d4e5', user_id: '64b6f5c6f9d0c2a1b2c3d4e6', text: 'Great place' });
    const wishlist = new Wishlist({ user_id: new mongoose.Types.ObjectId('64b6f5c6f9d0c2a1b2c3d4e6'), property_id: new mongoose.Types.ObjectId('64b6f5c6f9d0c2a1b2c3d4e5') });
    const token = new Token({ email: 'viewer@example.com', token: 'public-token', expires_at: new Date(Date.now() + 60000) });

    expect(merchant.email).toBe('jane@example.com');
    expect(agent.merchant).toEqual(merchant._id);
    expect(appointment.confirmed).toBe(false);
    expect(review.text).toBe('Great place');
    expect(wishlist.user_id.toString()).toBe('64b6f5c6f9d0c2a1b2c3d4e6');
    expect(token.email).toBe('viewer@example.com');
  });
});
