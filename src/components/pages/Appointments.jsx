import React, { useState, useEffect } from "react";
import AppointmentCard from "@/components/molecules/AppointmentCard";
import AppointmentForm from "@/components/organisms/AppointmentForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { appointmentService } from "@/services/api/appointmentService";
import { patientService } from "@/services/api/patientService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filterBy]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll()
      ]);

      setAppointments(appointmentsData);
      setPatients(patientsData);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    switch (filterBy) {
      case "today":
        filtered = filtered.filter(apt => isToday(new Date(apt.date)));
        break;
      case "tomorrow":
        filtered = filtered.filter(apt => isTomorrow(new Date(apt.date)));
        break;
      case "week":
        filtered = filtered.filter(apt => isThisWeek(new Date(apt.date)));
        break;
      case "scheduled":
        filtered = filtered.filter(apt => apt.status === "Scheduled");
        break;
      case "confirmed":
        filtered = filtered.filter(apt => apt.status === "Confirmed");
        break;
      case "completed":
        filtered = filtered.filter(apt => apt.status === "Completed");
        break;
      default:
        break;
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    });

    setFilteredAppointments(filtered);
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      const newAppointment = await appointmentService.create({
        ...appointmentData,
        status: "Scheduled",
        doctorId: "dr-sarah-chen"
      });
      
      setAppointments(prev => [newAppointment, ...prev]);
      setShowForm(false);
      toast.success("Appointment scheduled successfully");
    } catch (err) {
      console.error("Failed to schedule appointment:", err);
      toast.error("Failed to schedule appointment");
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.update(appointmentId, { status: newStatus });
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.Id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );

      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      console.error("Failed to update appointment:", err);
      toast.error("Failed to update appointment");
    }
  };

  const getPatientById = (patientId) => {
    return patients.find(p => p.Id === patientId);
  };

  // Group appointments by date for calendar view
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadAppointments} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your appointment schedule and patient visits.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(true)}
          className="mt-4 lg:mt-0"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="md:w-48"
          >
            <option value="all">All Appointments</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </Select>

          <div className="flex border border-slate-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "list" 
                  ? "bg-primary-100 text-primary-700" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ApperIcon name="List" size={16} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "calendar" 
                  ? "bg-primary-100 text-primary-700" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ApperIcon name="Calendar" size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Calendar" size={16} className="mr-2" />
          {filteredAppointments.length} appointments
        </div>
      </div>

      {/* Appointment Form Modal */}
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
              className="w-full max-w-2xl"
            >
              <AppointmentForm
                onSubmit={handleAddAppointment}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointments Display */}
      {filteredAppointments.length === 0 ? (
        <Empty
          title="No appointments found"
          description="Schedule your first appointment to get started."
          icon="Calendar"
          actionLabel="Schedule Appointment"
          onAction={() => setShowForm(true)}
        />
      ) : viewMode === "list" ? (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredAppointments.map((appointment, index) => {
            const patient = getPatientById(appointment.patientId);
            return (
              <motion.div
                key={appointment.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AppointmentCard
                  appointment={appointment}
                  patient={patient}
                  onStatusChange={handleStatusChange}
                />
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, dayAppointments]) => (
              <Card key={date} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <span className="text-sm text-slate-600">
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {dayAppointments.map(appointment => {
                    const patient = getPatientById(appointment.patientId);
                    return (
                      <div key={appointment.Id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-slate-900">
                              {format(new Date(`${appointment.date}T${appointment.time}`), "h:mm")}
                            </div>
                            <div className="text-xs text-slate-600">
                              {format(new Date(`${appointment.date}T${appointment.time}`), "a")}
                            </div>
                          </div>
                          
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <ApperIcon name="User" size={16} className="text-primary-600" />
                          </div>
                          
                          <div>
                            <p className="font-medium text-slate-900">
                              {patient?.firstName} {patient?.lastName}
                            </p>
                            <p className="text-sm text-slate-600 capitalize">
                              {appointment.type} • {appointment.duration} min
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                            appointment.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" :
                            appointment.status === "Completed" ? "bg-slate-100 text-slate-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {appointment.status}
                          </span>
                          
                          {appointment.status === "Scheduled" && (
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleStatusChange(appointment.Id, "Confirmed")}
                            >
                              Confirm
                            </Button>
                          )}
                          
                          {appointment.status === "Confirmed" && (
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleStatusChange(appointment.Id, "Completed")}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default Appointments;