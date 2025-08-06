import mockDoctors from '@/services/mockData/doctors.json';

let doctors = [...mockDoctors];
let nextId = Math.max(...doctors.map(d => d.Id)) + 1;

export const doctorService = {
  // Get all doctors
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...doctors]);
      }, 100);
    });
  },

  // Get doctor by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const doctorId = parseInt(id);
        if (isNaN(doctorId)) {
          reject(new Error('Invalid doctor ID'));
          return;
        }
        
        const doctor = doctors.find(d => d.Id === doctorId);
        if (doctor) {
          resolve({ ...doctor });
        } else {
          reject(new Error('Doctor not found'));
        }
      }, 100);
    });
  },

  // Create new doctor
  create: (doctorData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!doctorData.name || !doctorData.specialty || !doctorData.email) {
            reject(new Error('Name, specialty, and email are required'));
            return;
          }

          const newDoctor = {
            ...doctorData,
            Id: nextId++,
            joinedDate: new Date().toISOString().split('T')[0],
            status: doctorData.status || 'Active'
          };
          
          doctors.push(newDoctor);
          resolve({ ...newDoctor });
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  },

  // Update doctor
  update: (id, updates) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const doctorId = parseInt(id);
          if (isNaN(doctorId)) {
            reject(new Error('Invalid doctor ID'));
            return;
          }

          const index = doctors.findIndex(d => d.Id === doctorId);
          if (index === -1) {
            reject(new Error('Doctor not found'));
            return;
          }

          // Don't allow ID changes
          const { Id, ...updateData } = updates;
          doctors[index] = { ...doctors[index], ...updateData };
          resolve({ ...doctors[index] });
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  },

  // Delete doctor
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const doctorId = parseInt(id);
          if (isNaN(doctorId)) {
            reject(new Error('Invalid doctor ID'));
            return;
          }

          const index = doctors.findIndex(d => d.Id === doctorId);
          if (index === -1) {
            reject(new Error('Doctor not found'));
            return;
          }

          const deletedDoctor = doctors.splice(index, 1)[0];
          resolve({ ...deletedDoctor });
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  },

  // Search doctors
  search: (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const searchTerm = query.toLowerCase();
        const filtered = doctors.filter(doctor =>
          doctor.name.toLowerCase().includes(searchTerm) ||
          doctor.specialty.toLowerCase().includes(searchTerm) ||
          doctor.department.toLowerCase().includes(searchTerm) ||
          doctor.email.toLowerCase().includes(searchTerm)
        );
        resolve([...filtered]);
      }, 150);
    });
  },

  // Filter by specialty
  filterBySpecialty: (specialty) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!specialty || specialty === 'All') {
          resolve([...doctors]);
        } else {
          const filtered = doctors.filter(doctor =>
            doctor.specialty === specialty
          );
          resolve([...filtered]);
        }
      }, 100);
    });
  },

  // Filter by status
  filterByStatus: (status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!status || status === 'All') {
          resolve([...doctors]);
        } else {
          const filtered = doctors.filter(doctor =>
            doctor.status === status
          );
          resolve([...filtered]);
        }
      }, 100);
    });
  },

  // Get specialties list
  getSpecialties: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const specialties = [...new Set(doctors.map(d => d.specialty))];
        resolve(specialties);
      }, 50);
    });
  }
};

export default doctorService;