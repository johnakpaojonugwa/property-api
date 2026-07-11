import { describe, it, expect } from 'vitest';
import Property from '../models/property.model.js';

describe('Phase 29: Property model validation', () => {
  it('should require name, price, country, state, city, category, property_use, payment_plan, and type', () => {
    const property = new Property({ agent: '507f1f77bcf86cd799439011' });
    const error = property.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.country).toBeDefined();
    expect(error.errors.state).toBeDefined();
    expect(error.errors.city).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.property_use).toBeDefined();
    expect(error.errors.payment_plan).toBeDefined();
    expect(error.errors.type).toBeDefined();
  });

  it('should enforce name minimum length of 2', () => {
    const property = new Property({
      name: 'A',
      price: 100000,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Ikeja',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'RENT',
      agent: '507f1f77bcf86cd799439011',
    });

    const error = property.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.name.message).toBe('name must be at least 2 characters');
  });

  it('should enforce price minimum of 1000', () => {
    const property = new Property({
      name: 'Beautiful Flat',
      price: 500,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Ikeja',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'RENT',
      agent: '507f1f77bcf86cd799439011',
    });

    const error = property.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.price.message).toBe('price must be at least 1000');
  });

  it('should enforce country minimum length of 2', () => {
    const property = new Property({
      name: 'Beautiful Flat',
      price: 100000,
      country: 'N',
      state: 'Lagos',
      city: 'Ikeja',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'RENT',
      agent: '507f1f77bcf86cd799439011',
    });

    const error = property.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.country.message).toBe('country must be at least 2 characters');
  });

  it('should enforce state minimum length of 2', () => {
    const property = new Property({
      name: 'Beautiful Flat',
      price: 100000,
      country: 'Nigeria',
      state: 'L',
      city: 'Ikeja',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'RENT',
      agent: '507f1f77bcf86cd799439011',
    });

    const error = property.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.state.message).toBe('state must be at least 2 characters');
  });

  it('should enforce city minimum length of 2', () => {
    const property = new Property({
      name: 'Beautiful Flat',
      price: 100000,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'I',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'RENT',
      agent: '507f1f77bcf86cd799439011',
    });

    const error = property.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.city.message).toBe('city must be at least 2 characters');
  });

  it('should create a valid property with all required fields', () => {
    const property = new Property({
      name: 'Beautiful Flat',
      price: 100000,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Ikeja',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'RENT',
      agent: '507f1f77bcf86cd799439011',
    });

    const error = property.validateSync();
    expect(error).toBeUndefined();
  });
});
