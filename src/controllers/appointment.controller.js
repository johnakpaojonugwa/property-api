import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = { ...req.body };
  return res.status(201).json(ApiResponse.success(appointment, 'Appointment created'));
});

export default { createAppointment };
