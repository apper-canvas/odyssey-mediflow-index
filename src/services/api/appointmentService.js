const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const appointmentService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "doctor_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.fetchRecords('appointment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.map(appointment => ({
        Id: appointment.Id,
        patientId: appointment.patient_id_c?.Id || appointment.patient_id_c,
        doctorId: appointment.doctor_id_c || '',
        date: appointment.date_c || '',
        time: appointment.time_c || '',
        duration: appointment.duration_c || 30,
        type: appointment.type_c || '',
        status: appointment.status_c || 'Scheduled',
        notes: appointment.notes_c || '',
        createdAt: appointment.created_at_c || new Date().toISOString().split('T')[0]
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching appointments:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "doctor_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById('appointment_c', id, params);
      
      if (!response.success || !response.data) {
        return null;
      }

      const appointment = response.data;
      return {
        Id: appointment.Id,
        patientId: appointment.patient_id_c?.Id || appointment.patient_id_c,
        doctorId: appointment.doctor_id_c || '',
        date: appointment.date_c || '',
        time: appointment.time_c || '',
        duration: appointment.duration_c || 30,
        type: appointment.type_c || '',
        status: appointment.status_c || 'Scheduled',
        notes: appointment.notes_c || '',
        createdAt: appointment.created_at_c || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching appointment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(appointmentData) {
    try {
      const params = {
        records: [
          {
            Name: `Appointment - ${appointmentData.type}`,
            patient_id_c: parseInt(appointmentData.patientId),
            doctor_id_c: appointmentData.doctorId || '',
            date_c: appointmentData.date,
            time_c: appointmentData.time,
            duration_c: appointmentData.duration || 30,
            type_c: appointmentData.type,
            status_c: appointmentData.status || 'Scheduled',
            notes_c: appointmentData.notes || '',
            created_at_c: new Date().toISOString().split('T')[0]
          }
        ]
      };

      const response = await apperClient.createRecord('appointment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create appointment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create appointment');
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          return await this.getById(successfulRecord.data.Id);
        }
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating appointment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, appointmentData) {
    try {
      const updateData = {
        patient_id_c: parseInt(appointmentData.patientId) || undefined,
        doctor_id_c: appointmentData.doctorId || undefined,
        date_c: appointmentData.date || undefined,
        time_c: appointmentData.time || undefined,
        duration_c: appointmentData.duration || undefined,
        type_c: appointmentData.type || undefined,
        status_c: appointmentData.status || undefined,
        notes_c: appointmentData.notes || undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const params = {
        records: [{ Id: id, ...updateData }]
      };

      const response = await apperClient.updateRecord('appointment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update appointment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update appointment');
        }

        return await this.getById(id);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating appointment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = { RecordIds: [id] };
      const response = await apperClient.deleteRecord('appointment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete appointment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to delete appointment');
        }

        return true;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting appointment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  // Waitlist integration methods - mock implementation
  async processWaitlistForCancellation(cancelledAppointment) {
    // Mock implementation for waitlist integration
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
    try {
      // Get all appointments for the date
      const params = {
        fields: [
          { field: { Name: "time_c" } },
          { field: { Name: "duration_c" } }
        ],
        where: [
          {
            FieldName: "date_c",
            Operator: "EqualTo",
            Values: [date],
            Include: true
          },
          {
            FieldName: "status_c",
            Operator: "NotEqualTo",
            Values: ["Cancelled"],
            Include: true
          }
        ]
      };

      const response = await apperClient.fetchRecords('appointment_c', params);
      const dayAppointments = response.success ? response.data : [];
      
      // Generate time slots (9 AM to 5 PM, 30-minute intervals)
      const allSlots = [];
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          allSlots.push(timeString);
        }
      }
      
      // Filter out booked slots
      const bookedTimes = dayAppointments.map(apt => apt.time_c);
      const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
      
      return availableSlots.map(time => ({
        date,
        time,
        type: appointmentType || 'General',
        duration: 30
      }));
    } catch (error) {
      console.error("Error getting available slots:", error.message);
      return [];
    }
  },

  async enrollInWaitlist(patientId, appointmentType, preferredDate = null) {
    // Mock implementation for waitlist integration
    return {
      patientId,
      appointmentType,
      preferredDate,
      enrolledAt: new Date().toISOString()
    };
  },

  // Reminder integration methods - mock implementation
  async scheduleReminders(appointmentId, reminderConfig) {
    // Mock implementation for reminder integration
    return {
      appointmentId,
      remindersScheduled: reminderConfig.dayBefore || reminderConfig.hourBefore || reminderConfig.customTime ? 
        ['24h', '1h'].filter((_, i) => [reminderConfig.dayBefore, reminderConfig.hourBefore][i]) : [],
      reminderType: reminderConfig.type || 'email'
    };
  },

  async cancelReminders(appointmentId) {
    // Mock implementation for reminder cancellation
    return {
      appointmentId,
      cancelledReminders: ['24h', '1h']
    };
  }
};