import express from 'express';
import validate from '../middlewares/validate.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js';
import authController from '../controllers/auth.controller.js';
import authLimiter from '../middlewares/authLimiter.js';

const router = express.Router();

router.post('/auth/login', authLimiter, validate(loginSchema), authController.login);
router.post('/auth/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/auth/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;


