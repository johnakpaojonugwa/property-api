import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import authorize, { ensureOwnerOrAdmin } from '../middlewares/authorize.js';
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import userController from '../controllers/user.controller.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/users', authenticate, authorize(['ADMIN']), userController.getUsers);
router.get('/users/:user_id', authenticate, ensureOwnerOrAdmin('user_id'), userController.getUserById);
router.get('/users/:user_id/wishlist', authenticate, ensureOwnerOrAdmin('user_id'), userController.getUserWishlist);
router.get('/users/:user_id/properties', authenticate, ensureOwnerOrAdmin('user_id'), userController.getUserProperties);
router.post('/users', validate(createUserSchema), userController.createUser);
router.put('/users/:user_id/resource', authenticate, ensureOwnerOrAdmin('user_id'), uploadSingle('resource'), userController.updateUserResource);
router.put('/users/:user_id', authenticate, ensureOwnerOrAdmin('user_id'), validate(updateUserSchema), userController.updateUser);
router.delete('/users/:user_id', authenticate, ensureOwnerOrAdmin('user_id'), userController.deleteUser);

export default router;
