import express from 'express';
import validate from '../middlewares/validate.js';
import { createWishlistSchema } from '../validators/wishlist.validator.js';
import wishlistController from '../controllers/wishlist.controller.js';

const router = express.Router();

router.post('/users/wishlist', validate(createWishlistSchema), wishlistController.createWishlist);

export default router;
