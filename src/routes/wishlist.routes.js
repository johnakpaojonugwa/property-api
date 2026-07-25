import express from 'express';
import validate from '../middlewares/validate.js';
import { optionalAuthenticate } from '../middlewares/authenticate.js';
import { createWishlistSchema } from '../validators/wishlist.validator.js';
import wishlistController from '../controllers/wishlist.controller.js';

const router = express.Router();

router.post('/users/wishlist', optionalAuthenticate, validate(createWishlistSchema), wishlistController.createWishlist);

export default router;
