const User = require('../models/User');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getIO } = require('../socket'); 

exports.signup = async (req, res) => {
  try {
    const { name, username, email, password, role, manager, teams, desktop, lastActive } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      manager,
      teams,
      desktop,
      lastActive,
    });

    await user.save();
    res.status(201).json({ msg: 'User created' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
    try {
      const io = getIO();
      const { username, password } = req.body;
  
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ msg: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
      const today = now.toISOString().split('T')[0];
  
      let activity = await Activity.findOne({ userId: user._id, date: today });
  
      let message = 'Login successful';
      let punchInTime;
  
      if (!activity) {
        // New punch-in
        activity = new Activity({
          userId: user._id,
          date: today,
          punchInTime: now,
          lastSeen: now,
          activeSessionStart: now,
        });
        punchInTime = now;
      } else {
        // Already punched in
        message = 'Already punched in';
        activity.lastSeen = now;
        activity.activeSessionStart = now;
        punchInTime = activity.punchInTime;
      }
  
      await activity.save();
      
      
      io.emit('status:update', {
        userId: user._id,
        status: 'online',
        timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
      });

      res.json({
        token,
        user,
        message,
        punchInTime,
        lastSeen: activity.lastSeen,
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };
  
exports.logout = async (req, res) => {
    try {
      const io = getIO();
      const userId = req.user.id;
      const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
      const today = now.toISOString().split('T')[0];
  
      const activity = await Activity.findOne({ userId, date: today });
      if (!activity || !activity.activeSessionStart) {
        return res.status(400).json({ msg: 'No active session found' });
      }
  
      const sessionDuration = Math.floor((now - activity.activeSessionStart) / 60000); // in minutes
      activity.totalWorkMinutes += sessionDuration;
      activity.activeSessionStart = null;
  
      await activity.save();
      io.emit('status:update', {
        userId: userId,
        status: 'offline',
        timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
      });
      res.json({ msg: 'Logout successful', sessionDuration });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); // exclude passwords
      res.json(users);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };

  // Functional browser login/logout (pure auth, no activity tracking)
exports.authLogin = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ msg: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      res.json({
        token,
        user,
        message: 'Authentication successful',
      });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };
  
  exports.authLogout = async (req, res) => {
    try {
      // No session persistence; front-end can discard token
      res.json({ msg: 'Logged out successfully' });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  };
  