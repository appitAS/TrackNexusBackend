const Activity = require('../models/Activity');
const Break = require('../models/Break');
const User = require('../models/User'); // ⬅️ Add this if not imported
const { eachDayOfInterval } = require('date-fns');
const moment = require('moment');
const { calculateStatsForDate } = require('../utils/statsHelper');
const { getIO } = require('../socket');

exports.getDailyStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const todayStr = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stats = await calculateStatsForDate(userId, todayStr);
    res.status(200).json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ msg: 'Failed to get stats' });
  }
};

exports.getRangeStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ msg: 'Date range required' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const statsPromises = days.map((day) => {
      const dateString = moment(day).format('YYYY-MM-DD');
      return calculateStatsForDate(userId, dateString);
    });

    const result = await Promise.all(statsPromises);
    res.json(result);
  } catch (err) {
    console.error('getRangeStats error:', err);
    res.status(500).json({ msg: 'Failed to get range stats' });
  }
};

exports.updateLastSeen = async (req, res) => {
  try {
    const io = getIO();
    const userId = req.user.id;
    const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log("today",today);
    const activity = await Activity.findOne({ userId, date: today });
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });

    activity.lastSeen = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    activity.currentStatus= "Active";
    await activity.save();
    // io.emit('status:update', {
    //   userId: userId,
    //   status: 'online',
    //   timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
    // });
    res.status(200).json({ msg: 'Last seen updated', lastSeen: activity.lastSeen });
  } catch (err) {
    console.error('Last Seen Error:', err);
    res.status(500).json({ msg: 'Failed to update last seen' });
  }
};

// ✅ New route: Get stats for all users within a date range (only for managers or admins)
exports.getAllUsersStatsInRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ msg: 'Start and end dates are required' });
    }

    // Check role access
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const users = await User.find({}, '_id name email'); // Select only needed fields
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const userStatsPromises = users.map(async (user) => {
      const dailyStats = await Promise.all(
        days.map((day) => {
          const dateStr = moment(day).format('YYYY-MM-DD');
          return calculateStatsForDate(user._id.toString(), dateStr);
        })
      );

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        stats: dailyStats,
      };
    });

    const result = await Promise.all(userStatsPromises);
    res.status(200).json(result);
  } catch (err) {
    console.error('getAllUsersStatsInRange error:', err);
    res.status(500).json({ msg: 'Failed to get stats for all users' });
  }
};
