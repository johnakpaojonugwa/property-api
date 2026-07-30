import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { createWishlistSchema } from '../validators/wishlist.validator.js';
import wishlistController from '../controllers/wishlist.controller.js';

const router = express.Router();

router.post('/users/wishlist', authenticate, authorize(['USER', 'ADMIN']), validate(createWishlistSchema), wishlistController.createWishlist);

export default router;
