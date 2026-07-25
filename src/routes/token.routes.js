import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/token', authController.createToken);

export default router;
