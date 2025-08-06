const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock reminder data storage
let reminders = [];
let reminderIdCounter = 1;

export const reminderService = {
  // Reminder types
  REMINDER_TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    BOTH: 'both'
  },

  // Reminder timing options
  REMINDER_TIMES: {
    ONE_DAY: 24 * 60, // 24 hours in minutes
    ONE_HOUR: 60,     // 1 hour in minutes
    THIRTY_MIN: 30,   // 30 minutes
    CUSTOM: 'custom'
  },

  async scheduleReminder(appointmentId, patientId, reminderData) {
    await delay(200);
    
    const reminder = {
      Id: reminderIdCounter++,
      appointmentId,
      patientId,
      type: reminderData.type || this.REMINDER_TYPES.EMAIL,
      timing: reminderData.timing || this.REMINDER_TIMES.ONE_DAY,
      customTiming: reminderData.customTiming || null,
      message: reminderData.message || '',
      scheduledFor: this.calculateReminderTime(reminderData.appointmentDateTime, reminderData.timing, reminderData.customTiming),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      sentAt: null,
      deliveryStatus: null,
      attempts: 0,
      maxAttempts: 3
    };

    reminders.push(reminder);
    return reminder;
  },

  async scheduleAppointmentReminders(appointment, reminderConfig) {
    await delay(200);
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const scheduledReminders = [];

    // Schedule 24-hour reminder
    if (reminderConfig.dayBefore) {
      const dayBeforeReminder = await this.scheduleReminder(appointment.Id, appointment.patientId, {
        type: reminderConfig.type,
        timing: this.REMINDER_TIMES.ONE_DAY,
        appointmentDateTime,
        message: this.generateReminderMessage(appointment, '24 hours')
      });
      scheduledReminders.push(dayBeforeReminder);
    }

    // Schedule 1-hour reminder
    if (reminderConfig.hourBefore) {
      const hourBeforeReminder = await this.scheduleReminder(appointment.Id, appointment.patientId, {
        type: reminderConfig.type,
        timing: this.REMINDER_TIMES.ONE_HOUR,
        appointmentDateTime,
        message: this.generateReminderMessage(appointment, '1 hour')
      });
      scheduledReminders.push(hourBeforeReminder);
    }

    // Schedule custom reminder
    if (reminderConfig.customTime && reminderConfig.customMinutes) {
      const customReminder = await this.scheduleReminder(appointment.Id, appointment.patientId, {
        type: reminderConfig.type,
        timing: this.REMINDER_TIMES.CUSTOM,
        customTiming: reminderConfig.customMinutes,
        appointmentDateTime,
        message: this.generateReminderMessage(appointment, `${reminderConfig.customMinutes} minutes`)
      });
      scheduledReminders.push(customReminder);
    }

    return scheduledReminders;
  },

  calculateReminderTime(appointmentDateTime, timing, customTiming = null) {
    const appointmentTime = new Date(appointmentDateTime);
    let reminderTime = new Date(appointmentTime);

    if (timing === this.REMINDER_TIMES.CUSTOM && customTiming) {
      reminderTime.setMinutes(appointmentTime.getMinutes() - customTiming);
    } else {
      reminderTime.setMinutes(appointmentTime.getMinutes() - timing);
    }

    return reminderTime.toISOString();
  },

  generateReminderMessage(appointment, timeframe) {
    return `Reminder: You have an appointment scheduled for ${appointment.type} in ${timeframe}. Date: ${appointment.date} at ${appointment.time}. Please arrive 15 minutes early.`;
  },

  async sendReminder(reminderId, patientData = null) {
    await delay(300);
    const reminder = reminders.find(r => r.Id === reminderId);
    
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    if (reminder.status === 'sent') {
      throw new Error('Reminder already sent');
    }

    try {
      // Simulate sending based on type
      let deliveryResult = { success: true, messageId: `msg_${Date.now()}` };
      
      if (reminder.type === this.REMINDER_TYPES.EMAIL || reminder.type === this.REMINDER_TYPES.BOTH) {
        deliveryResult.email = await this.sendEmailReminder(reminder, patientData);
      }
      
      if (reminder.type === this.REMINDER_TYPES.SMS || reminder.type === this.REMINDER_TYPES.BOTH) {
        deliveryResult.sms = await this.sendSMSReminder(reminder, patientData);
      }

      // Update reminder status
      reminder.status = 'sent';
      reminder.sentAt = new Date().toISOString();
      reminder.deliveryStatus = deliveryResult;
      reminder.attempts += 1;

      return {
        success: true,
        reminder,
        deliveryResult
      };
    } catch (error) {
      reminder.attempts += 1;
      reminder.status = reminder.attempts >= reminder.maxAttempts ? 'failed' : 'retry';
      
      throw new Error(`Failed to send reminder: ${error.message}`);
    }
  },

  async sendEmailReminder(reminder, patientData) {
    await delay(200);
    // Mock email sending - in real implementation would use nodemailer/SendGrid/etc
    return {
      type: 'email',
      recipient: patientData?.email || 'patient@example.com',
      subject: 'Appointment Reminder',
      messageId: `email_${Date.now()}`,
      status: 'delivered'
    };
  },

  async sendSMSReminder(reminder, patientData) {
    await delay(200);
    // Mock SMS sending - in real implementation would use Twilio/AWS SNS/etc
    return {
      type: 'sms',
      recipient: patientData?.phone || '+1234567890',
      messageId: `sms_${Date.now()}`,
      status: 'delivered'
    };
  },

  async sendImmediateReminder(appointmentId, patientId, reminderType = 'email') {
    await delay(300);
    const immediateReminder = {
      Id: reminderIdCounter++,
      appointmentId,
      patientId,
      type: reminderType,
      timing: 0,
      message: 'Immediate appointment reminder',
      scheduledFor: new Date().toISOString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      sentAt: null,
      deliveryStatus: null,
      attempts: 0,
      maxAttempts: 3
    };

    reminders.push(immediateReminder);
    return await this.sendReminder(immediateReminder.Id);
  },

  async getRemindersByAppointment(appointmentId) {
    await delay(100);
    return reminders.filter(r => r.appointmentId === appointmentId);
  },

  async getAllReminders() {
    await delay(100);
    return [...reminders];
  },

  async getPendingReminders() {
    await delay(100);
    const now = new Date();
    return reminders.filter(r => 
      r.status === 'scheduled' && 
      new Date(r.scheduledFor) <= now
    );
  },

  async cancelReminder(reminderId) {
    await delay(100);
    const reminder = reminders.find(r => r.Id === reminderId);
    if (reminder) {
      reminder.status = 'cancelled';
      return reminder;
    }
    throw new Error('Reminder not found');
  },

  async cancelAppointmentReminders(appointmentId) {
    await delay(100);
    const appointmentReminders = reminders.filter(r => 
      r.appointmentId === appointmentId && 
      r.status === 'scheduled'
    );
    
    appointmentReminders.forEach(reminder => {
      reminder.status = 'cancelled';
    });

    return appointmentReminders;
  },

  async updateReminderMessage(reminderId, newMessage) {
    await delay(100);
    const reminder = reminders.find(r => r.Id === reminderId);
    if (reminder && reminder.status === 'scheduled') {
      reminder.message = newMessage;
      return reminder;
    }
    throw new Error('Reminder not found or cannot be updated');
  },

  async getReminderStats() {
    await delay(100);
    const total = reminders.length;
    const sent = reminders.filter(r => r.status === 'sent').length;
    const pending = reminders.filter(r => r.status === 'scheduled').length;
    const failed = reminders.filter(r => r.status === 'failed').length;
    
    return {
      total,
      sent,
      pending,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(1) : '0'
    };
  },

  // Process pending reminders (would be called by a cron job in real implementation)
  async processPendingReminders() {
    await delay(200);
    const pendingReminders = await this.getPendingReminders();
    const results = [];

    for (const reminder of pendingReminders) {
      try {
        const result = await this.sendReminder(reminder.Id);
        results.push({ reminderId: reminder.Id, success: true, result });
      } catch (error) {
        results.push({ reminderId: reminder.Id, success: false, error: error.message });
      }
    }

    return results;
  }
};