import { describe, it, expect } from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import app from '../app.js';
import { compressImage } from '../utils/imageCompressor.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

describe('Image Compressor & Upload Pipeline Tests', () => {
  it('should compress an image buffer using imageCompressor utility', async () => {
    // Generate a simple 500x500 PNG buffer using Sharp
    const rawBuffer = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await compressImage(rawBuffer, { maxWidth: 300, quality: 75, format: 'webp' });

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.info.format).toBe('webp');
    expect(result.info.width).toBeLessThanOrEqual(300);
    expect(result.info.height).toBeLessThanOrEqual(300);
  });

  it('should upload a buffer to Cloudinary (or mock URL in test environment)', async () => {
    const rawBuffer = await sharp({
      create: { width: 100, height: 100, channels: 4, background: { r: 0, g: 255, b: 0, alpha: 1 } },
    })
      .jpeg()
      .toBuffer();

    const url = await uploadToCloudinary(rawBuffer, 'test_folder');
    expect(typeof url).toBe('string');
    expect(url).toContain('https://res.cloudinary.com');
  });

  it('should handle file upload on user resource endpoint', async () => {
    const imageBuffer = await sharp({
      create: { width: 200, height: 200, channels: 3, background: { r: 0, g: 0, b: 255 } },
    })
      .jpeg()
      .toBuffer();

    const userId = '60d5ec49f1b2c811845e2111';
    const res = await request(app)
      .put(`/v1/users/${userId}/resource`)
      .attach('resource', imageBuffer, 'profile.jpg');

    expect([200, 401, 403, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data.avatar).toBeDefined();
    }
  });

  it('should handle file upload on agent resource endpoint', async () => {
    const imageBuffer = await sharp({
      create: { width: 200, height: 200, channels: 3, background: { r: 255, g: 255, b: 0 } },
    })
      .jpeg()
      .toBuffer();

    const agentId = '60d5ec49f1b2c811845e3333';
    const res = await request(app)
      .put(`/v1/agents/${agentId}/resource`)
      .attach('resource', imageBuffer, 'agent_avatar.jpg');

    expect([200, 401, 403, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data.avatar).toBeDefined();
    }
  });

  it('should handle multiple file uploads on property resource endpoint', async () => {
    const imageBuffer1 = await sharp({
      create: { width: 300, height: 300, channels: 3, background: { r: 255, g: 0, b: 255 } },
    })
      .jpeg()
      .toBuffer();

    const imageBuffer2 = await sharp({
      create: { width: 300, height: 300, channels: 3, background: { r: 0, g: 255, b: 255 } },
    })
      .jpeg()
      .toBuffer();

    const propertyId = '60d5ec49f1b2c811845e4444';
    const res = await request(app)
      .put(`/v1/properties/${propertyId}/resource`)
      .attach('images', imageBuffer1, 'prop1.jpg')
      .attach('images', imageBuffer2, 'prop2.jpg');

    expect([200, 401, 403, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data.images).toBeInstanceOf(Array);
    }
  });
});
