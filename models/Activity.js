const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  reason: String,
  durationInMinutes: Number,
  startedAt: Date,
  endedAt: Date,
});

const idleEventSchema = new mongoose.Schema({
  startedAt: Date,
  endedAt: Date,
  durationInMinutes: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  claimRequestedAt: { type: Date, default: Date.now },
  reason: { type: String, default: 'Idle timeout' },
});

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String, // e.g., '2025-05-03'
  punchInTime: Date,
  lastSeen: Date,
  currentStatus: String,
  totalWorkMinutes: { type: Number, default: 0 },
  activeSessionStart: Date, // New field to track session start
  breaks: [breakSchema],
  idleEvents: [idleEventSchema],
});

module.exports = mongoose.model('Activity', activitySchema);
