const Activity = require('../models/Activity');

async function calculateStatsForDate(userId, dateStr) {
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999`);
 //const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // IST
  let activity = await Activity.findOne({ userId, date: dateStr });
  if (!activity) {
    activity = await Activity.findOne({
      userId,
      punchInTime: { $gte: dayStart, $lte: dayEnd },
    });
  }


  if (!activity) {
    return {
      date: dateStr,
      workingTimeInSeconds: 0,
      idleTimeInSeconds: 0,
      breakTimeInSeconds: 0,
      currentStatus: "No activity"
    };
  }
  const now = activity.lastSeen;
  // Calculate total break time (completed + ongoing)
  let totalBreakSeconds = 0;
  if (activity.breaks?.length) {
    activity.breaks.forEach(b => {
      if (b.startedAt) {
        const end = b.endedAt || now;
        totalBreakSeconds += (new Date(end) - new Date(b.startedAt)) / 1000;
      }
    });
  }

  // Calculate total idle time (completed + ongoing)
  let totalIdleSeconds = 0;
  if (activity.idleEvents?.length) {
    activity.idleEvents.forEach(event => {
      if (event.startedAt) {
        const end = event.endedAt || now;
        totalIdleSeconds += (new Date(end) - new Date(event.startedAt)) / 1000;
      }
    });
  }

  // Calculate work time
  let totalWorkSeconds = (activity.totalWorkMinutes || 0) * 60;
  if (activity.activeSessionStart) {
    totalWorkSeconds += Math.floor((now - new Date(activity.activeSessionStart)) / 1000);
  }

  return {
    date: dateStr,
    workingTimeInSeconds: Math.floor(totalWorkSeconds),
    idleTimeInSeconds: Math.floor(totalIdleSeconds),
    breakTimeInSeconds: Math.floor(totalBreakSeconds),
    punchInTime: activity.punchInTime,
    currentStatus: activity.currentStatus
  };
}

module.exports = { calculateStatsForDate };
