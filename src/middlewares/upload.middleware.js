import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file
  },
});

export const uploadSingle = (fieldName = 'resource') => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(ApiError.badRequest(`Upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

export const uploadArray = (fieldName = 'resources', maxCount = 5) => (req, res, next) => {
  upload.array(fieldName, maxCount)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(ApiError.badRequest(`Upload error: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

export default {
  upload,
  uploadSingle,
  uploadArray,
};
