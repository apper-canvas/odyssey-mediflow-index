import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import PatientCard from "@/components/molecules/PatientCard";
import PatientForm from "@/components/organisms/PatientForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { patientService } from "@/services/api/patientService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const { searchValue } = useOutletContext() || { searchValue: "" };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patients, searchValue, sortBy, filterBy]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setError("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...patients];

    // Search filter
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(patient => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(search) ||
        patient.phone.includes(search) ||
        patient.email.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filterBy !== "all") {
      const now = new Date();
      filtered = filtered.filter(patient => {
        const daysSince = Math.floor((now - new Date(patient.lastVisit)) / (1000 * 60 * 60 * 24));
        switch (filterBy) {
          case "recent":
            return daysSince <= 30;
          case "followup":
            return daysSince > 30 && daysSince <= 90;
          case "overdue":
            return daysSince > 90;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "lastVisit":
          return new Date(b.lastVisit) - new Date(a.lastVisit);
        case "dateAdded":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
  };

  const handleAddPatient = async (patientData) => {
    try {
      const newPatient = await patientService.create(patientData);
      setPatients(prev => [newPatient, ...prev]);
      setShowForm(false);
      toast.success("Patient added successfully");
    } catch (err) {
      console.error("Failed to add patient:", err);
      toast.error("Failed to add patient");
    }
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadPatients} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
            Patients
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your patient database and medical records.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(true)}
          className="mt-4 lg:mt-0"
        >
          <ApperIcon name="UserPlus" size={16} className="mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="md:w-48"
        >
          <option value="name">Sort by Name</option>
          <option value="lastVisit">Sort by Last Visit</option>
          <option value="dateAdded">Sort by Date Added</option>
        </Select>

        <Select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="md:w-48"
        >
          <option value="all">All Patients</option>
          <option value="recent">Recent (30 days)</option>
          <option value="followup">Follow-up (30-90 days)</option>
          <option value="overdue">Overdue (90+ days)</option>
        </Select>

        <div className="flex items-center text-sm text-slate-600 md:ml-auto">
          <ApperIcon name="Users" size={16} className="mr-2" />
          {filteredPatients.length} patients
        </div>
      </div>

      {/* Patient Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <PatientForm
                onSubmit={handleAddPatient}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <Empty
          title="No patients found"
          description={searchValue ? "Try adjusting your search or filters." : "Start by adding your first patient to the system."}
          icon="Users"
          actionLabel="Add Patient"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PatientCard patient={patient} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Patients;