import { describe, expect, it } from 'vitest';
import { createAppointmentSchema } from '../validators/appointment.validator.js';

describe('Phase 12 appointment contract', () => {
  it('validates an appointment creation payload', () => {
    const { error } = createAppointmentSchema.validate({
      property_id: '64b6f5c6f9d0c2a1b2c3d4e5',
      user_id: '64b6f5c6f9d0c2a1b2c3d4e6',
      agent_id: '64b6f5c6f9d0c2a1b2c3d4e7',
      date: '2026-07-15',
      msg: 'Looking to view',
      time: { from: '10:00', to: '11:00' },
    });

    expect(error).toBeUndefined();
  });
});
