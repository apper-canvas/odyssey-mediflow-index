const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const billingService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "invoice_number_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "items_c" } },
          { field: { Name: "payment_method_c" } },
          { field: { Name: "paid_date_c" } },
          { field: { Name: "notes_c" } }
        ]
      };

      const response = await apperClient.fetchRecords('billing_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.map(record => ({
        Id: record.Id,
        patientId: record.patient_id_c?.Id || record.patient_id_c,
        invoiceNumber: record.invoice_number_c || '',
        date: record.date_c || '',
        dueDate: record.due_date_c || '',
        status: record.status_c || 'draft',
        amount: record.amount_c || 0,
        items: record.items_c ? JSON.parse(record.items_c) : [],
        paymentMethod: record.payment_method_c || null,
        paidDate: record.paid_date_c || null,
        notes: record.notes_c || ''
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching billing records:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('ID must be an integer');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "invoice_number_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "items_c" } },
          { field: { Name: "payment_method_c" } },
          { field: { Name: "paid_date_c" } },
          { field: { Name: "notes_c" } }
        ]
      };

      const response = await apperClient.getRecordById('billing_c', id, params);
      
      if (!response.success || !response.data) {
        throw new Error(`Billing record with ID ${id} not found`);
      }

      const record = response.data;
      return {
        Id: record.Id,
        patientId: record.patient_id_c?.Id || record.patient_id_c,
        invoiceNumber: record.invoice_number_c || '',
        date: record.date_c || '',
        dueDate: record.due_date_c || '',
        status: record.status_c || 'draft',
        amount: record.amount_c || 0,
        items: record.items_c ? JSON.parse(record.items_c) : [],
        paymentMethod: record.payment_method_c || null,
        paidDate: record.paid_date_c || null,
        notes: record.notes_c || ''
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching billing record with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getByPatientId(patientId) {
    try {
      if (!Number.isInteger(patientId)) {
        throw new Error('Patient ID must be an integer');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patient_id_c" } },
          { field: { Name: "invoice_number_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "items_c" } },
          { field: { Name: "payment_method_c" } },
          { field: { Name: "paid_date_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [
          {
            FieldName: "patient_id_c",
            Operator: "EqualTo",
            Values: [patientId],
            Include: true
          }
        ]
      };

      const response = await apperClient.fetchRecords('billing_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data?.map(record => ({
        Id: record.Id,
        patientId: record.patient_id_c?.Id || record.patient_id_c,
        invoiceNumber: record.invoice_number_c || '',
        date: record.date_c || '',
        dueDate: record.due_date_c || '',
        status: record.status_c || 'draft',
        amount: record.amount_c || 0,
        items: record.items_c ? JSON.parse(record.items_c) : [],
        paymentMethod: record.payment_method_c || null,
        paidDate: record.paid_date_c || null,
        notes: record.notes_c || ''
      })) || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching billing records for patient ${patientId}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(billingData) {
    try {
      const params = {
        records: [
          {
            Name: `Invoice - ${billingData.invoiceNumber || 'New'}`,
            patient_id_c: parseInt(billingData.patientId),
            invoice_number_c: billingData.invoiceNumber || '',
            date_c: billingData.date || new Date().toISOString().split('T')[0],
            due_date_c: billingData.dueDate || '',
            status_c: billingData.status || 'draft',
            amount_c: billingData.amount || 0,
            items_c: JSON.stringify(billingData.items || []),
            payment_method_c: billingData.paymentMethod || null,
            paid_date_c: billingData.paidDate || null,
            notes_c: billingData.notes || ''
          }
        ]
      };

      const response = await apperClient.createRecord('billing_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create billing record ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to create billing record');
        }

        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          return await this.getById(successfulRecord.data.Id);
        }
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating billing record:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, billingData) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('ID must be an integer');
      }

      const updateData = {
        patient_id_c: billingData.patientId ? parseInt(billingData.patientId) : undefined,
        invoice_number_c: billingData.invoiceNumber || undefined,
        date_c: billingData.date || undefined,
        due_date_c: billingData.dueDate || undefined,
        status_c: billingData.status || undefined,
        amount_c: billingData.amount || undefined,
        items_c: billingData.items ? JSON.stringify(billingData.items) : undefined,
        payment_method_c: billingData.paymentMethod || undefined,
        paid_date_c: billingData.paidDate || undefined,
        notes_c: billingData.notes || undefined
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

      const response = await apperClient.updateRecord('billing_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update billing record ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to update billing record');
        }

        return await this.getById(id);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating billing record:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('ID must be an integer');
      }

      const params = { RecordIds: [id] };
      const response = await apperClient.deleteRecord('billing_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete billing record ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to delete billing record');
        }

        return true;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting billing record:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async processPayment(id, paymentData) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('ID must be an integer');
      }

      const updateData = {
        status_c: 'paid',
        payment_method_c: paymentData.paymentMethod,
        paid_date_c: new Date().toISOString().split('T')[0]
      };

      const params = {
        records: [{ Id: id, ...updateData }]
      };

      const response = await apperClient.updateRecord('billing_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to process payment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error('Failed to process payment');
        }

        return await this.getById(id);
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error processing payment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async generateInvoice(id) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('ID must be an integer');
      }

      const record = await this.getById(id);
      if (!record) {
        throw new Error(`Billing record with ID ${id} not found`);
      }

      // Mock invoice generation
      return {
        invoiceUrl: `https://example.com/invoices/${record.invoiceNumber}.pdf`,
        invoiceNumber: record.invoiceNumber
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error generating invoice:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};