import React from 'react';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

function DoctorCard({ doctor, onEdit, onDelete, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'On Leave': return 'warning';
      case 'Inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSpecialtyIcon = (specialty) => {
    const icons = {
      'Cardiology': 'Heart',
      'Orthopedics': 'Bone',
      'Pediatrics': 'Baby',
      'Neurology': 'Brain',
      'Dermatology': 'Sparkles',
      'Gastroenterology': 'Pill'
    };
    return icons[specialty] || 'Stethoscope';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <ApperIcon 
              name={getSpecialtyIcon(doctor.specialty)} 
              size={24} 
              className="text-primary-600" 
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {doctor.name}
            </h3>
            <p className="text-slate-600 text-sm">
              {doctor.specialty}
            </p>
          </div>
        </div>
        <Badge variant={getStatusColor(doctor.status)}>
          {doctor.status}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <ApperIcon name="Mail" size={16} />
          <span>{doctor.email}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <ApperIcon name="Phone" size={16} />
          <span>{doctor.phone}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <ApperIcon name="Building" size={16} />
          <span>{doctor.department}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <ApperIcon name="DollarSign" size={16} />
          <span>Consultation: ${doctor.consultationFee}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <ApperIcon name="Clock" size={16} />
          <span>{doctor.availability}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <ApperIcon name="Award" size={16} />
          <span>{doctor.yearsExperience} years experience</span>
        </div>
      </div>

      {doctor.bio && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {doctor.bio}
        </p>
      )}

      <div className="flex space-x-2 pt-4 border-t border-slate-100">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(doctor)}
          className="flex items-center space-x-1 flex-1"
        >
          <ApperIcon name="Eye" size={16} />
          <span>View</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(doctor)}
          className="flex items-center space-x-1 flex-1"
        >
          <ApperIcon name="Edit" size={16} />
          <span>Edit</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(doctor)}
          className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
        >
          <ApperIcon name="Trash2" size={16} />
        </Button>
      </div>
    </Card>
  );
}

export default DoctorCard;