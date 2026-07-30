import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { createUserSchema } from '../validators/user.validator.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/users', authenticate, authorize(['ADMIN']), userController.getUsers);
router.get('/users/:user_id', authenticate, userController.getUserById);
router.get('/users/:user_id/wishlist', authenticate, userController.getUserWishlist);
router.get('/users/:user_id/properties', authenticate, userController.getUserProperties);
router.post('/users', validate(createUserSchema), userController.createUser);
router.put('/users/:user_id/resource', authenticate, userController.updateUserResource);
router.put('/users/:user_id', authenticate, userController.updateUser);
router.delete('/users/:user_id', authenticate, userController.deleteUser);

export default router;
