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
  }
};