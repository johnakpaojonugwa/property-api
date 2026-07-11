import express from 'express';
import validate from '../middlewares/validate.js';
import { createUserSchema } from '../validators/user.validator.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/users', validate(createUserSchema), userController.createUser);

export default router;
