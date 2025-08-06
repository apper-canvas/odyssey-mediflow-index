import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const AppointmentCard = ({ appointment, patient, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled": return "scheduled";
      case "confirmed": return "confirmed";
      case "completed": return "completed";
      case "cancelled": return "cancelled";
      default: return "default";
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "consultation": return "Stethoscope";
      case "follow-up": return "RotateCcw";
      case "emergency": return "Zap";
      case "surgery": return "Activity";
      default: return "Calendar";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
            <ApperIcon name={getTypeIcon(appointment.type)} size={16} className="text-primary-600" />
          </div>
          <div>
            <h4 className="font-medium text-slate-900">
              {patient?.firstName} {patient?.lastName}
            </h4>
            <p className="text-sm text-slate-600 capitalize">{appointment.type}</p>
          </div>
        </div>
        <Badge variant={getStatusColor(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Clock" size={14} className="mr-2" />
          {format(new Date(`${appointment.date}T${appointment.time}`), "MMM d, yyyy 'at' h:mm a")}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Timer" size={14} className="mr-2" />
          Duration: {appointment.duration} minutes
        </div>
        {appointment.notes && (
          <div className="flex items-start text-sm text-slate-600">
            <ApperIcon name="FileText" size={14} className="mr-2 mt-0.5" />
            <span className="line-clamp-2">{appointment.notes}</span>
          </div>
        )}
      </div>

      {appointment.status === "Scheduled" && (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="success"
            onClick={() => onStatusChange(appointment.Id, "Confirmed")}
          >
            Confirm
          </Button>
<Button 
            size="sm" 
            variant="outline"
            onClick={() => onStatusChange(appointment.Id, "Cancelled")}
          >
            Cancel
          </Button>
        </div>
      )}

      {appointment.status === "Cancelled" && (
        <Button 
          size="sm" 
          variant="primary"
          onClick={() => onStatusChange && onStatusChange(appointment.Id, "AddToWaitlist")}
        >
          <ApperIcon name="Clock" size={14} className="mr-1" />
          Add to Waitlist
        </Button>
      )}

      {appointment.status === "Confirmed" && (
        <Button 
          size="sm" 
          variant="success"
          onClick={() => onStatusChange(appointment.Id, "Completed")}
        >
          Mark Complete
        </Button>
      )}
    </Card>
  );
};

export default AppointmentCard;