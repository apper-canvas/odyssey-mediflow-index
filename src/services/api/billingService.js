import billingData from '../mockData/billing.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let nextId = Math.max(...billingData.map(item => item.Id)) + 1;
let billingRecords = [...billingData];

export const billingService = {
  async getAll() {
    await delay(300);
    return [...billingRecords];
  },

  async getById(id) {
    if (!Number.isInteger(id)) {
      throw new Error('ID must be an integer');
    }
    await delay(200);
    const record = billingRecords.find(item => item.Id === id);
    if (!record) {
      throw new Error(`Billing record with ID ${id} not found`);
    }
    return { ...record };
  },

  async getByPatientId(patientId) {
    if (!Number.isInteger(patientId)) {
      throw new Error('Patient ID must be an integer');
    }
    await delay(300);
    return billingRecords.filter(record => record.patientId === patientId).map(record => ({ ...record }));
  },

  async create(billingData) {
    await delay(400);
    const newRecord = {
      ...billingData,
      Id: nextId++,
      date: new Date().toISOString().split('T')[0],
      status: 'draft'
    };
    billingRecords.push(newRecord);
    return { ...newRecord };
  },

  async update(id, billingData) {
    if (!Number.isInteger(id)) {
      throw new Error('ID must be an integer');
    }
    await delay(400);
    const index = billingRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`Billing record with ID ${id} not found`);
    }
    billingRecords[index] = { ...billingRecords[index], ...billingData };
    return { ...billingRecords[index] };
  },

  async delete(id) {
    if (!Number.isInteger(id)) {
      throw new Error('ID must be an integer');
    }
    await delay(300);
    const index = billingRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`Billing record with ID ${id} not found`);
    }
    const deleted = billingRecords.splice(index, 1)[0];
    return { ...deleted };
  },

  async processPayment(id, paymentData) {
    if (!Number.isInteger(id)) {
      throw new Error('ID must be an integer');
    }
    await delay(500);
    const index = billingRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`Billing record with ID ${id} not found`);
    }
    billingRecords[index] = {
      ...billingRecords[index],
      status: 'paid',
      paymentMethod: paymentData.paymentMethod,
      paidDate: new Date().toISOString().split('T')[0]
    };
    return { ...billingRecords[index] };
  },

  async generateInvoice(id) {
    if (!Number.isInteger(id)) {
      throw new Error('ID must be an integer');
    }
    await delay(300);
    const record = billingRecords.find(item => item.Id === id);
    if (!record) {
      throw new Error(`Billing record with ID ${id} not found`);
    }
    // Simulate invoice generation
    return {
      invoiceUrl: `https://example.com/invoices/${record.invoiceNumber}.pdf`,
      invoiceNumber: record.invoiceNumber
    };
  }
};