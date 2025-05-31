const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  inactivityDurationMins: {
    type: Number,
    required: true,
    default: 10,
  },
  screenshotIntervalMins: {
    type: Number,
    required: true,
    default: 5,
  },
  applicationAdminPassword: {
    type: String,
    required: true,
    default: 'admin123',
  },
  applicationPunchInTime: {
    type: String,
    required: true,
    default: '09:00', // 9 AM in 24-hour format
  },
  applicationPunchOutTime: {
    type: String,
    required: true,
    default: '19:00', // 7 PM in 24-hour format
  }
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
