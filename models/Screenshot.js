const mongoose = require('mongoose');

const screenshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    required: true
  },
  filename: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Screenshot', screenshotSchema);
