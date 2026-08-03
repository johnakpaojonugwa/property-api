import express from 'express';
import authController from '../controllers/auth.controller.js';
import authLimiter from '../middlewares/authLimiter.js';

const router = express.Router();

router.post('/token', authLimiter, authController.createToken);

export default router;

