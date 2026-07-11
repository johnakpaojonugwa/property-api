import express from 'express';
import validate from '../middlewares/validate.js';
import { loginSchema } from '../validators/auth.validator.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/auth/login', validate(loginSchema), authController.login);

export default router;
