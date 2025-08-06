import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import SearchBar from '@/components/molecules/SearchBar';
import DoctorCard from '@/components/molecules/DoctorCard';
import DoctorForm from '@/components/organisms/DoctorForm';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import doctorService from '@/services/api/doctorService';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Load initial data
  useEffect(() => {
    loadDoctors();
    loadSpecialties();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [doctors, searchTerm, specialtyFilter, statusFilter]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors');
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      const data = await doctorService.getSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error('Failed to load specialties:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(search) ||
        doctor.specialty.toLowerCase().includes(search) ||
        doctor.department.toLowerCase().includes(search) ||
        doctor.email.toLowerCase().includes(search)
      );
    }

    // Specialty filter
    if (specialtyFilter && specialtyFilter !== 'All') {
      filtered = filtered.filter(doctor => doctor.specialty === specialtyFilter);
    }

    // Status filter
    if (statusFilter && statusFilter !== 'All') {
      filtered = filtered.filter(doctor => doctor.status === statusFilter);
    }

    setFilteredDoctors(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setShowForm(true);
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleSaveDoctor = async (doctorData) => {
    try {
      setFormLoading(true);
      
      if (editingDoctor) {
        // Update existing doctor
        await doctorService.update(editingDoctor.Id, doctorData);
        setDoctors(prev => prev.map(d => 
          d.Id === editingDoctor.Id 
            ? { ...d, ...doctorData }
            : d
        ));
        toast.success('Doctor updated successfully');
      } else {
        // Create new doctor
        const newDoctor = await doctorService.create(doctorData);
        setDoctors(prev => [...prev, newDoctor]);
        toast.success('Doctor added successfully');
      }
      
      setShowForm(false);
      setEditingDoctor(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save doctor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDoctor = (doctor) => {
    setShowDeleteConfirm(doctor);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      await doctorService.delete(showDeleteConfirm.Id);
      setDoctors(prev => prev.filter(d => d.Id !== showDeleteConfirm.Id));
      toast.success('Doctor deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete doctor');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleViewDetails = (doctor) => {
    // Show detailed view in modal or navigate to detail page
    toast.info(`Viewing details for ${doctor.name}`);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDoctors} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
          <p className="text-slate-600">Manage healthcare professionals</p>
        </div>
        <Button onClick={handleAddDoctor} className="flex items-center space-x-2">
          <ApperIcon name="Plus" size={16} />
          <span>Add Doctor</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search doctors by name, specialty, or department..."
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:min-w-max">
          <Select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="min-w-[160px]"
          >
            <option value="All">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </Select>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[140px]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Doctors</p>
              <p className="text-2xl font-bold text-slate-900">{doctors.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Stethoscope" size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-emerald-600">
                {doctors.filter(d => d.status === 'Active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserCheck" size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">
                {doctors.filter(d => d.status === 'On Leave').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Specialties</p>
              <p className="text-2xl font-bold text-slate-900">{specialties.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Award" size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DoctorCard
                doctor={doctor}
                onEdit={handleEditDoctor}
                onDelete={handleDeleteDoctor}
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Empty
          icon="Stethoscope"
          title="No doctors found"
          description={
            searchTerm || specialtyFilter !== 'All' || statusFilter !== 'All'
              ? "No doctors match your current filters"
              : "Start by adding your first doctor"
          }
          action={
            searchTerm || specialtyFilter !== 'All' || statusFilter !== 'All' 
              ? undefined
              : { label: "Add Doctor", onClick: handleAddDoctor }
          }
        />
      )}

      {/* Doctor Form Modal */}
      {showForm && (
        <DoctorForm
          doctor={editingDoctor}
          onSave={handleSaveDoctor}
          onCancel={() => {
            setShowForm(false);
            setEditingDoctor(null);
          }}
          isLoading={formLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Doctor</h3>
                <p className="text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>?
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Doctors;