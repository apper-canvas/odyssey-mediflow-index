import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const specialties = [
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Dermatology',
  'Gastroenterology',
  'Endocrinology',
  'Pulmonology',
  'Oncology',
  'Psychiatry',
  'Radiology',
  'Anesthesiology'
];

const statusOptions = [
  'Active',
  'On Leave',
  'Inactive'
];

function DoctorForm({ doctor, onSave, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    licenseNumber: '',
    yearsExperience: '',
    status: 'Active',
    department: '',
    education: '',
    certifications: '',
    consultationFee: '',
    availability: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        licenseNumber: doctor.licenseNumber || '',
        yearsExperience: doctor.yearsExperience || '',
        status: doctor.status || 'Active',
        department: doctor.department || '',
        education: doctor.education || '',
        certifications: Array.isArray(doctor.certifications) 
          ? doctor.certifications.join(', ') 
          : doctor.certifications || '',
        consultationFee: doctor.consultationFee || '',
        availability: doctor.availability || '',
        bio: doctor.bio || ''
      });
    }
  }, [doctor]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Specialty is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.yearsExperience || formData.yearsExperience < 0) {
      newErrors.yearsExperience = 'Valid years of experience is required';
    }

    if (!formData.consultationFee || formData.consultationFee < 0) {
      newErrors.consultationFee = 'Valid consultation fee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      yearsExperience: parseInt(formData.yearsExperience),
      consultationFee: parseFloat(formData.consultationFee),
      certifications: formData.certifications
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0)
    };

    onSave(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              {doctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-700"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                placeholder="Dr. John Smith"
                required
              />

              <Select
                label="Specialty"
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                error={errors.specialty}
                required
              >
                <option value="">Select Specialty</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="doctor@mediflow.com"
                required
              />

              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                error={errors.licenseNumber}
                placeholder="MD-12345"
                required
              />

              <Input
                label="Years of Experience"
                type="number"
                min="0"
                value={formData.yearsExperience}
                onChange={(e) => handleChange('yearsExperience', e.target.value)}
                error={errors.yearsExperience}
                placeholder="10"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                required
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>

              <Input
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Cardiology Department"
              />
            </div>

            <Input
              label="Education"
              value={formData.education}
              onChange={(e) => handleChange('education', e.target.value)}
              placeholder="Harvard Medical School"
            />

            <TextArea
              label="Certifications"
              value={formData.certifications}
              onChange={(e) => handleChange('certifications', e.target.value)}
              placeholder="Board Certified Cardiologist, Advanced Cardiac Life Support"
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Consultation Fee ($)"
                type="number"
                min="0"
                step="0.01"
                value={formData.consultationFee}
                onChange={(e) => handleChange('consultationFee', e.target.value)}
                error={errors.consultationFee}
                placeholder="250"
                required
              />

              <Input
                label="Availability"
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                placeholder="Monday-Friday 9AM-5PM"
              />
            </div>

            <TextArea
              label="Biography"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Brief professional biography..."
              rows={3}
            />

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
                <span>{doctor ? 'Update' : 'Create'} Doctor</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </motion.div>
  );
}

export default DoctorForm;