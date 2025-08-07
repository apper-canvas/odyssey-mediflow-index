import { billingService } from "./billingService";

const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const patientService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "date_of_birth_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "emergency_contact_name_c" } },
          { field: { Name: "emergency_contact_phone_c" } },
          { field: { Name: "emergency_contact_relationship_c" } },
          { field: { Name: "medical_history_c" } },
          { field: { Name: "allergies_c" } },
          { field: { Name: "current_medications_c" } },
          { field: { Name: "last_visit_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };

      const response = await apperClient.fetchRecords('patient_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.map(patient => ({
        Id: patient.Id,
        firstName: patient.first_name_c || '',
        lastName: patient.last_name_c || '',
        dateOfBirth: patient.date_of_birth_c || '',
        phone: patient.phone_c || '',
        email: patient.email_c || '',
        address: patient.address_c || '',
        emergencyContact: {
          name: patient.emergency_contact_name_c || '',
          phone: patient.emergency_contact_phone_c || '',
          relationship: patient.emergency_contact_relationship_c || ''
        },
        medicalHistory: patient.medical_history_c ? patient.medical_history_c.split(',').map(item => item.trim()) : [],
        allergies: patient.allergies_c ? patient.allergies_c.split(',').map(item => item.trim()) : [],
        currentMedications: patient.current_medications_c ? patient.current_medications_c.split(',').map(item => item.trim()) : [],
        lastVisit: patient.last_visit_c || new Date().toISOString().split('T')[0],
        createdAt: patient.CreatedOn?.split('T')[0] || new Date().toISOString().split('T')[0]
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching patients:", error?.response?.data?.message);
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
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "date_of_birth_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "emergency_contact_name_c" } },
          { field: { Name: "emergency_contact_phone_c" } },
          { field: { Name: "emergency_contact_relationship_c" } },
          { field: { Name: "medical_history_c" } },
          { field: { Name: "allergies_c" } },
          { field: { Name: "current_medications_c" } },
          { field: { Name: "last_visit_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };

      const response = await apperClient.getRecordById('patient_c', id, params);
      
      if (!response.success || !response.data) {
        return null;
      }

      const patient = response.data;
      return {
        Id: patient.Id,
        firstName: patient.first_name_c || '',
        lastName: patient.last_name_c || '',
        dateOfBirth: patient.date_of_birth_c || '',
        phone: patient.phone_c || '',
        email: patient.email_c || '',
        address: patient.address_c || '',
        emergencyContact: {
          name: patient.emergency_contact_name_c || '',
          phone: patient.emergency_contact_phone_c || '',
          relationship: patient.emergency_contact_relationship_c || ''
        },
        medicalHistory: patient.medical_history_c ? patient.medical_history_c.split(',').map(item => item.trim()) : [],
        allergies: patient.allergies_c ? patient.allergies_c.split(',').map(item => item.trim()) : [],
        currentMedications: patient.current_medications_c ? patient.current_medications_c.split(',').map(item => item.trim()) : [],
        lastVisit: patient.last_visit_c || new Date().toISOString().split('T')[0],
        createdAt: patient.CreatedOn?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching patient with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(patientData) {
    try {
      const params = {
        records: [
          {
            Name: `${patientData.firstName} ${patientData.lastName}`,
            first_name_c: patientData.firstName,
            last_name_c: patientData.lastName,
            date_of_birth_c: patientData.dateOfBirth,
            phone_c: patientData.phone,
            email_c: patientData.email,
            address_c: patientData.address || '',
            emergency_contact_name_c: patientData.emergencyContact?.name || '',
            emergency_contact_phone_c: patientData.emergencyContact?.phone || '',
            emergency_contact_relationship_c: patientData.emergencyContact?.relationship || '',
            medical_history_c: Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory.join(', ') : '',
            allergies_c: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : '',
            current_medications_c: Array.isArray(patientData.currentMedications) ? patientData.currentMedications.join(', ') : '',
            last_visit_c: new Date().toISOString().split('T')[0]
          }
        ]
      };

      const response = await apperClient.createRecord('patient_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create patient ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create patient');
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          return this.getById(successfulRecord.data.Id);
        }
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating patient:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, patientData) {
    try {
      const updateData = {
        Name: `${patientData.firstName} ${patientData.lastName}`,
        first_name_c: patientData.firstName,
        last_name_c: patientData.lastName,
        date_of_birth_c: patientData.dateOfBirth,
        phone_c: patientData.phone,
        email_c: patientData.email,
        address_c: patientData.address || '',
        emergency_contact_name_c: patientData.emergencyContact?.name || '',
        emergency_contact_phone_c: patientData.emergencyContact?.phone || '',
        emergency_contact_relationship_c: patientData.emergencyContact?.relationship || '',
        medical_history_c: Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory.join(', ') : '',
        allergies_c: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : '',
        current_medications_c: Array.isArray(patientData.currentMedications) ? patientData.currentMedications.join(', ') : ''
      };

      const params = {
        records: [{ Id: id, ...updateData }]
      };

      const response = await apperClient.updateRecord('patient_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update patient ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update patient');
        }

        return this.getById(id);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating patient:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = { RecordIds: [id] };
      const response = await apperClient.deleteRecord('patient_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete patient ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to delete patient');
        }

        return true;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting patient:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  // Document management - using mock implementation since documents aren't in schema
  async getDocuments(patientId) {
    // Mock implementation for documents
    return [];
  },

  async addDocuments(patientId, files) {
    // Mock implementation for documents
    const newDocuments = files.map((file, index) => ({
      Id: Date.now() + index,
      name: file.name,
      type: file.type.split('/')[1],
      size: file.size,
      category: file.category,
      uploadedAt: new Date().toISOString(),
      url: file.url,
      preview: file.preview
    }));
    return newDocuments;
  },

  async deleteDocument(patientId, documentId) {
    // Mock implementation for documents
    return true;
  },

  // Billing integration
  async getBillingRecords(patientId) {
    return await billingService.getByPatientId(patientId);
  },

  async createBillingRecord(billingData) {
    return await billingService.create(billingData);
  },

  async updateBillingRecord(id, billingData) {
    return await billingService.update(id, billingData);
  },

  async deleteBillingRecord(id) {
    return await billingService.delete(id);
  },

  async processPayment(billingId, paymentData) {
    return await billingService.processPayment(billingId, paymentData);
  },

  async generateInvoice(billingId) {
    return await billingService.generateInvoice(billingId);
  }
};