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
    notes: appointment?.notes || "",
    reminderConfig: appointment?.reminderConfig || {
      enabled: true,
      type: "email",
      dayBefore: true,
      hourBefore: false,
      customTime: false,
      customMinutes: 60
    }
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

  const reminderTypes = [
    { value: "email", label: "Email Only" },
    { value: "sms", label: "SMS Only" },
    { value: "both", label: "Email & SMS" }
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Reminder Configuration */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">Appointment Reminders</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reminderConfig.enabled}
                onChange={(e) => handleChange("reminderConfig", {
                  ...formData.reminderConfig,
                  enabled: e.target.checked
                })}
                className="mr-2"
              />
              <span className="text-sm text-slate-700">Enable reminders</span>
            </label>
          </div>

          {formData.reminderConfig.enabled && (
            <div className="space-y-4">
              <Select
                label="Reminder Method"
                value={formData.reminderConfig.type}
                onChange={(e) => handleChange("reminderConfig", {
                  ...formData.reminderConfig,
                  type: e.target.value
                })}
              >
                {reminderTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reminderConfig.dayBefore}
                    onChange={(e) => handleChange("reminderConfig", {
                      ...formData.reminderConfig,
                      dayBefore: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700">24 hours before</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reminderConfig.hourBefore}
                    onChange={(e) => handleChange("reminderConfig", {
                      ...formData.reminderConfig,
                      hourBefore: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700">1 hour before</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reminderConfig.customTime}
                    onChange={(e) => handleChange("reminderConfig", {
                      ...formData.reminderConfig,
                      customTime: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-700">Custom time</span>
                </label>
              </div>

              {formData.reminderConfig.customTime && (
                <Input
                  label="Minutes before appointment"
                  type="number"
                  min="15"
                  max="1440"
                  value={formData.reminderConfig.customMinutes}
                  onChange={(e) => handleChange("reminderConfig", {
                    ...formData.reminderConfig,
                    customMinutes: parseInt(e.target.value) || 60
                  })}
                  placeholder="60"
                />
              )}
            </div>
          )}
        </div>

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