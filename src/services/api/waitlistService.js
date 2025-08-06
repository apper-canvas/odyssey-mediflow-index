let waitlistQueue = [];
let nextId = 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const waitlistService = {
  async getQueue() {
    await delay(200);
    return [...waitlistQueue].map((entry, index) => ({
      ...entry,
      position: index + 1,
      estimatedWaitTime: this.calculateWaitTime(index)
    }));
  },

  async enrollPatient(patientId, appointmentType, preferredDate = null, preferredTime = null) {
    await delay(300);
    
    // Check if patient is already in queue
    const existingEntry = waitlistQueue.find(entry => entry.patientId === patientId);
    if (existingEntry) {
      throw new Error("Patient is already on the waitlist");
    }

    const newEntry = {
      Id: nextId++,
      patientId,
      appointmentType,
      preferredDate,
      preferredTime,
      enrolledAt: new Date().toISOString(),
      status: 'waiting',
      priority: 'normal',
      notificationsSent: 0
    };

    waitlistQueue.push(newEntry);
    return newEntry;
  },

  async processNext(availableSlot) {
    await delay(400);
    
    if (waitlistQueue.length === 0) {
      return null;
    }

    // Find best match based on preferences
    let matchIndex = 0;
    if (availableSlot.date && availableSlot.time) {
      matchIndex = waitlistQueue.findIndex(entry => 
        entry.preferredDate === availableSlot.date || 
        entry.appointmentType === availableSlot.type
      );
      if (matchIndex === -1) matchIndex = 0;
    }

    const processedEntry = waitlistQueue.splice(matchIndex, 1)[0];
    processedEntry.status = 'notified';
    processedEntry.notificationsSent += 1;
    processedEntry.notifiedAt = new Date().toISOString();
    processedEntry.availableSlot = availableSlot;

    return processedEntry;
  },

  async removeFromQueue(entryId) {
    await delay(200);
    const index = waitlistQueue.findIndex(entry => entry.Id === entryId);
    if (index !== -1) {
      const removed = waitlistQueue.splice(index, 1)[0];
      return removed;
    }
    throw new Error("Waitlist entry not found");
  },

  async updatePriority(entryId, priority) {
    await delay(200);
    const entry = waitlistQueue.find(entry => entry.Id === entryId);
    if (entry) {
      entry.priority = priority;
      
      // Reorder queue based on priority
      waitlistQueue.sort((a, b) => {
        const priorityOrder = { 'urgent': 0, 'high': 1, 'normal': 2, 'low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      return entry;
    }
    throw new Error("Waitlist entry not found");
  },

  async getPatientPosition(patientId) {
    await delay(100);
    const index = waitlistQueue.findIndex(entry => entry.patientId === patientId);
    return index !== -1 ? index + 1 : null;
  },

  calculateWaitTime(position) {
    // Estimate 2-3 days per position in queue
    const baseDays = position * 2.5;
    const minDays = Math.floor(baseDays);
    const maxDays = Math.ceil(baseDays * 1.5);
    
    if (minDays === maxDays) {
      return `${minDays} day${minDays !== 1 ? 's' : ''}`;
    }
    return `${minDays}-${maxDays} days`;
  },

  async getStats() {
    await delay(100);
    const totalWaiting = waitlistQueue.length;
    const urgentCount = waitlistQueue.filter(entry => entry.priority === 'urgent').length;
    const avgWaitTime = totalWaiting > 0 ? this.calculateWaitTime(Math.floor(totalWaiting / 2)) : '0 days';
    
    return {
      totalWaiting,
      urgentCount,
      avgWaitTime,
      queueLength: totalWaiting
    };
  }
};