import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import TextArea from "@/components/atoms/TextArea";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { patientService } from "@/services/api/patientService";

const AppointmentForm = ({ appointment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || "",
    date: appointment?.date || "",
    time: appointment?.time || "",
    duration: appointment?.duration || 30,
    type: appointment?.type || "",
    notes: appointment?.notes || ""
  });
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const appointmentTypes = [
    "Consultation",
    "Follow-up",
    "Check-up",
    "Surgery",
    "Emergency",
    "Therapy"
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {appointment ? "Edit Appointment" : "Schedule New Appointment"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" size={20} className="text-slate-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Patient"
            value={formData.patientId}
            onChange={(e) => handleChange("patientId", e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select a patient</option>
            {patients.map(patient => (
              <option key={patient.Id} value={patient.Id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </Select>

          <Select
            label="Appointment Type"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            required
          >
            <option value="">Select type</option>
            {appointmentTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />

          <Input
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
            required
          />

          <Select
            label="Duration (minutes)"
            value={formData.duration}
            onChange={(e) => handleChange("duration", parseInt(e.target.value))}
            required
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </Select>
        </div>

        <TextArea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Additional notes about this appointment..."
          rows={3}
        />

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <ApperIcon name="Calendar" size={16} className="mr-2" />
            {appointment ? "Update Appointment" : "Schedule Appointment"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AppointmentForm;