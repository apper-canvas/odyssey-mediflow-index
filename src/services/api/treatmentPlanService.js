const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const treatmentPlanService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "target_end_date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.fetchRecords('treatment_plan_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.map(plan => ({
        Id: plan.Id,
        patientId: plan.patient_id_c?.Id || plan.patient_id_c,
        title: plan.title_c || '',
        description: plan.description_c || '',
        status: plan.status_c || 'active',
        startDate: plan.start_date_c || '',
        targetEndDate: plan.target_end_date_c || '',
        createdAt: plan.created_at_c || new Date().toISOString(),
        milestones: [] // Mock milestones since not in schema
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching treatment plans:", error?.response?.data?.message);
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
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "target_end_date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById('treatment_plan_c', id, params);
      
      if (!response.success || !response.data) {
        return null;
      }

      const plan = response.data;
      return {
        Id: plan.Id,
        patientId: plan.patient_id_c?.Id || plan.patient_id_c,
        title: plan.title_c || '',
        description: plan.description_c || '',
        status: plan.status_c || 'active',
        startDate: plan.start_date_c || '',
        targetEndDate: plan.target_end_date_c || '',
        createdAt: plan.created_at_c || new Date().toISOString(),
        milestones: [] // Mock milestones since not in schema
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching treatment plan with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async getByPatientId(patientId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "target_end_date_c" } },
          { field: { Name: "created_at_c" } }
        ],
        where: [
          {
            FieldName: "patient_id_c",
            Operator: "EqualTo",
            Values: [parseInt(patientId)],
            Include: true
          }
        ]
      };

      const response = await apperClient.fetchRecords('treatment_plan_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const plans = response.data || [];
      return plans.length > 0 ? {
        Id: plans[0].Id,
        patientId: plans[0].patient_id_c?.Id || plans[0].patient_id_c,
        title: plans[0].title_c || '',
        description: plans[0].description_c || '',
        status: plans[0].status_c || 'active',
        startDate: plans[0].start_date_c || '',
        targetEndDate: plans[0].target_end_date_c || '',
        createdAt: plans[0].created_at_c || new Date().toISOString(),
        milestones: [] // Mock milestones since not in schema
      } : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching treatment plan for patient ${patientId}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  },

  async create(treatmentPlan) {
    try {
      const params = {
        records: [
          {
            Name: treatmentPlan.title || 'Treatment Plan',
            patient_id_c: parseInt(treatmentPlan.patientId),
            title_c: treatmentPlan.title || '',
            description_c: treatmentPlan.description || '',
            status_c: treatmentPlan.status || 'active',
            start_date_c: treatmentPlan.startDate || new Date().toISOString().split('T')[0],
            target_end_date_c: treatmentPlan.targetEndDate || '',
            created_at_c: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('treatment_plan_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create treatment plan ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create treatment plan');
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          return await this.getById(successfulRecord.data.Id);
        }
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating treatment plan:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const updateData = {
        patient_id_c: updates.patientId ? parseInt(updates.patientId) : undefined,
        title_c: updates.title || undefined,
        description_c: updates.description || undefined,
        status_c: updates.status || undefined,
        start_date_c: updates.startDate || undefined,
        target_end_date_c: updates.targetEndDate || undefined
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

      const response = await apperClient.updateRecord('treatment_plan_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update treatment plan ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update treatment plan');
        }

        return await this.getById(id);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating treatment plan:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = { RecordIds: [id] };
      const response = await apperClient.deleteRecord('treatment_plan_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete treatment plan ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to delete treatment plan');
        }

        return true;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting treatment plan:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  // Mock milestone methods since milestones aren't in the schema
  async addMilestone(treatmentPlanId, milestone) {
    // Mock implementation for milestones
    const newMilestone = {
      ...milestone,
      Id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    
    return { ...newMilestone };
  },

  async updateMilestoneStatus(milestoneId, status, notes = '') {
    // Mock implementation for milestone status updates
    const milestone = {
      Id: milestoneId,
      status: status,
      notes: notes
    };
    
    if (status === 'completed') {
      milestone.completedDate = new Date().toISOString();
    }
    
    return { ...milestone };
  },

  async deleteMilestone(milestoneId) {
    // Mock implementation for milestone deletion
    return true;
  }
};