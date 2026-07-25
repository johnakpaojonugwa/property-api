import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import appointmentService from '../services/appointment.service.js';

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.body);
  return res.status(201).json(ApiResponse.success(appointment, 'Appointment created'));
});

export default { createAppointment };
