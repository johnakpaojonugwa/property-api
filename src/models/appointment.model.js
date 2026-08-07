import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    date: {
      type: String,
      required: [true, 'date is required'],
      trim: true,
      minlength: [8, 'date must be at least 8 characters'],
    },
    msg: { type: String, trim: true },
    time: {
      from: {
        type: String,
        required: [true, 'from is required'],
        trim: true,
        minlength: [4, 'from must be at least 4 characters'],
      },
      to: {
        type: String,
        required: [true, 'to is required'],
        trim: true,
        minlength: [4, 'to must be at least 4 characters'],
      },
    },
    agent_completed: { type: Boolean, default: false },
    user_completed: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

appointmentSchema.index({ agent_id: 1, date: -1 });
appointmentSchema.index({ user_id: 1, date: -1 });
appointmentSchema.index({ property_id: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
