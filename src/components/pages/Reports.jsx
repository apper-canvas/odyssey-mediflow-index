import React, { useEffect, useState } from "react";
import { patientService } from "@/services/api/patientService";
import { appointmentService } from "@/services/api/appointmentService";
import { clinicalNoteService } from "@/services/api/clinicalNoteService";
import { treatmentPlanService } from "@/services/api/treatmentPlanService";
import { billingService } from "@/services/api/billingService";
import { differenceInYears, endOfMonth, format, isWithinInterval, parseISO, startOfMonth, subDays, subMonths } from "date-fns";
import Chart from "react-apexcharts";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import ExportModal from "@/components/organisms/ExportModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
const Reports = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
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

      const [patientsData, appointmentsData, notesData, treatmentData, billingData] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll(),
        clinicalNoteService.getAll(),
        treatmentPlanService.getAll().catch(() => []),
        billingService.getAll().catch(() => [])
      ]);

      setPatients(patientsData || []);
      setAppointments(appointmentsData || []);
      setClinicalNotes(notesData || []);
      setTreatmentPlans(treatmentData || []);
      setBillingRecords(billingData || []);
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

  // Calculate basic metrics
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

  // Demographics Analysis
  const getDemographics = () => {
    const ageGroups = { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
    const genderBreakdown = { Male: 0, Female: 0, Other: 0 };
    const conditions = {};

    patients.forEach(patient => {
      const age = differenceInYears(new Date(), parseISO(patient.dateOfBirth));
      if (age <= 30) ageGroups['18-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['60+']++;

      // Simulate gender data (not in mock data)
      const gender = ['Male', 'Female'][Math.floor(Math.random() * 2)];
      genderBreakdown[gender]++;

      // Analyze medical conditions
      patient.medicalHistory?.forEach(condition => {
        conditions[condition] = (conditions[condition] || 0) + 1;
      });
    });

    return { ageGroups, genderBreakdown, conditions };
  };

  const demographics = getDemographics();

// Treatment Outcomes Analysis
  const getTreatmentOutcomes = () => {
    const outcomes = {
      totalPlans: treatmentPlans?.length || 0,
      activePlans: treatmentPlans?.filter(p => p.status === 'active').length || 0,
      completedMilestones: 0,
      totalMilestones: 0,
      averageCompletionRate: 0
    };

    treatmentPlans?.forEach(plan => {
      if (plan.milestones) {
        outcomes.totalMilestones += plan.milestones.length;
        outcomes.completedMilestones += plan.milestones.filter(m => m.status === 'completed').length;
      }
    });

    outcomes.averageCompletionRate = outcomes.totalMilestones > 0 
      ? Math.round((outcomes.completedMilestones / outcomes.totalMilestones) * 100)
      : 0;

    return outcomes;
  };

  const treatmentOutcomes = getTreatmentOutcomes();

// Revenue Analysis
  const getRevenueAnalysis = () => {
    const totalRevenue = billingRecords?.reduce((sum, record) => sum + (record?.amount || 0), 0) || 0;
    const paidRevenue = billingRecords
      ?.filter(r => r.status === 'paid')
      .reduce((sum, record) => sum + (record?.amount || 0), 0) || 0;
    const pendingRevenue = billingRecords
      ?.filter(r => r.status === 'pending')
      .reduce((sum, record) => sum + (record?.amount || 0), 0) || 0;
    const overdueRevenue = billingRecords
      ?.filter(r => r.status === 'overdue')
      .reduce((sum, record) => sum + (record?.amount || 0), 0) || 0;

    return { totalRevenue, paidRevenue, pendingRevenue, overdueRevenue };
  };

  const revenueAnalysis = getRevenueAnalysis();

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

  // Age Demographics Chart
  const ageChartData = {
    options: {
      chart: {
        type: 'bar',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      xaxis: {
        categories: Object.keys(demographics.ageGroups)
      },
      colors: ['#8b5cf6'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false
        }
      }
    },
    series: [{
      name: 'Patients',
      data: Object.values(demographics.ageGroups)
    }]
  };

  // Revenue Chart
  const revenueChartData = {
    options: {
      chart: {
        type: 'donut',
        fontFamily: 'Inter, sans-serif'
      },
      labels: ['Paid', 'Pending', 'Overdue'],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      legend: {
        position: 'bottom'
      }
    },
    series: [
      revenueAnalysis.paidRevenue,
      revenueAnalysis.pendingRevenue,
      revenueAnalysis.overdueRevenue
    ]
  };

  // Monthly trend data
  const getMonthlyTrend = () => {
    const months = [];
    const appointmentCounts = [];
    const patientCounts = [];
    const revenueCounts = [];
    
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

const monthlyRevenue = billingRecords
        ?.filter(b => b.date && isWithinInterval(parseISO(b.date), { start: monthStart, end: monthEnd }))
        .reduce((sum, record) => sum + (record?.amount || 0), 0) || 0;
      revenueCounts.push(monthlyRevenue);
    }
    
    return { months, appointmentCounts, patientCounts, revenueCounts };
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
      yaxis: [
        {
          title: {
            text: 'Count'
          }
        },
        {
          opposite: true,
          title: {
            text: 'Revenue ($)'
          }
        }
      ],
      colors: ['#2563eb', '#10b981', '#f59e0b'],
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
      },
      {
        name: 'Revenue',
        yAxisIndex: 1,
        data: trendData.revenueCounts
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

{/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Patient Demographics */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Patient Demographics</h3>
          <div className="mb-4">
            <Chart 
              options={ageChartData.options} 
              series={ageChartData.series} 
              type="bar" 
              height={200} 
            />
          </div>
          <div className="space-y-3">
            <div className="text-sm text-slate-600 font-medium">Age Distribution</div>
            {Object.entries(demographics.ageGroups).map(([age, count]) => (
              <div key={age} className="flex justify-between text-sm">
                <span className="text-slate-700">{age} years</span>
                <span className="font-medium text-slate-900">{count} patients</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Treatment Outcomes */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Treatment Outcomes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Target" size={14} className="text-emerald-600" />
                </div>
                <span className="font-medium text-slate-900">Active Plans</span>
              </div>
              <span className="text-emerald-600 font-bold">{treatmentOutcomes.activePlans}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="CheckCircle" size={14} className="text-blue-600" />
                </div>
                <span className="font-medium text-slate-900">Completion Rate</span>
              </div>
              <span className="text-blue-600 font-bold">{treatmentOutcomes.averageCompletionRate}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Award" size={14} className="text-purple-600" />
                </div>
                <span className="font-medium text-slate-900">Milestones</span>
              </div>
              <span className="text-purple-600 font-bold">
                {treatmentOutcomes.completedMilestones}/{treatmentOutcomes.totalMilestones}
              </span>
            </div>
          </div>
        </Card>

        {/* Revenue Analysis */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Revenue Analysis</h3>
          <div className="mb-4">
            <Chart 
              options={revenueChartData.options} 
              series={revenueChartData.series} 
              type="donut" 
              height={200} 
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">Total Revenue</span>
              <span className="font-bold text-slate-900">${revenueAnalysis.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">Paid</span>
              <span className="font-medium text-emerald-600">${revenueAnalysis.paidRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">Pending</span>
              <span className="font-medium text-orange-600">${revenueAnalysis.pendingRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-600">Overdue</span>
              <span className="font-medium text-red-600">${revenueAnalysis.overdueRevenue.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medical Conditions Analysis */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Common Medical Conditions</h3>
          <div className="space-y-3">
            {Object.entries(demographics.conditions)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([condition, count]) => (
                <div key={condition} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Heart" size={14} className="text-red-600" />
                    </div>
                    <span className="font-medium text-slate-900">{condition}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 font-medium">{count}</span>
                    <span className="text-xs text-slate-500">
                      ({Math.round((count / patients.length) * 100)}%)
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Appointment Types Performance */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Appointment Performance</h3>
          <div className="space-y-3">
            {Object.entries(appointmentTypes)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => {
                const completionRate = Math.round(
                  (appointments.filter(a => a.type === type && a.status === "Completed").length / count) * 100
                );
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
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
                        <div>
                          <span className="font-medium text-slate-900 capitalize">{type}</span>
                          <div className="text-xs text-slate-500">
                            {completionRate}% completion rate
                          </div>
                        </div>
                      </div>
                      <span className="text-slate-600 font-medium">{count}</span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </Card>

        {/* Practice Efficiency Metrics */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Practice Efficiency</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round((metrics.completedAppointments / metrics.totalAppointments) * 100) || 0}%
              </div>
              <div className="text-sm text-slate-600">Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((metrics.cancelledAppointments / metrics.totalAppointments) * 100) || 0}%
              </div>
              <div className="text-sm text-slate-600">Cancellation Rate</div>
</div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(appointments?.reduce((acc, apt) => acc + (apt?.duration || 0), 0) / 60) || 0}
              </div>
              <div className="text-sm text-slate-600">Hours Scheduled</div>
            </div>
<div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.totalAppointments > 0 ? (revenueAnalysis.totalRevenue / metrics.totalAppointments).toFixed(0) : 0}
              </div>
              <div className="text-sm text-slate-600">Avg Revenue/Apt</div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
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
              .slice(0, 5)
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