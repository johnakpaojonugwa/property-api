import express from 'express';
import validate from '../middlewares/validate.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate.js';
import { createAppointmentSchema } from '../validators/appointment.validator.js';
import appointmentController from '../controllers/appointment.controller.js';

const router = express.Router();

router.get('/appointments', optionalAuthenticate, appointmentController.getAppointments);
router.post('/appointments', optionalAuthenticate, validate(createAppointmentSchema), appointmentController.createAppointment);
router.put('/appointments/:appointment_id/confirm-meeting', authenticate, appointmentController.confirmMeeting);
router.put('/appointments/:appointment_id/set-agent-appointment-completion', authenticate, appointmentController.setAgentCompletion);
router.put('/appointments/:appointment_id/set-user-appointment-completion', authenticate, appointmentController.setUserCompletion);
router.put('/appointments/:appointment_id', authenticate, appointmentController.updateAppointment);
router.delete('/appointments/:appointment_id', authenticate, appointmentController.deleteAppointment);

export default router;
