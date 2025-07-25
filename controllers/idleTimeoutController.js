const Activity = require('../models/Activity');
const User = require('../models/User'); 
const moment = require('moment');
const { getIO } = require('../socket');

const IST = () => new Date(Date.now() + 5.5 * 60 * 60 * 1000);

exports.createIdleTimeout = async (req, res) => {
  try {
    const io = getIO();
    const userId = req.user.id;
    const today = IST().toISOString().split('T')[0];

    const activity = await Activity.findOne({ userId, date: today });

    if (!activity) {
      return res.status(400).json({ msg: 'Cannot record idle timeout. Activity not found. Please punch in first.' });
    }
    io.emit('status:update', {
      userId: userId,
      status: 'idle',
      timestamp: IST(),
    });
    activity.idleEvents.push({
      endedAt : null,
      startedAt: IST(),
      reason: 'System idle timeout',
    });

    await activity.save();
    res.status(201).json({ msg: 'Idle timeout recorded', idleEvent: activity.idleEvents.at(-1) });
  } catch (err) {
    console.error('createIdleTimeout:', err);
    res.status(500).json({ msg: 'Failed to create idle timeout' });
  }
};

exports.getIdleTimeoutsByDateRange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    if (!start || !end) return res.status(400).json({ msg: 'Start and end dates are required' });

    const activities = await Activity.find({
      userId,
      date: { $gte: start, $lte: end },
      'idleEvents.0': { $exists: true }
    });

    res.status(200).json(activities);
  } catch (err) {
    console.error('getIdleTimeoutsByDateRange:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.submitClaim = async (req, res) => {
  try {
    const userId = req.user.id;
    const { idleEventId, reason } = req.body;
    const today = IST().toISOString().split('T')[0];

    const activity = await Activity.findOne({ userId, date: today });
    if (!activity || !activity.idleEvents.length) {
      return res.status(404).json({ msg: 'No activity events found' });
    }

    const idleEvent = activity.idleEvents.find(i => i._id.toString() === idleEventId);
    if (!idleEvent) return res.status(404).json({ msg: 'Idle event not found' });

   // if (idleEvent.endedAt) return res.status(400).json({ msg: 'Claim already submitted for this idle event' });

    idleEvent.endedAt = IST();
    idleEvent.claimRequestedAt = IST();
    idleEvent.status = 'pending';
    if (reason) idleEvent.reason = reason;

    activity.currentStatus = 'Claim Submitted';

    await activity.save();
    res.status(200).json({ msg: 'Claim submitted', idleEvent });
  } catch (err) {
    console.error('submitClaim:', err);
    res.status(500).json({ msg: 'Failed to submit claim' });
  }
};
exports.updateIdleTimeoutById = async (req, res) => {
  try {
    const { activityId, idleEventId } = req.params;
    const { endedAt, status } = req.body;

    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });

      const idleEvent = activity.idleEvents.find(
      event => event._id.toString() === idleEventId
    );
    if (!idleEvent) return res.status(404).json({ msg: 'Idle event not found' });

    if (endedAt) idleEvent.endedAt = new Date(endedAt);
    if (status) idleEvent.status = status;
    idleEvent.updatedAt = IST();

    if (req.user?.name) {
      idleEvent.ApprovedBy = req.user.name;
    }

    await activity.save();
    res.status(200).json({ msg: 'Idle timeout updated', idleEvent });
  } catch (err) {
    console.error('updateIdleTimeoutById:', err);
    res.status(500).json({ msg: 'Failed to update timeout',msg: err.message });
  }
};

exports.getAllIdleTimeoutsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ msg: 'Start and end dates are required' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const users = await User.find({}, '_id name email');

    const results = await Promise.all(
      users.map(async (user) => {
        const activities = await Activity.find({
          userId: user._id,
          date: { $gte: start, $lte: end },
          'idleEvents.0': { $exists: true }
        });

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          },
          activities
        };
      })
    );

    res.status(200).json(results);
  } catch (err) {
    console.error('getAllIdleTimeoutsByDateRange:', err);
    res.status(500).json({ msg: 'Failed to fetch idle timeouts' });
  }
};

exports.deleteIdleTimeout = async (req, res) => {
  try {
    const { activityId, idleEventIndex } = req.params;

    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });

    activity.idleEvents.splice(idleEventIndex, 1);
    await activity.save();

    res.status(200).json({ msg: 'Idle timeout deleted' });
  } catch (err) {
    console.error('deleteIdleTimeout:', err);
    res.status(500).json({ msg: 'Failed to delete timeout' });
  }
};
