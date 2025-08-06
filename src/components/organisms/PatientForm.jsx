import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const PatientForm = ({ patient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    dateOfBirth: patient?.dateOfBirth || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    address: patient?.address || "",
    emergencyContact: {
      name: patient?.emergencyContact?.name || "",
      phone: patient?.emergencyContact?.phone || "",
      relationship: patient?.emergencyContact?.relationship || ""
    },
    allergies: patient?.allergies?.join(", ") || "",
    currentMedications: patient?.currentMedications?.join(", ") || "",
    medicalHistory: patient?.medicalHistory?.join(", ") || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      allergies: formData.allergies ? formData.allergies.split(",").map(item => item.trim()).filter(Boolean) : [],
      currentMedications: formData.currentMedications ? formData.currentMedications.split(",").map(item => item.trim()).filter(Boolean) : [],
      medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(",").map(item => item.trim()).filter(Boolean) : []
    };

    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {patient ? "Edit Patient" : "Add New Patient"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" size={20} className="text-slate-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="mt-4">
            <TextArea
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Contact Name"
              value={formData.emergencyContact.name}
              onChange={(e) => handleChange("emergencyContact.name", e.target.value)}
            />
            <Input
              label="Contact Phone"
              value={formData.emergencyContact.phone}
              onChange={(e) => handleChange("emergencyContact.phone", e.target.value)}
            />
            <Input
              label="Relationship"
              value={formData.emergencyContact.relationship}
              onChange={(e) => handleChange("emergencyContact.relationship", e.target.value)}
            />
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">Medical Information</h3>
          <div className="space-y-4">
            <TextArea
              label="Allergies (separate with commas)"
              value={formData.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              placeholder="Penicillin, Latex, Shellfish"
              rows={2}
            />
            <TextArea
              label="Current Medications (separate with commas)"
              value={formData.currentMedications}
              onChange={(e) => handleChange("currentMedications", e.target.value)}
              placeholder="Aspirin 81mg daily, Metformin 500mg twice daily"
              rows={2}
            />
            <TextArea
              label="Medical History (separate with commas)"
              value={formData.medicalHistory}
              onChange={(e) => handleChange("medicalHistory", e.target.value)}
              placeholder="Hypertension, Type 2 Diabetes, Previous surgery"
              rows={3}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <ApperIcon name="Save" size={16} className="mr-2" />
            {patient ? "Update Patient" : "Add Patient"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PatientForm;