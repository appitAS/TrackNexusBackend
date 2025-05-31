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
    default: '01:00', 
  },
  applicationPunchOutTime: {
    type: String,
    required: true,
    default: '23:00', 
  }
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
