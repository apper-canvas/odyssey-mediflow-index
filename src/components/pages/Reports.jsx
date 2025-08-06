import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import ExportModal from "@/components/organisms/ExportModal";
import { patientService } from "@/services/api/patientService";
import { appointmentService } from "@/services/api/appointmentService";
import { clinicalNoteService } from "@/services/api/clinicalNoteService";
import { format, subDays, subMonths, isWithinInterval, startOfMonth, endOfMonth, parseISO } from "date-fns";
import Chart from "react-apexcharts";

const Reports = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("month");
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientsData, appointmentsData, notesData] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll(),
        clinicalNoteService.getAll()
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setClinicalNotes(notesData);
    } catch (err) {
      console.error("Failed to load report data:", err);
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "week":
        return { start: subDays(now, 7), end: now };
      case "month":
        return { start: subDays(now, 30), end: now };
      case "quarter":
        return { start: subDays(now, 90), end: now };
      case "year":
        return { start: subDays(now, 365), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start, end } = getDateRange();

  // Calculate metrics
  const metrics = {
    totalPatients: patients.length,
    newPatients: patients.filter(p => 
      isWithinInterval(parseISO(p.createdAt), { start, end })
    ).length,
    totalAppointments: appointments.filter(a => 
      isWithinInterval(parseISO(a.date), { start, end })
    ).length,
    completedAppointments: appointments.filter(a => 
      a.status === "Completed" && 
      isWithinInterval(parseISO(a.date), { start, end })
    ).length,
    cancelledAppointments: appointments.filter(a => 
      a.status === "Cancelled" && 
      isWithinInterval(parseISO(a.date), { start, end })
    ).length,
    clinicalNotes: clinicalNotes.filter(n => 
      isWithinInterval(parseISO(n.date), { start, end })
    ).length
  };

  // Prepare chart data
  const appointmentChartData = {
    options: {
      chart: {
        type: 'donut',
        fontFamily: 'Inter, sans-serif'
      },
      labels: ['Completed', 'Scheduled', 'Confirmed', 'Cancelled'],
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      }
    },
    series: [
      appointments.filter(a => a.status === "Completed").length,
      appointments.filter(a => a.status === "Scheduled").length,
      appointments.filter(a => a.status === "Confirmed").length,
      appointments.filter(a => a.status === "Cancelled").length
    ]
  };

  // Monthly trend data
  const getMonthlyTrend = () => {
    const months = [];
    const appointmentCounts = [];
    const patientCounts = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      months.push(format(monthDate, "MMM"));
      
      appointmentCounts.push(
        appointments.filter(a => 
          isWithinInterval(parseISO(a.date), { start: monthStart, end: monthEnd })
        ).length
      );
      
      patientCounts.push(
        patients.filter(p => 
          isWithinInterval(parseISO(p.createdAt), { start: monthStart, end: monthEnd })
        ).length
      );
    }
    
    return { months, appointmentCounts, patientCounts };
  };

  const trendData = getMonthlyTrend();

  const trendChartData = {
    options: {
      chart: {
        type: 'line',
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false
        }
      },
      xaxis: {
        categories: trendData.months
      },
      yaxis: {
        title: {
          text: 'Count'
        }
      },
      colors: ['#2563eb', '#10b981'],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 6
      }
    },
    series: [
      {
        name: 'Appointments',
        data: trendData.appointmentCounts
      },
      {
        name: 'New Patients',
        data: trendData.patientCounts
      }
    ]
  };

  // Appointment types breakdown
  const appointmentTypes = appointments.reduce((acc, appointment) => {
    acc[appointment.type] = (acc[appointment.type] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadReportData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-slate-600">
            Monitor your practice performance and patient trends.
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-32"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </Select>
          
<Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={metrics.totalPatients}
          change={metrics.newPatients > 0 ? `+${metrics.newPatients} new` : undefined}
          changeType="increase"
          icon="Users"
          color="primary"
        />
        <StatCard
          title="Appointments"
          value={metrics.totalAppointments}
          change={`${Math.round((metrics.completedAppointments / metrics.totalAppointments) * 100) || 0}% completed`}
          changeType="increase"
          icon="Calendar"
          color="emerald"
        />
        <StatCard
          title="Completed Visits"
          value={metrics.completedAppointments}
          icon="CheckCircle"
          color="blue"
        />
        <StatCard
          title="Clinical Notes"
          value={metrics.clinicalNotes}
          icon="FileText"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Status Breakdown */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Appointment Status</h3>
          <Chart
            options={appointmentChartData.options}
            series={appointmentChartData.series}
            type="donut"
            height={300}
          />
        </Card>

        {/* Monthly Trends */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">6-Month Trend</h3>
          <Chart
            options={trendChartData.options}
            series={trendChartData.series}
            type="line"
            height={300}
          />
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Types */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Appointment Types</h3>
          <div className="space-y-3">
            {Object.entries(appointmentTypes)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ApperIcon 
                        name={
                          type === "Consultation" ? "Stethoscope" :
                          type === "Follow-up" ? "RotateCcw" :
                          type === "Emergency" ? "Zap" :
                          type === "Surgery" ? "Activity" :
                          "Calendar"
                        } 
                        size={14} 
                        className="text-primary-600" 
                      />
                    </div>
                    <span className="font-medium text-slate-900 capitalize">{type}</span>
                  </div>
                  <span className="text-slate-600 font-medium">{count}</span>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {/* Recent patients */}
            {patients
              .filter(p => isWithinInterval(parseISO(p.createdAt), { start, end }))
              .slice(0, 5)
              .map(patient => (
                <div key={patient.Id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="UserPlus" size={14} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      New patient: {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {format(parseISO(patient.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))
            }
            
            {/* Recent appointments */}
            {appointments
              .filter(a => a.status === "Completed" && isWithinInterval(parseISO(a.date), { start, end }))
              .slice(0, 3)
              .map(appointment => {
                const patient = patients.find(p => p.Id === appointment.patientId);
                return (
                  <div key={appointment.Id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ApperIcon name="CheckCircle" size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        Completed: {patient?.firstName} {patient?.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {format(parseISO(appointment.date), "MMM d, yyyy")} • {appointment.type}
                      </p>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Practice Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round((metrics.completedAppointments / metrics.totalAppointments) * 100) || 0}%
            </div>
            <div className="text-sm text-slate-600">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((metrics.cancelledAppointments / metrics.totalAppointments) * 100) || 0}%
            </div>
            <div className="text-sm text-slate-600">Cancellation Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.clinicalNotes}
            </div>
            <div className="text-sm text-slate-600">Notes Written</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(appointments.reduce((acc, apt) => acc + apt.duration, 0) / 60) || 0}
            </div>
            <div className="text-sm text-slate-600">Hours Scheduled</div>
          </div>
        </div>
</Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        dataType="reports"
      />
    </div>
  );
};

export default Reports;