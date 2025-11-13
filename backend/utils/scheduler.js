const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const sendEmail = require('./emailService');

cron.schedule('*/5 * * * *', async () => {
  // Runs every 5 minutes
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

  try {
    const appointments = await Appointment.find({
      date: { $gte: now, $lte: nextHour },
      reminderSent: { $ne: true },
    }).populate('patient', 'email name');

    for (const appt of appointments) {
      await sendEmail(
        appt.patient.email,
        'Appointment Reminder - HCMS2',
        `Hello ${appt.patient.name},\n\nThis is a reminder for your appointment with Dr. ${appt.doctor} scheduled at ${new Date(appt.date).toLocaleString()}.\n\n- HCMS2 Team`
      );

      appt.reminderSent = true;
      await appt.save();
      console.log(`✅ Reminder sent to ${appt.patient.email}`);
    }
  } catch (err) {
    console.error('❌ Error sending reminders:', err);
  }
});

console.log('⏰ Reminder scheduler running...');
