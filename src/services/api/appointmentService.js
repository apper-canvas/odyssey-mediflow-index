import appointmentData from "../mockData/appointments.json";

let appointments = [...appointmentData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const appointmentService = {
  async getAll() {
    await delay(300);
    return [...appointments];
  },

  async getById(id) {
    await delay(200);
    return appointments.find(appointment => appointment.Id === id) || null;
  },

  async create(appointmentData) {
    await delay(400);
    const newAppointment = {
      ...appointmentData,
      Id: Math.max(...appointments.map(a => a.Id)) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    appointments.unshift(newAppointment);
    return newAppointment;
  },

  async update(id, appointmentData) {
    await delay(400);
    const index = appointments.findIndex(appointment => appointment.Id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...appointmentData };
      return appointments[index];
    }
    throw new Error("Appointment not found");
  },

async delete(id) {
    await delay(300);
    const index = appointments.findIndex(appointment => appointment.Id === id);
    if (index !== -1) {
      const deleted = appointments.splice(index, 1)[0];
      return deleted;
    }
    throw new Error("Appointment not found");
  },

  // Waitlist integration methods
  async processWaitlistForCancellation(cancelledAppointment) {
    await delay(200);
    // This would integrate with waitlist service to notify next patient
    return {
      availableSlot: {
        date: cancelledAppointment.date,
        time: cancelledAppointment.time,
        type: cancelledAppointment.type,
        duration: cancelledAppointment.duration
      }
    };
  },

  async getAvailableSlots(date, appointmentType = null) {
    await delay(300);
    // Get all appointments for the date
    const dayAppointments = appointments.filter(apt => apt.date === date && apt.status !== 'Cancelled');
    
    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(timeString);
      }
    }
    
    // Filter out booked slots
    const bookedTimes = dayAppointments.map(apt => apt.time);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    
    return availableSlots.map(time => ({
      date,
      time,
      type: appointmentType || 'General',
      duration: 30
    }));
  },

async enrollInWaitlist(patientId, appointmentType, preferredDate = null) {
    await delay(300);
    // Integration point with waitlist service
    return {
      patientId,
      appointmentType,
      preferredDate,
      enrolledAt: new Date().toISOString()
    };
  },

  // Reminder integration methods
  async scheduleReminders(appointmentId, reminderConfig) {
    await delay(200);
    const appointment = await this.getById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    // This would integrate with reminder service
    return {
      appointmentId,
      remindersScheduled: reminderConfig.dayBefore || reminderConfig.hourBefore || reminderConfig.customTime ? 
        ['24h', '1h'].filter((_, i) => [reminderConfig.dayBefore, reminderConfig.hourBefore][i]) : [],
      reminderType: reminderConfig.type || 'email'
    };
  },

  async cancelReminders(appointmentId) {
    await delay(200);
    // This would integrate with reminder service to cancel scheduled reminders
    return {
      appointmentId,
      cancelledReminders: ['24h', '1h'] // Mock cancelled reminder times
    };
  }
};