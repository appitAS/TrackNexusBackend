const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['meeting', 'break', 'long_break'] },
  startTime: Date,
  endTime: Date,
  resumed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Break', breakSchema);
