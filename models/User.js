const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: String,
  manager: String,
  teams: [String],
  desktop: String,
  lastActive: Date,
});

module.exports = mongoose.model('User', UserSchema);
