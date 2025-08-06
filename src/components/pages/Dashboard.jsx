import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import AppointmentCard from "@/components/molecules/AppointmentCard";
import PatientCard from "@/components/molecules/PatientCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { appointmentService } from "@/services/api/appointmentService";
import { patientService } from "@/services/api/patientService";
import { clinicalNoteService } from "@/services/api/clinicalNoteService";
import { toast } from "react-toastify";
import { format, isToday, isThisWeek } from "date-fns";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentsData, patientsData] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll()
      ]);

      setAppointments(appointmentsData);
      setPatients(patientsData);

      // Filter today's appointments
      const today = todayAppointments.filter(apt => 
        isToday(new Date(apt.date))
      );
      setTodayAppointments(today);

      // Get recent patients (last 5 with recent visits)
      const recent = patientsData
        .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
        .slice(0, 4);
      setRecentPatients(recent);

    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.update(appointmentId, { status: newStatus });
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.Id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      
      setTodayAppointments(prev => 
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

  // Calculate statistics
  const stats = {
    totalPatients: patients.length,
    todayAppointments: appointments.filter(apt => isToday(new Date(apt.date))).length,
    thisWeekPatients: patients.filter(patient => 
      isThisWeek(new Date(patient.lastVisit))
    ).length,
    pendingAppointments: appointments.filter(apt => apt.status === "Scheduled").length
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Welcome back, Dr. Chen. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button variant="outline" size="sm">
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export Data
          </Button>
          <Button variant="primary" size="sm">
            <ApperIcon name="UserPlus" size={16} className="mr-2" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon="Users"
          color="primary"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon="Calendar"
          color="emerald"
        />
        <StatCard
          title="This Week Visits"
          value={stats.thisWeekPatients}
          icon="TrendingUp"
          color="blue"
        />
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          icon="Clock"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Today's Appointments</h2>
            <Button variant="outline" size="sm">
              <ApperIcon name="Calendar" size={16} className="mr-2" />
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {appointments.filter(apt => isToday(new Date(apt.date))).length === 0 ? (
              <Empty
                title="No appointments today"
                description="You have a free day! Consider catching up on notes or planning ahead."
                icon="Calendar"
                actionLabel="Schedule Appointment"
              />
            ) : (
              appointments
                .filter(apt => isToday(new Date(apt.date)))
                .slice(0, 5)
                .map(appointment => {
                  const patient = patients.find(p => p.Id === appointment.patientId);
                  return (
                    <AppointmentCard
                      key={appointment.Id}
                      appointment={appointment}
                      patient={patient}
                      onStatusChange={handleAppointmentStatusChange}
                    />
                  );
                })
            )}
          </div>
        </Card>

        {/* Recent Patients */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Recent Patients</h2>
            <Button variant="outline" size="sm">
              <ApperIcon name="Users" size={16} className="mr-2" />
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentPatients.length === 0 ? (
              <Empty
                title="No recent patients"
                description="Start building your patient base by adding new patients."
                icon="Users"
                actionLabel="Add Patient"
              />
            ) : (
              recentPatients.map(patient => (
                <div key={patient.Id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        Last visit: {format(new Date(patient.lastVisit), "MMM d")}
                      </p>
                    </div>
                  </div>
                  <ApperIcon name="ChevronRight" size={16} className="text-slate-400" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <ApperIcon name="UserPlus" size={24} className="mb-2" />
            Add Patient
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <ApperIcon name="Calendar" size={24} className="mb-2" />
            Schedule
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <ApperIcon name="FileText" size={24} className="mb-2" />
            Clinical Notes
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <ApperIcon name="BarChart3" size={24} className="mb-2" />
            Reports
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;