import treatmentPlanData from '../mockData/treatmentPlans.json';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let treatmentPlans = [...treatmentPlanData];
let nextId = Math.max(...treatmentPlans.map(plan => plan.Id), 0) + 1;
let nextMilestoneId = Math.max(
  ...treatmentPlans.flatMap(plan => plan.milestones || []).map(m => m.Id), 
  0
) + 1;

export const treatmentPlanService = {
  async getAll() {
    await delay(300);
    return treatmentPlans.map(plan => ({ ...plan }));
  },

  async getById(id) {
    await delay(200);
    return treatmentPlans.find(plan => plan.Id === id) || null;
  },

  async getByPatientId(patientId) {
    await delay(300);
    return treatmentPlans.find(plan => plan.patientId === patientId) || null;
  },

  async create(treatmentPlan) {
    await delay(400);
    const newPlan = {
      ...treatmentPlan,
      Id: nextId++,
      status: 'active',
      createdAt: new Date().toISOString(),
      milestones: []
    };
    treatmentPlans.push(newPlan);
    return { ...newPlan };
  },

  async update(id, updates) {
    await delay(300);
    const index = treatmentPlans.findIndex(plan => plan.Id === id);
    if (index === -1) throw new Error('Treatment plan not found');
    
    treatmentPlans[index] = { ...treatmentPlans[index], ...updates };
    return { ...treatmentPlans[index] };
  },

  async delete(id) {
    await delay(200);
    const index = treatmentPlans.findIndex(plan => plan.Id === id);
    if (index === -1) throw new Error('Treatment plan not found');
    
    treatmentPlans.splice(index, 1);
    return true;
  },

  async addMilestone(treatmentPlanId, milestone) {
    await delay(300);
    const plan = treatmentPlans.find(p => p.Id === treatmentPlanId);
    if (!plan) throw new Error('Treatment plan not found');

    const newMilestone = {
      ...milestone,
      Id: nextMilestoneId++,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: ''
    };

    if (!plan.milestones) plan.milestones = [];
    plan.milestones.push(newMilestone);
    
    // Sort milestones by target date
    plan.milestones.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
    
    return { ...newMilestone };
  },

  async updateMilestoneStatus(milestoneId, status, notes = '') {
    await delay(200);
    const plan = treatmentPlans.find(p => 
      p.milestones && p.milestones.some(m => m.Id === milestoneId)
    );
    
    if (!plan) throw new Error('Milestone not found');
    
    const milestone = plan.milestones.find(m => m.Id === milestoneId);
    milestone.status = status;
    milestone.notes = notes;
    
    if (status === 'completed') {
      milestone.completedDate = new Date().toISOString();
    }
    
    return { ...milestone };
  },

  async deleteMilestone(milestoneId) {
    await delay(200);
    const plan = treatmentPlans.find(p => 
      p.milestones && p.milestones.some(m => m.Id === milestoneId)
    );
    
    if (!plan) throw new Error('Milestone not found');
    
    plan.milestones = plan.milestones.filter(m => m.Id !== milestoneId);
    return true;
  }
};