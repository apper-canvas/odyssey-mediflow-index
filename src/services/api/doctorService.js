const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const doctorService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "specialty_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "license_number_c" } },
          { field: { Name: "years_experience_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "education_c" } },
          { field: { Name: "certifications_c" } },
          { field: { Name: "consultation_fee_c" } },
          { field: { Name: "availability_c" } },
          { field: { Name: "bio_c" } },
          { field: { Name: "joined_date_c" } }
        ]
      };

      const response = await apperClient.fetchRecords('doctor_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.map(doctor => ({
        Id: doctor.Id,
        name: doctor.Name || '',
        specialty: doctor.specialty_c || '',
        email: doctor.email_c || '',
        phone: doctor.phone_c || '',
        licenseNumber: doctor.license_number_c || '',
        yearsExperience: doctor.years_experience_c || 0,
        status: doctor.status_c || 'Active',
        department: doctor.department_c || '',
        education: doctor.education_c || '',
        certifications: doctor.certifications_c ? doctor.certifications_c.split(',').map(item => item.trim()) : [],
        consultationFee: doctor.consultation_fee_c || 0,
        availability: doctor.availability_c || '',
        bio: doctor.bio_c || '',
        joinedDate: doctor.joined_date_c || new Date().toISOString().split('T')[0]
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching doctors:", error?.response?.data?.message);
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
          { field: { Name: "specialty_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "license_number_c" } },
          { field: { Name: "years_experience_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "education_c" } },
          { field: { Name: "certifications_c" } },
          { field: { Name: "consultation_fee_c" } },
          { field: { Name: "availability_c" } },
          { field: { Name: "bio_c" } },
          { field: { Name: "joined_date_c" } }
        ]
      };

      const response = await apperClient.getRecordById('doctor_c', id, params);
      
      if (!response.success || !response.data) {
        throw new Error('Doctor not found');
      }

      const doctor = response.data;
      return {
        Id: doctor.Id,
        name: doctor.Name || '',
        specialty: doctor.specialty_c || '',
        email: doctor.email_c || '',
        phone: doctor.phone_c || '',
        licenseNumber: doctor.license_number_c || '',
        yearsExperience: doctor.years_experience_c || 0,
        status: doctor.status_c || 'Active',
        department: doctor.department_c || '',
        education: doctor.education_c || '',
        certifications: doctor.certifications_c ? doctor.certifications_c.split(',').map(item => item.trim()) : [],
        consultationFee: doctor.consultation_fee_c || 0,
        availability: doctor.availability_c || '',
        bio: doctor.bio_c || '',
        joinedDate: doctor.joined_date_c || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching doctor with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async create(doctorData) {
    try {
      const params = {
        records: [
          {
            Name: doctorData.name,
            specialty_c: doctorData.specialty,
            email_c: doctorData.email,
            phone_c: doctorData.phone,
            license_number_c: doctorData.licenseNumber,
            years_experience_c: doctorData.yearsExperience,
            status_c: doctorData.status || 'Active',
            department_c: doctorData.department || '',
            education_c: doctorData.education || '',
            certifications_c: Array.isArray(doctorData.certifications) ? doctorData.certifications.join(', ') : '',
            consultation_fee_c: doctorData.consultationFee || 0,
            availability_c: doctorData.availability || '',
            bio_c: doctorData.bio || '',
            joined_date_c: new Date().toISOString().split('T')[0]
          }
        ]
      };

      const response = await apperClient.createRecord('doctor_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create doctor ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create doctor');
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          return await this.getById(successfulRecord.data.Id);
        }
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating doctor:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const updateData = {
        Name: updates.name,
        specialty_c: updates.specialty,
        email_c: updates.email,
        phone_c: updates.phone,
        license_number_c: updates.licenseNumber,
        years_experience_c: updates.yearsExperience,
        status_c: updates.status,
        department_c: updates.department || '',
        education_c: updates.education || '',
        certifications_c: Array.isArray(updates.certifications) ? updates.certifications.join(', ') : '',
        consultation_fee_c: updates.consultationFee || 0,
        availability_c: updates.availability || '',
        bio_c: updates.bio || ''
      };

      const params = {
        records: [{ Id: id, ...updateData }]
      };

      const response = await apperClient.updateRecord('doctor_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update doctor ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update doctor');
        }

        return await this.getById(id);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating doctor:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = { RecordIds: [id] };
      const response = await apperClient.deleteRecord('doctor_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete doctor ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to delete doctor');
        }

        return true;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting doctor:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async search(query) {
    try {
      const searchTerm = query.toLowerCase();
      const doctors = await this.getAll();
      
      const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm) ||
        doctor.specialty.toLowerCase().includes(searchTerm) ||
        doctor.department.toLowerCase().includes(searchTerm) ||
        doctor.email.toLowerCase().includes(searchTerm)
      );
      
      return filtered;
    } catch (error) {
      console.error("Error searching doctors:", error.message);
      return [];
    }
  },

  async filterBySpecialty(specialty) {
    try {
      if (!specialty || specialty === 'All') {
        return await this.getAll();
      }
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "specialty_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "license_number_c" } },
          { field: { Name: "years_experience_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "education_c" } },
          { field: { Name: "certifications_c" } },
          { field: { Name: "consultation_fee_c" } },
          { field: { Name: "availability_c" } },
          { field: { Name: "bio_c" } },
          { field: { Name: "joined_date_c" } }
        ],
        where: [
          {
            FieldName: "specialty_c",
            Operator: "EqualTo",
            Values: [specialty],
            Include: true
          }
        ]
      };

      const response = await apperClient.fetchRecords('doctor_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data?.map(doctor => ({
        Id: doctor.Id,
        name: doctor.Name || '',
        specialty: doctor.specialty_c || '',
        email: doctor.email_c || '',
        phone: doctor.phone_c || '',
        licenseNumber: doctor.license_number_c || '',
        yearsExperience: doctor.years_experience_c || 0,
        status: doctor.status_c || 'Active',
        department: doctor.department_c || '',
        education: doctor.education_c || '',
        certifications: doctor.certifications_c ? doctor.certifications_c.split(',').map(item => item.trim()) : [],
        consultationFee: doctor.consultation_fee_c || 0,
        availability: doctor.availability_c || '',
        bio: doctor.bio_c || '',
        joinedDate: doctor.joined_date_c || new Date().toISOString().split('T')[0]
      })) || [];
    } catch (error) {
      console.error("Error filtering doctors by specialty:", error.message);
      return [];
    }
  },

  async filterByStatus(status) {
    try {
      if (!status || status === 'All') {
        return await this.getAll();
      }
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "specialty_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "license_number_c" } },
          { field: { Name: "years_experience_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "education_c" } },
          { field: { Name: "certifications_c" } },
          { field: { Name: "consultation_fee_c" } },
          { field: { Name: "availability_c" } },
          { field: { Name: "bio_c" } },
          { field: { Name: "joined_date_c" } }
        ],
        where: [
          {
            FieldName: "status_c",
            Operator: "EqualTo",
            Values: [status],
            Include: true
          }
        ]
      };

      const response = await apperClient.fetchRecords('doctor_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data?.map(doctor => ({
        Id: doctor.Id,
        name: doctor.Name || '',
        specialty: doctor.specialty_c || '',
        email: doctor.email_c || '',
        phone: doctor.phone_c || '',
        licenseNumber: doctor.license_number_c || '',
        yearsExperience: doctor.years_experience_c || 0,
        status: doctor.status_c || 'Active',
        department: doctor.department_c || '',
        education: doctor.education_c || '',
        certifications: doctor.certifications_c ? doctor.certifications_c.split(',').map(item => item.trim()) : [],
        consultationFee: doctor.consultation_fee_c || 0,
        availability: doctor.availability_c || '',
        bio: doctor.bio_c || '',
        joinedDate: doctor.joined_date_c || new Date().toISOString().split('T')[0]
      })) || [];
    } catch (error) {
      console.error("Error filtering doctors by status:", error.message);
      return [];
    }
  },

  async getSpecialties() {
    try {
      const doctors = await this.getAll();
      const specialties = [...new Set(doctors.map(d => d.specialty))].filter(Boolean);
      return specialties;
    } catch (error) {
      console.error("Error fetching specialties:", error.message);
      return [];
    }
  }
};
export default doctorService;