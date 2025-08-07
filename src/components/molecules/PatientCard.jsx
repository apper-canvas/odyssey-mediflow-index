import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const PatientCard = ({ patient }) => {
  const navigate = useNavigate();

  const getStatusColor = (lastVisit) => {
    const daysSince = Math.floor((new Date() - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
    if (daysSince <= 30) return "success";
    if (daysSince <= 90) return "warning";
    return "error";
  };

  const getStatusText = (lastVisit) => {
    const daysSince = Math.floor((new Date() - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
    if (daysSince <= 30) return "Recent";
    if (daysSince <= 90) return "Follow-up";
    return "Overdue";
  };

  return (
    <Card 
      hover 
      className="p-6 cursor-pointer"
      onClick={() => navigate(`/patients/${patient.Id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
            <ApperIcon name="User" size={20} className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{patient.firstName} {patient.lastName}</h3>
            <p className="text-sm text-slate-600">ID: {patient.Id}</p>
          </div>
        </div>
        <Badge variant={getStatusColor(patient.lastVisit)}>
          {getStatusText(patient.lastVisit)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Calendar" size={14} className="mr-2" />
          Born: {format(new Date(patient.dateOfBirth), "MMM d, yyyy")}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Phone" size={14} className="mr-2" />
          {patient.phone}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Clock" size={14} className="mr-2" />
          Last visit: {format(new Date(patient.lastVisit), "MMM d, yyyy")}
        </div>
      </div>

{patient.allergies && Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center text-sm text-orange-600">
            <ApperIcon name="AlertTriangle" size={14} className="mr-2" />
            Allergies: {patient.allergies.join(", ")}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PatientCard;