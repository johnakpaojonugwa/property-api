import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { createReviewSchema } from '../validators/review.validator.js';
import reviewController from '../controllers/review.controller.js';

const router = express.Router();

router.get('/reviews', optionalAuthenticate, reviewController.getReviews);
router.post('/reviews', authenticate, authorize(['USER', 'ADMIN']), validate(createReviewSchema), reviewController.createReview);
router.put('/reviews/:review_id', authenticate, reviewController.updateReview);
router.delete('/reviews/:review_id', authenticate, reviewController.deleteReview);

export default router;
