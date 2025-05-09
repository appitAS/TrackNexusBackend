const Activity = require('../models/Activity');
const { getIO } = require('../socket'); 
exports.startBreak = async (req, res) => {
  try {
    const io = getIO();
    const { reason, durationInMinutes } = req.body;
    const userId = req.user.id;
    const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];

    const activity = await Activity.findOne({ userId, date: today });
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });

    activity.breaks.push({
      reason,
      durationInMinutes,
      startedAt: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
      endedAt: null
    });
    activity.currentStatus= "On Break";
    await activity.save();
    io.emit('status:update', {
      userId: userId,
      status: 'on break',
      timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
    });
    res.json({ msg: 'Break started', break: activity.breaks[activity.breaks.length - 1] });
  } catch (err) {
    console.error('Start Break Error:', err);
    res.status(500).json({ msg: 'Failed to start break' });
  }
};

exports.editBreak = async (req, res) => {
    try {
      const userId = req.user.id;
      const { breakId } = req.params;
      const { reason, durationInMinutes, startedAt } = req.body;
  
      const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
      const activity = await Activity.findOne({ userId, date: today });
  
      if (!activity) return res.status(404).json({ msg: 'Activity not found' });
  
      const targetBreak = activity.breaks.id(breakId);
      if (!targetBreak) return res.status(404).json({ msg: 'Break not found' });
  
      if (reason !== undefined) targetBreak.reason = reason;
      if (durationInMinutes !== undefined) targetBreak.durationInMinutes = durationInMinutes;
      if (startedAt !== undefined) targetBreak.startedAt = new Date(startedAt);
      activity.currentStatus= "Active";
      // Do NOT allow endedAt to be updated here — that's for the endBreak API
      await activity.save();
  
      res.json({ msg: 'Break updated (duration or reason)', break: targetBreak });
    } catch (err) {
      console.error('Edit Break Error:', err);
      res.status(500).json({ msg: 'Failed to update break' });
    }
  };

  exports.getBreaksInRange = async (req, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
  
      const activities = await Activity.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      });
  
      const allBreaks = activities.flatMap(activity =>
        activity.breaks.map(b => ({
          ...b.toObject(),
          activityDate: activity.date
        }))
      );
  
      res.json({ breaks: allBreaks });
    } catch (err) {
      console.error('List Breaks Error:', err);
      res.status(500).json({ msg: 'Failed to fetch breaks' });
    }
  };
    
exports.endBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];

    const activity = await Activity.findOne({ userId, date: today });
    if (!activity || !activity.breaks || activity.breaks.length === 0)
      return res.status(404).json({ msg: 'No active break found' });

    const ongoingBreak = activity.breaks.find(b => !b.endedAt);
    if (!ongoingBreak) return res.status(400).json({ msg: 'No ongoing break to end' });

    ongoingBreak.endedAt = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    activity.lastSeen = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    await activity.save();

    res.json({ msg: 'Break ended', break: ongoingBreak });
  } catch (err) {
    console.error('End Break Error:', err);
    res.status(500).json({ msg: 'Failed to end break' });
  }
};
