const mongoose = require('mongoose');

const timeClaimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  duration: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now },
  ApprovedBy: String
});

module.exports = mongoose.model('TimeClaim', timeClaimSchema);
