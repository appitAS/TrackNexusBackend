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
  }
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
