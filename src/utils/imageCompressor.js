import sharp from 'sharp';

/**
 * Compresses an image Buffer or File Path using Sharp.
 * @param {Buffer|string} input - Image buffer or file path
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default 1200)
 * @param {number} options.maxHeight - Maximum height (default 1200)
 * @param {number} options.quality - Quality (1-100, default 80)
 * @param {string} options.format - Target format: 'webp', 'jpeg', 'png' (default 'webp')
 * @returns {Promise<{buffer: Buffer, info: Object}>} Compressed buffer and metadata
 */
export const compressImage = async (input, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = 'webp',
  } = options;

  let pipeline = sharp(input).resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 8, quality });
  } else {
    pipeline = pipeline.toFormat(format, { quality });
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    info: {
      format: info.format,
      width: info.width,
      height: info.height,
      size: info.size,
    },
  };
};

export default compressImage;
