import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import TextArea from "@/components/atoms/TextArea";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { patientService } from "@/services/api/patientService";
import { appointmentService } from "@/services/api/appointmentService";
import { clinicalNoteService } from "@/services/api/clinicalNoteService";
import { documentService } from "@/services/api/documentService";
import DocumentUpload from "@/components/organisms/DocumentUpload";
import { toast } from "react-toastify";
import { format } from "date-fns";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
const [clinicalNotes, setClinicalNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState({
    chiefComplaint: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    followUp: ""
  });

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
setError("");
      
      const [patientData, appointmentsData, notesData, documentsData] = await Promise.all([
        patientService.getById(parseInt(id)),
        appointmentService.getAll(),
        clinicalNoteService.getAll(),
        patientService.getDocuments(parseInt(id))
      ]);

      if (!patientData) {
        setError("Patient not found");
        return;
      }

      setPatient(patientData);
      
      // Filter appointments and notes for this patient
      const patientAppointments = appointmentsData.filter(apt => apt.patientId === parseInt(id));
      const patientNotes = notesData.filter(note => note.patientId === parseInt(id));
      
      setAppointments(patientAppointments);
      setClinicalNotes(patientNotes);
      setDocuments(documentsData);
      
    } catch (err) {
      console.error("Failed to load patient data:", err);
      setError("Failed to load patient data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.chiefComplaint.trim()) {
      toast.error("Chief complaint is required");
      return;
    }

    try {
      const noteData = {
        ...newNote,
        patientId: parseInt(id),
        appointmentId: null, // Can be linked to specific appointment later
        date: new Date().toISOString().split('T')[0],
        doctorId: "dr-sarah-chen"
      };

      const createdNote = await clinicalNoteService.create(noteData);
      setClinicalNotes(prev => [createdNote, ...prev]);
      setNewNote({
        chiefComplaint: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        followUp: ""
      });
      toast.success("Clinical note added successfully");
    } catch (err) {
      console.error("Failed to add note:", err);
      toast.error("Failed to add clinical note");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled": return "scheduled";
      case "confirmed": return "confirmed";
      case "completed": return "completed";
      case "cancelled": return "cancelled";
      default: return "default";
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPatientData} />;
  if (!patient) return <Error message="Patient not found" />;

const handleDocumentUpload = async (files) => {
    try {
      const uploadedDocs = await patientService.addDocuments(parseInt(id), files);
      setDocuments(prev => [...prev, ...uploadedDocs]);
      toast.success(`${files.length} document(s) uploaded successfully`);
    } catch (error) {
      console.error("Failed to upload documents:", error);
      toast.error("Failed to upload documents. Please try again.");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await patientService.deleteDocument(parseInt(id), documentId);
      setDocuments(prev => prev.filter(doc => doc.Id !== documentId));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document. Please try again.");
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: "User" },
    { id: "appointments", name: "Appointments", icon: "Calendar" },
    { id: "notes", name: "Clinical Notes", icon: "FileText" },
    { id: "documents", name: "Documents", icon: "FolderOpen" },
    { id: "history", name: "Medical History", icon: "Activity" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/patients")}
        >
          <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
          Back to Patients
        </Button>
      </div>

      {/* Patient Info Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <ApperIcon name="User" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-slate-600 mt-1">Patient ID: {patient.Id}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-slate-600">
                <span>{format(new Date(patient.dateOfBirth), "MMM d, yyyy")}</span>
                <span>•</span>
                <span>{patient.phone}</span>
                <span>•</span>
                <span>{patient.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6 lg:mt-0">
            <Button variant="outline" size="sm">
              <ApperIcon name="Edit" size={16} className="mr-2" />
              Edit Patient
            </Button>
            <Button variant="primary" size="sm">
              <ApperIcon name="Calendar" size={16} className="mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>

        {/* Allergies Warning */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center text-orange-800">
              <ApperIcon name="AlertTriangle" size={16} className="mr-2" />
              <span className="font-medium">Allergies: </span>
              <span className="ml-2">{patient.allergies.join(", ")}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-600">Address:</span>
                  <p className="text-slate-900">{patient.address || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Emergency Contact:</span>
                  <p className="text-slate-900">
                    {patient.emergencyContact?.name || "Not provided"}
                    {patient.emergencyContact?.phone && ` - ${patient.emergencyContact.phone}`}
                    {patient.emergencyContact?.relationship && ` (${patient.emergencyContact.relationship})`}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Appointments:</span>
                  <span className="font-semibold text-slate-900">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Clinical Notes:</span>
                  <span className="font-semibold text-slate-900">{clinicalNotes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Visit:</span>
                  <span className="font-semibold text-slate-900">
                    {format(new Date(patient.lastVisit), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Patient Since:</span>
                  <span className="font-semibold text-slate-900">
                    {format(new Date(patient.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "appointments" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Appointments</h3>
              <Button variant="primary" size="sm">
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Schedule New
              </Button>
            </div>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div key={appointment.Id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Calendar" size={16} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 capitalize">{appointment.type}</p>
                        <p className="text-sm text-slate-600">
                          {format(new Date(`${appointment.date}T${appointment.time}`), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "notes" && (
          <div className="space-y-6">
            {/* Add New Note */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Clinical Note</h3>
              <div className="space-y-4">
                <TextArea
                  label="Chief Complaint"
                  value={newNote.chiefComplaint}
                  onChange={(e) => setNewNote(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                  placeholder="Primary reason for visit..."
                  rows={2}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextArea
                    label="Symptoms"
                    value={newNote.symptoms}
                    onChange={(e) => setNewNote(prev => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Patient reported symptoms..."
                    rows={3}
                  />
                  <TextArea
                    label="Diagnosis"
                    value={newNote.diagnosis}
                    onChange={(e) => setNewNote(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Clinical diagnosis..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextArea
                    label="Treatment"
                    value={newNote.treatment}
                    onChange={(e) => setNewNote(prev => ({ ...prev, treatment: e.target.value }))}
                    placeholder="Treatment plan and medications..."
                    rows={3}
                  />
                  <TextArea
                    label="Follow-up"
                    value={newNote.followUp}
                    onChange={(e) => setNewNote(prev => ({ ...prev, followUp: e.target.value }))}
                    placeholder="Follow-up instructions..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} variant="primary">
                    <ApperIcon name="Save" size={16} className="mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            </Card>

            {/* Clinical Notes History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Clinical Notes History</h3>
              
              {clinicalNotes.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="FileText" size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No clinical notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clinicalNotes.map(note => (
                    <div key={note.Id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="FileText" size={16} className="text-primary-600" />
                          <span className="font-medium text-slate-900">
                            {format(new Date(note.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <span className="text-sm text-slate-600">Dr. Sarah Chen</span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Chief Complaint:</span>
                          <p className="text-slate-600 mt-1">{note.chiefComplaint}</p>
                        </div>
                        
                        {note.symptoms && (
                          <div>
                            <span className="font-medium text-slate-700">Symptoms:</span>
                            <p className="text-slate-600 mt-1">{note.symptoms}</p>
                          </div>
                        )}
                        
                        {note.diagnosis && (
                          <div>
                            <span className="font-medium text-slate-700">Diagnosis:</span>
                            <p className="text-slate-600 mt-1">{note.diagnosis}</p>
                          </div>
                        )}
                        
                        {note.treatment && (
                          <div>
                            <span className="font-medium text-slate-700">Treatment:</span>
                            <p className="text-slate-600 mt-1">{note.treatment}</p>
                          </div>
                        )}
                        
                        {note.followUp && (
                          <div>
                            <span className="font-medium text-slate-700">Follow-up:</span>
                            <p className="text-slate-600 mt-1">{note.followUp}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "history" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Medical History</h3>
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <ul className="space-y-2">
                  {patient.medicalHistory.map((condition, index) => (
                    <li key={index} className="flex items-center text-slate-700">
                      <ApperIcon name="Circle" size={6} className="mr-3 text-slate-400" />
                      {condition}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600">No medical history recorded</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Medications</h3>
              {patient.currentMedications && patient.currentMedications.length > 0 ? (
                <ul className="space-y-2">
                  {patient.currentMedications.map((medication, index) => (
                    <li key={index} className="flex items-center text-slate-700">
                      <ApperIcon name="Pill" size={14} className="mr-3 text-emerald-600" />
                      {medication}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600">No current medications</p>
              )}
            </Card>
          </div>
)}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <DocumentUpload 
              onUpload={handleDocumentUpload}
              patientName={patient?.name}
            />
            
            {documents.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Patient Documents ({documents.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.Id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                            <ApperIcon 
                              name={doc.type === 'pdf' ? 'FileText' : 'Image'} 
                              size={20} 
                              className="text-blue-600" 
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm truncate max-w-[120px]">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.Id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={doc.category === 'Lab Reports' ? 'success' : doc.category === 'Imaging' ? 'info' : 'secondary'}>
                            {doc.category}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        {doc.preview && (
                          <div className="w-full h-24 bg-slate-50 rounded border overflow-hidden">
                            <img 
                              src={doc.preview} 
                              alt={doc.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <ApperIcon name="Eye" size={14} className="mr-2" />
                          View Document
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Medical History Tab */}
        {activeTab === "history" && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Medical History</h3>
            <div className="text-center py-12">
              <ApperIcon name="Activity" size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">Medical history tracking coming soon</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;