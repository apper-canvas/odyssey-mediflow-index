import { patientService } from "./patientService";
import { appointmentService } from "./appointmentService";
import { clinicalNoteService } from "./clinicalNoteService";
import { format, subDays, subMonths, isWithinInterval, parseISO } from "date-fns";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// CSV Generation Functions
const generateCSV = (data, headers) => {
  if (!data || data.length === 0) return "";
  
  const csvHeaders = headers.join(",");
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      
      // Handle arrays and objects
      if (Array.isArray(value)) return `"${value.join('; ')}"`;
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      
      // Escape quotes in strings
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(",")
  );
  
  return [csvHeaders, ...csvRows].join("\n");
};

// PDF Generation (simplified - in real app would use jsPDF or similar)
const generatePDF = (data, title, config) => {
  // This is a simplified PDF generation - in production you'd use jsPDF
  const content = `
${title}
Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}
Export Configuration: ${JSON.stringify(config, null, 2)}

Data Summary:
${JSON.stringify(data, null, 2)}
  `;
  
  return content;
};

// Date Range Filtering
const getDateRange = (rangeType, startDate, endDate) => {
  const now = new Date();
  
  switch (rangeType) {
    case "week":
      return { start: subDays(now, 7), end: now };
    case "month":
      return { start: subDays(now, 30), end: now };
    case "quarter":
      return { start: subDays(now, 90), end: now };
    case "year":
      return { start: subDays(now, 365), end: now };
    case "custom":
      return { 
        start: startDate ? parseISO(startDate) : subDays(now, 30), 
        end: endDate ? parseISO(endDate) : now 
      };
    default:
      return null; // All time
  }
};

// Data Processing Functions
const processPatientData = (patients, config) => {
  const headers = [
    'Id', 'firstName', 'lastName', 'dateOfBirth', 'phone', 'email', 'address',
    'emergencyContactName', 'emergencyContactPhone', 'medicalHistory', 'allergies', 
    'currentMedications', 'createdAt', 'lastVisit'
  ];
  
  return patients.map(patient => ({
    ...patient,
    emergencyContactName: patient.emergencyContact?.name || '',
    emergencyContactPhone: patient.emergencyContact?.phone || '',
    medicalHistory: patient.medicalHistory?.join('; ') || '',
    allergies: patient.allergies?.join('; ') || '',
    currentMedications: patient.currentMedications?.join('; ') || ''
  }));
};

const processAppointmentData = (appointments, patients, config) => {
  const headers = [
    'Id', 'patientId', 'patientName', 'doctorId', 'date', 'time', 'duration',
    'type', 'status', 'notes', 'createdAt'
  ];
  
  return appointments.map(appointment => {
    const patient = patients.find(p => p.Id === appointment.patientId);
    return {
      ...appointment,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
    };
  });
};

const processClinicalNotesData = (notes, patients, config) => {
  const headers = [
    'Id', 'patientId', 'patientName', 'appointmentId', 'date', 'chiefComplaint',
    'symptoms', 'diagnosis', 'treatment', 'followUp', 'doctorId', 'createdAt'
  ];
  
  return notes.map(note => {
    const patient = patients.find(p => p.Id === note.patientId);
    return {
      ...note,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
    };
  });
};

export const exportService = {
  async exportData(config) {
    await delay(1000); // Simulate processing time
    
    try {
      // Fetch all required data
      const [patients, appointments, clinicalNotes] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll(),
        clinicalNoteService.getAll()
      ]);

      // Apply date filtering if specified
      const dateRange = getDateRange(config.dateRange, config.startDate, config.endDate);
      
      let filteredAppointments = appointments;
      let filteredNotes = clinicalNotes;
      let filteredPatients = patients;

      if (dateRange) {
        filteredAppointments = appointments.filter(apt => 
          isWithinInterval(parseISO(apt.date), dateRange)
        );
        filteredNotes = clinicalNotes.filter(note => 
          isWithinInterval(parseISO(note.date), dateRange)
        );
        filteredPatients = patients.filter(patient => 
          isWithinInterval(parseISO(patient.createdAt), dateRange)
        );
      }

      // Process data based on selected types
      const exportData = {};
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");

      if (config.dataTypes.includes('patients')) {
        exportData.patients = processPatientData(filteredPatients, config);
      }

      if (config.dataTypes.includes('appointments')) {
        exportData.appointments = processAppointmentData(filteredAppointments, patients, config);
      }

      if (config.dataTypes.includes('clinicalNotes')) {
        exportData.clinicalNotes = processClinicalNotesData(filteredNotes, patients, config);
      }

      // Handle reports-specific data types
      if (config.dataTypes.includes('summary')) {
        exportData.summary = [{
          totalPatients: patients.length,
          totalAppointments: filteredAppointments.length,
          completedAppointments: filteredAppointments.filter(a => a.status === 'Completed').length,
          cancelledAppointments: filteredAppointments.filter(a => a.status === 'Cancelled').length,
          totalClinicalNotes: filteredNotes.length,
          exportDate: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          dateRange: config.dateRange
        }];
      }

      if (config.dataTypes.includes('analytics')) {
        const appointmentsByType = filteredAppointments.reduce((acc, apt) => {
          acc[apt.type] = (acc[apt.type] || 0) + 1;
          return acc;
        }, {});
        
        exportData.analytics = Object.entries(appointmentsByType).map(([type, count]) => ({
          appointmentType: type,
          count,
          percentage: Math.round((count / filteredAppointments.length) * 100)
        }));
      }

      // Generate file based on format
      let fileContent;
      let filename;

      if (config.format === 'csv') {
        // For CSV, combine all selected data types
        const combinedData = [];
        const allHeaders = new Set();

        Object.entries(exportData).forEach(([dataType, data]) => {
          data.forEach(record => {
            const recordWithType = { dataType, ...record };
            combinedData.push(recordWithType);
            Object.keys(recordWithType).forEach(key => allHeaders.add(key));
          });
        });

        fileContent = generateCSV(combinedData, Array.from(allHeaders));
        filename = `export_${config.sourceType}_${timestamp}.csv`;
      } else {
        // PDF format
        const title = `${config.sourceType.charAt(0).toUpperCase() + config.sourceType.slice(1)} Export Report`;
        fileContent = generatePDF(exportData, title, config);
        filename = `export_${config.sourceType}_${timestamp}.pdf`;
      }

      return {
        data: fileContent,
        filename,
        recordCount: Object.values(exportData).reduce((total, data) => total + data.length, 0),
        dataTypes: config.dataTypes,
        format: config.format
      };

    } catch (error) {
      console.error('Export service error:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  },

  async getExportPreview(config) {
    await delay(300);
    
    // Return a preview of what will be exported
    const [patients, appointments, clinicalNotes] = await Promise.all([
      patientService.getAll(),
      appointmentService.getAll(),
      clinicalNoteService.getAll()
    ]);

    const dateRange = getDateRange(config.dateRange, config.startDate, config.endDate);
    
    let counts = {
      patients: patients.length,
      appointments: appointments.length,
      clinicalNotes: clinicalNotes.length
    };

    if (dateRange) {
      counts = {
        patients: patients.filter(p => isWithinInterval(parseISO(p.createdAt), dateRange)).length,
        appointments: appointments.filter(a => isWithinInterval(parseISO(a.date), dateRange)).length,
        clinicalNotes: clinicalNotes.filter(n => isWithinInterval(parseISO(n.date), dateRange)).length
      };
    }

    return {
      counts,
      estimatedSize: Object.entries(counts)
        .filter(([type]) => config.dataTypes.includes(type))
        .reduce((total, [, count]) => total + count, 0)
    };
  }
};