import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

/**
 * Uploads an image Buffer to Cloudinary.
 * @param {Buffer} buffer - Image buffer to upload
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} Secure URL of uploaded image
 */
export const uploadToCloudinary = (buffer, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    // If running in test mode or no credentials are set, return mock URL
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.VITEST ||
      !process.env.CLOUDINARY_CLOUD_NAME
    ) {
      const mockFilename = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      return resolve(`https://res.cloudinary.com/demo/image/upload/${folder}/${mockFilename}`);
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

export default uploadToCloudinary;
