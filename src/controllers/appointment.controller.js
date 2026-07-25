import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import appointmentService from '../services/appointment.service.js';

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.body);
  return res.status(201).json(ApiResponse.success(appointment, 'Appointment created'));
});

const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getAppointments(req.query);
  return res.status(200).json(ApiResponse.success(appointments, 'Appointments retrieved'));
});

const updateAppointment = asyncHandler(async (req, res) => {
  const updated = await appointmentService.updateAppointment(req.params.appointment_id, req.body);
  return res.status(200).json(ApiResponse.success(updated, 'Appointment updated'));
});

const confirmMeeting = asyncHandler(async (req, res) => {
  const updated = await appointmentService.confirmMeeting(req.params.appointment_id);
  return res.status(200).json(ApiResponse.success(updated, 'Appointment confirmed'));
});

const setAgentCompletion = asyncHandler(async (req, res) => {
  const updated = await appointmentService.setAgentCompletion(req.params.appointment_id);
  return res.status(200).json(ApiResponse.success(updated, 'Agent appointment completion updated'));
});

const setUserCompletion = asyncHandler(async (req, res) => {
  const updated = await appointmentService.setUserCompletion(req.params.appointment_id);
  return res.status(200).json(ApiResponse.success(updated, 'User appointment completion updated'));
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const deleted = await appointmentService.deleteAppointment(req.params.appointment_id);
  return res.status(200).json(ApiResponse.success(deleted, 'Appointment deleted'));
});

export default {
  createAppointment,
  getAppointments,
  updateAppointment,
  confirmMeeting,
  setAgentCompletion,
  setUserCompletion,
  deleteAppointment,
};
