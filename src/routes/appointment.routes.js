import express from 'express';
import validate from '../middlewares/validate.js';
import { createAppointmentSchema } from '../validators/appointment.validator.js';
import appointmentController from '../controllers/appointment.controller.js';

const router = express.Router();

router.post('/appointments', validate(createAppointmentSchema), appointmentController.createAppointment);

export default router;
