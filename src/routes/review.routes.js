import express from 'express';
import validate from '../middlewares/validate.js';
import { createReviewSchema } from '../validators/review.validator.js';
import reviewController from '../controllers/review.controller.js';

const router = express.Router();

router.post('/reviews', validate(createReviewSchema), reviewController.createReview);

export default router;
