import React, { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import ApperIcon from '@/components/ApperIcon';
import { treatmentPlanService } from '@/services/api/treatmentPlanService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function TreatmentTimeline({ patientId }) {
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'treatment'
  });

  useEffect(() => {
    loadTreatmentPlan();
  }, [patientId]);

  const loadTreatmentPlan = async () => {
    try {
      setLoading(true);
      const plan = await treatmentPlanService.getByPatientId(patientId);
      setTreatmentPlan(plan);
    } catch (err) {
      setError('Failed to load treatment plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    try {
      if (!newMilestone.title.trim() || !newMilestone.targetDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      await treatmentPlanService.addMilestone(treatmentPlan.Id, newMilestone);
      setNewMilestone({ title: '', description: '', targetDate: '', category: 'treatment' });
      setShowAddMilestone(false);
      await loadTreatmentPlan();
      toast.success('Milestone added successfully');
    } catch (err) {
      toast.error('Failed to add milestone');
      console.error(err);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId, status, notes = '') => {
    try {
      await treatmentPlanService.updateMilestoneStatus(milestoneId, status, notes);
      await loadTreatmentPlan();
      toast.success('Milestone updated successfully');
    } catch (err) {
      toast.error('Failed to update milestone');
      console.error(err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      await treatmentPlanService.deleteMilestone(milestoneId);
      await loadTreatmentPlan();
      toast.success('Milestone deleted successfully');
    } catch (err) {
      toast.error('Failed to delete milestone');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'secondary';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'diagnosis': return 'Stethoscope';
      case 'treatment': return 'Pills';
      case 'followup': return 'Calendar';
      case 'test': return 'TestTube2';
      default: return 'Target';
    }
  };

  const getProgressPercentage = () => {
    if (!treatmentPlan?.milestones?.length) return 0;
    const completed = treatmentPlan.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / treatmentPlan.milestones.length) * 100);
  };

  if (loading) return <div className="p-6 text-center">Loading treatment plan...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!treatmentPlan) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="Target" size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No treatment plan found for this patient</p>
          <Button onClick={() => window.location.reload()}>Create Treatment Plan</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treatment Plan Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{treatmentPlan.title}</h3>
            <p className="text-slate-600">{treatmentPlan.description}</p>
          </div>
          <Badge variant={getStatusColor(treatmentPlan.status)} className="capitalize">
            {treatmentPlan.status}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Overall Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm text-slate-600">
          <span>Started: {format(new Date(treatmentPlan.startDate), 'MMM d, yyyy')}</span>
          <span>Target End: {format(new Date(treatmentPlan.targetEndDate), 'MMM d, yyyy')}</span>
        </div>
      </Card>

      {/* Add Milestone Button */}
      <div className="flex justify-between items-center">
        <h4 className="text-md font-semibold text-slate-800">Treatment Milestones</h4>
        <Button 
          onClick={() => setShowAddMilestone(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Milestone
        </Button>
      </div>

      {/* Add Milestone Form */}
      {showAddMilestone && (
        <Card className="p-6">
          <h5 className="font-semibold text-slate-800 mb-4">Add New Milestone</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Title"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
              placeholder="Enter milestone title"
              required
            />
            <Input
              label="Target Date"
              type="date"
              value={newMilestone.targetDate}
              onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newMilestone.category}
              onChange={(e) => setNewMilestone({...newMilestone, category: e.target.value})}
            >
              <option value="diagnosis">Diagnosis</option>
              <option value="treatment">Treatment</option>
              <option value="followup">Follow-up</option>
              <option value="test">Test/Lab</option>
            </select>
            <div></div>
          </div>
          <TextArea
            label="Description"
            value={newMilestone.description}
            onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
            placeholder="Enter milestone description"
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddMilestone} className="flex items-center gap-2">
              <ApperIcon name="Check" size={16} />
              Add Milestone
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddMilestone(false);
                setNewMilestone({ title: '', description: '', targetDate: '', category: 'treatment' });
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-300"></div>
        
        <div className="space-y-6">
          {treatmentPlan.milestones?.map((milestone, index) => (
            <Card key={milestone.Id} className="p-6 ml-16 relative">
              {/* Timeline Dot */}
              <div className={`absolute -left-12 top-6 w-4 h-4 rounded-full border-2 ${
                milestone.status === 'completed' 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : milestone.status === 'in-progress'
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white border-slate-300'
              }`}></div>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <ApperIcon name={getCategoryIcon(milestone.category)} size={20} className="text-slate-500" />
                    <h6 className="font-semibold text-slate-800">{milestone.title}</h6>
                    <Badge variant={getStatusColor(milestone.status)} size="sm" className="capitalize">
                      {milestone.status}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-600 mb-3">{milestone.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <ApperIcon name="Calendar" size={16} />
                      Target: {format(new Date(milestone.targetDate), 'MMM d, yyyy')}
                    </span>
                    {milestone.completedDate && (
                      <span className="flex items-center gap-1">
                        <ApperIcon name="CheckCircle" size={16} />
                        Completed: {format(new Date(milestone.completedDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>

                  {milestone.notes && (
                    <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600">
                      <strong>Notes:</strong> {milestone.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {milestone.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateMilestoneStatus(milestone.Id, 'completed', 'Milestone completed')}
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name="Check" size={14} />
                      Complete
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteMilestone(milestone.Id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {(!treatmentPlan.milestones || treatmentPlan.milestones.length === 0) && (
          <Card className="p-8 text-center">
            <ApperIcon name="Target" size={48} className="text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No milestones added yet</p>
            <Button onClick={() => setShowAddMilestone(true)}>Add First Milestone</Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default TreatmentTimeline;