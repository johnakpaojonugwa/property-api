import Appointment from '../models/appointment.model.js';
import ApiError from '../utils/ApiError.js';

const createAppointment = async (data) => {
  const appointment = await Appointment.create(data);
  return appointment.toObject({ versionKey: false });
};

const getAppointmentById = async (id) => {
  const appointment = await Appointment.findById(id).lean();
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }
  return appointment;
};

export default {
  createAppointment,
  getAppointmentById,
};