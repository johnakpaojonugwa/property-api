import express from 'express';
import validate from '../middlewares/validate.js';
import { optionalAuthenticate } from '../middlewares/authenticate.js';
import { createUserSchema } from '../validators/user.validator.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/users', optionalAuthenticate, userController.getUsers);
router.get('/users/:user_id', optionalAuthenticate, userController.getUserById);
router.get('/users/:user_id/wishlist', optionalAuthenticate, userController.getUserWishlist);
router.get('/users/:user_id/properties', optionalAuthenticate, userController.getUserProperties);
router.post('/users', validate(createUserSchema), userController.createUser);
router.put('/users/:user_id/resource', optionalAuthenticate, userController.updateUserResource);
router.put('/users/:user_id', optionalAuthenticate, userController.updateUser);
router.delete('/users/:user_id', optionalAuthenticate, userController.deleteUser);

export default router;
