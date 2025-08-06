import patientData from "../mockData/patients.json";

let patients = [...patientData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const patientService = {
  async getAll() {
    await delay(300);
    return [...patients];
  },

  async getById(id) {
    await delay(200);
    return patients.find(patient => patient.Id === id) || null;
  },

  async create(patientData) {
    await delay(400);
    const newPatient = {
      ...patientData,
      Id: Math.max(...patients.map(p => p.Id)) + 1,
      createdAt: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0]
    };
    patients.unshift(newPatient);
    return newPatient;
  },

  async update(id, patientData) {
    await delay(400);
    const index = patients.findIndex(patient => patient.Id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...patientData };
      return patients[index];
    }
    throw new Error("Patient not found");
  },

async delete(id) {
    await delay(300);
    const index = patients.findIndex(patient => patient.Id === id);
    if (index !== -1) {
      const deleted = patients.splice(index, 1)[0];
      return deleted;
    }
    throw new Error("Patient not found");
  },

  async getDocuments(patientId) {
    await delay(200);
    const patient = patients.find(p => p.Id === patientId);
    return patient?.documents || [];
  },

  async addDocuments(patientId, files) {
    await delay(500);
    const patient = patients.find(p => p.Id === patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    if (!patient.documents) {
      patient.documents = [];
    }

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

    patient.documents.push(...newDocuments);
    return newDocuments;
  },

  async deleteDocument(patientId, documentId) {
    await delay(300);
    const patient = patients.find(p => p.Id === patientId);
    if (!patient || !patient.documents) {
      throw new Error("Patient or document not found");
    }

    const docIndex = patient.documents.findIndex(doc => doc.Id === documentId);
    if (docIndex === -1) {
      throw new Error("Document not found");
    }

    patient.documents.splice(docIndex, 1);
    return true;
  }
};