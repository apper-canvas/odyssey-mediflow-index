const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const clinicalNoteService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "appointment_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "chief_complaint_c" } },
          { field: { Name: "symptoms_c" } },
          { field: { Name: "diagnosis_c" } },
          { field: { Name: "treatment_c" } },
          { field: { Name: "follow_up_c" } },
          { field: { Name: "doctor_id_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.fetchRecords('clinical_note_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.map(note => ({
        Id: note.Id,
        patientId: note.patient_id_c?.Id || note.patient_id_c,
        appointmentId: note.appointment_id_c?.Id || note.appointment_id_c,
        date: note.date_c || '',
        chiefComplaint: note.chief_complaint_c || '',
        symptoms: note.symptoms_c || '',
        diagnosis: note.diagnosis_c || '',
        treatment: note.treatment_c || '',
        followUp: note.follow_up_c || '',
        doctorId: note.doctor_id_c || '',
        createdAt: note.created_at_c || new Date().toISOString().split('T')[0]
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching clinical notes:", error?.response?.data?.message);
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
          { field: { Name: "appointment_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "chief_complaint_c" } },
          { field: { Name: "symptoms_c" } },
          { field: { Name: "diagnosis_c" } },
          { field: { Name: "treatment_c" } },
          { field: { Name: "follow_up_c" } },
          { field: { Name: "doctor_id_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById('clinical_note_c', id, params);
      
      if (!response.success || !response.data) {
        return null;
      }

      const note = response.data;
      return {
        Id: note.Id,
        patientId: note.patient_id_c?.Id || note.patient_id_c,
        appointmentId: note.appointment_id_c?.Id || note.appointment_id_c,
        date: note.date_c || '',
        chiefComplaint: note.chief_complaint_c || '',
        symptoms: note.symptoms_c || '',
        diagnosis: note.diagnosis_c || '',
        treatment: note.treatment_c || '',
        followUp: note.follow_up_c || '',
        doctorId: note.doctor_id_c || '',
        createdAt: note.created_at_c || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching clinical note with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(noteData) {
    try {
      const params = {
        records: [
          {
            Name: `Clinical Note - ${noteData.chiefComplaint?.substring(0, 50) || 'Note'}`,
            patient_id_c: parseInt(noteData.patientId),
            appointment_id_c: noteData.appointmentId ? parseInt(noteData.appointmentId) : null,
            date_c: noteData.date || new Date().toISOString().split('T')[0],
            chief_complaint_c: noteData.chiefComplaint || '',
            symptoms_c: noteData.symptoms || '',
            diagnosis_c: noteData.diagnosis || '',
            treatment_c: noteData.treatment || '',
            follow_up_c: noteData.followUp || '',
            doctor_id_c: noteData.doctorId || '',
            created_at_c: new Date().toISOString().split('T')[0]
          }
        ]
      };

      const response = await apperClient.createRecord('clinical_note_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create clinical note ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create clinical note');
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          return await this.getById(successfulRecord.data.Id);
        }
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating clinical note:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, noteData) {
    try {
      const updateData = {
        patient_id_c: noteData.patientId ? parseInt(noteData.patientId) : undefined,
        appointment_id_c: noteData.appointmentId ? parseInt(noteData.appointmentId) : undefined,
        date_c: noteData.date || undefined,
        chief_complaint_c: noteData.chiefComplaint || undefined,
        symptoms_c: noteData.symptoms || undefined,
        diagnosis_c: noteData.diagnosis || undefined,
        treatment_c: noteData.treatment || undefined,
        follow_up_c: noteData.followUp || undefined,
        doctor_id_c: noteData.doctorId || undefined
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

      const response = await apperClient.updateRecord('clinical_note_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update clinical note ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update clinical note');
        }

        return await this.getById(id);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating clinical note:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = { RecordIds: [id] };
      const response = await apperClient.deleteRecord('clinical_note_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete clinical note ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to delete clinical note');
        }

        return true;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting clinical note:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};