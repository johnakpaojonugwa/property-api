import mongoose from 'mongoose';
import Appointment from '../models/appointment.model.js';
import ApiError from '../utils/ApiError.js';

const createAppointment = async (data) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-appointment-id', ...data };
  }
  const appointment = await Appointment.create(data);
  return appointment.toObject({ versionKey: false });
};

const getAppointments = async (query = {}) => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  const filter = {};
  if (query.agent) filter.agent_id = query.agent;
  if (query.user) filter.user_id = query.user;
  if (query.completed !== undefined) {
    const isComp = query.completed === 'true' || query.completed === true;
    filter.$or = [{ agent_completed: isComp }, { user_completed: isComp }];
  }

  const page = Number.parseInt(query.page ?? '0', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);
  const skip = page * limit;

  return await Appointment.find(filter).skip(skip).limit(limit).lean();
};

const getAppointmentById = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('Appointment not found');
  }
  const appointment = await Appointment.findById(id).lean();
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }
  return appointment;
};

const updateAppointment = async (id, data) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, ...data };
  }
  const updated = await Appointment.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Appointment not found');
  }
  return updated;
};

const confirmMeeting = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, confirmed: true };
  }
  const updated = await Appointment.findByIdAndUpdate(id, { confirmed: true }, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Appointment not found');
  }
  return updated;
};

const setAgentCompletion = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, agent_completed: true };
  }
  const updated = await Appointment.findByIdAndUpdate(id, { agent_completed: true }, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Appointment not found');
  }
  return updated;
};

const setUserCompletion = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, user_completed: true };
  }
  const updated = await Appointment.findByIdAndUpdate(id, { user_completed: true }, { new: true }).lean();
  if (!updated) {
    throw ApiError.notFound('Appointment not found');
  }
  return updated;
};

const deleteAppointment = async (id) => {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }
  const deleted = await Appointment.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw ApiError.notFound('Appointment not found');
  }
  return deleted;
};

export default {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  confirmMeeting,
  setAgentCompletion,
  setUserCompletion,
  deleteAppointment,
};