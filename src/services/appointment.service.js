import mongoose from 'mongoose';
import Appointment from '../models/appointment.model.js';
import Agent from '../models/agent.model.js';
import Property from '../models/property.model.js';
import ApiError from '../utils/ApiError.js';
import { NotificationService } from './notification.service.js';

const createAppointment = async (data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (actor.role !== 'USER' && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('Only users or administrators can create appointments');
  }
  if (actor.role === 'USER') {
    data.user_id = actor.id;
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: 'mock-appointment-id', ...data };
  }
  const appointment = await Appointment.create(data);

  // Trigger showing_request notification to the Agent
  try {
    const userDoc = await mongoose.model('User').findById(appointment.user_id);
    const userName = userDoc ? `${userDoc.first_name} ${userDoc.last_name}` : 'A user';
    const propertyDoc = await Property.findById(appointment.property_id);
    const propertyTitle = propertyDoc ? propertyDoc.name : 'property';

    await NotificationService.send({
      recipientId: appointment.agent_id,
      recipientRole: 'agent',
      actorRole: 'user',
      triggeredByUserId: appointment.user_id,
      sourceType: 'showing',
      sourceId: appointment._id,
      type: 'showing_request',
      category: 'management',
      priority: 'high',
      title: 'New Showing Request',
      message: `${userName} requested a tour appointment for the property "${propertyTitle}".`,
      data: {
        appointmentId: appointment._id,
        propertyId: appointment.property_id,
        propertyName: propertyTitle,
        date: appointment.date,
        time: `${appointment.time.from} - ${appointment.time.to}`,
      },
    });
  } catch (err) {
    console.error('Failed to trigger showing_request notification:', err);
  }

  return appointment.toObject({ versionKey: false });
};

const getAppointments = async (query = {}, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  const filter = {};
  if (actor.role === 'USER') {
    filter.user_id = actor.id;
  } else if (actor.role === 'AGENT') {
    filter.agent_id = actor.id;
  } else if (actor.role === 'MERCHANT') {
    const agents = await Agent.find({ merchant: actor.id }).select('_id');
    const agentIds = agents.map(a => a._id);
    filter.agent_id = { $in: agentIds };
  } else if (actor.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have access to appointments');
  }

  if (actor.role === 'ADMIN') {
    if (query.agent) filter.agent_id = query.agent;
    if (query.user) filter.user_id = query.user;
  }

  if (query.completed !== undefined) {
    const isComp = query.completed === 'true' || query.completed === true;
    filter.$or = [{ agent_completed: isComp }, { user_completed: isComp }];
  }

  const page = Number.parseInt(query.page ?? '0', 10);
  const limit = Number.parseInt(query.limit ?? '10', 10);
  const skip = page * limit;

  return await Appointment.find(filter).skip(skip).limit(limit).lean();
};

const getAppointmentById = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.notFound('Appointment not found');
  }
  const appointment = await Appointment.findById(id).lean();
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  const isUserOwner = appointment.user_id.toString() === actor.id;
  const isAgentOwner = appointment.agent_id.toString() === actor.id;
  let isMerchantOwner = false;
  if (actor.role === 'MERCHANT') {
    const agent = await Agent.findById(appointment.agent_id);
    isMerchantOwner = agent && agent.merchant?.toString() === actor.id;
  }
  const isAdmin = actor.role === 'ADMIN';

  if (!isUserOwner && !isAgentOwner && !isMerchantOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have access to this appointment');
  }

  return appointment;
};

const updateAppointment = async (id, data, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  const isUserOwner = appointment.user_id.toString() === actor.id;
  const isAgentOwner = appointment.agent_id.toString() === actor.id;
  const isAdmin = actor.role === 'ADMIN';

  if (!isUserOwner && !isAgentOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to update this appointment');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id, ...data };
  }
  const updated = await Appointment.findByIdAndUpdate(id, data, { new: true }).lean();
  return updated;
};

const confirmMeeting = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, confirmed: true };
  }
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  if (appointment.agent_id.toString() !== actor.id && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('Only the assigned agent can confirm this meeting');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id, confirmed: true };
  }
  const updated = await Appointment.findByIdAndUpdate(id, { confirmed: true }, { new: true }).lean();

  // Trigger showing_confirmed to the User and showing_scheduled to the Merchant
  try {
    const propertyDoc = await Property.findById(updated.property_id);
    const propertyTitle = propertyDoc ? propertyDoc.name : 'property';

    // Notify User
    await NotificationService.send({
      recipientId: updated.user_id,
      recipientRole: 'user',
      actorRole: 'agent',
      triggeredByUserId: actor.id,
      sourceType: 'showing',
      sourceId: updated._id,
      type: 'showing_confirmed',
      category: 'engagement',
      priority: 'medium',
      title: 'Showing Confirmed',
      message: `Your tour request for "${propertyTitle}" has been confirmed by the agent.`,
      data: {
        appointmentId: updated._id,
        propertyId: updated.property_id,
        propertyName: propertyTitle,
        date: updated.date,
        time: `${updated.time.from} - ${updated.time.to}`,
      },
    });

    // Notify Merchant if property has a merchant
    if (propertyDoc && propertyDoc.merchant) {
      await NotificationService.send({
        recipientId: propertyDoc.merchant,
        recipientRole: 'merchant',
        actorRole: 'agent',
        triggeredByUserId: actor.id,
        sourceType: 'showing',
        sourceId: updated._id,
        type: 'showing_scheduled',
        category: 'management',
        priority: 'medium',
        title: 'Showing Scheduled on Listing',
        message: `An agent has confirmed a showing for your property "${propertyTitle}".`,
        data: {
          appointmentId: updated._id,
          propertyId: updated.property_id,
          propertyName: propertyTitle,
          date: updated.date,
        },
      });
    }
  } catch (err) {
    console.error('Failed to trigger confirmation notifications:', err);
  }

  return updated;
};

const setAgentCompletion = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, agent_completed: true };
  }
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  if (appointment.agent_id.toString() !== actor.id && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('Only the assigned agent can mark this appointment as completed');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id, agent_completed: true };
  }
  const updated = await Appointment.findByIdAndUpdate(id, { agent_completed: true }, { new: true }).lean();
  return updated;
};

const setUserCompletion = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, user_completed: true };
  }
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  if (appointment.user_id.toString() !== actor.id && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('Only the booking user can mark this appointment as completed');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id, user_completed: true };
  }
  const updated = await Appointment.findByIdAndUpdate(id, { user_completed: true }, { new: true }).lean();
  return updated;
};

const deleteAppointment = async (id, actor) => {
  if (!actor) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  if (appointment.user_id.toString() !== actor.id && actor.role !== 'ADMIN') {
    throw ApiError.forbidden('You do not have permission to delete this appointment');
  }

  if (mongoose.connection.readyState !== 1) {
    return { _id: id };
  }
  const deleted = await Appointment.findByIdAndDelete(id).lean();
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