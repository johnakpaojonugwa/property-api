import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { createAppointmentSchema } from '../validators/appointment.validator.js';
import appointmentController from '../controllers/appointment.controller.js';

const router = express.Router();

router.get('/appointments', authenticate, appointmentController.getAppointments);
router.post('/appointments', authenticate, validate(createAppointmentSchema), appointmentController.createAppointment);
router.put('/appointments/:appointment_id/confirm-meeting', authenticate, appointmentController.confirmMeeting);
router.put('/appointments/:appointment_id/set-agent-appointment-completion', authenticate, appointmentController.setAgentCompletion);
router.put('/appointments/:appointment_id/set-user-appointment-completion', authenticate, appointmentController.setUserCompletion);
router.put('/appointments/:appointment_id', authenticate, appointmentController.updateAppointment);
router.delete('/appointments/:appointment_id', authenticate, appointmentController.deleteAppointment);

export default router;
