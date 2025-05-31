const Config = require('../models/Config');

exports.getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const allowedUpdates = [
      'inactivityDurationMins',
      'screenshotIntervalMins',
      'applicationPunchInTime',
      'applicationPunchOutTime',
      'applicationAdminPassword'
    ];
    const updates = {};

    // Helper to validate "HH:mm" 24-hour format
    const isValidTimeFormat = (timeStr) => {
      return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
    };

    // Validate and prepare updates
    for (const key of allowedUpdates) {
      if (req.body.hasOwnProperty(key)) {
        const value = req.body[key];

        if ((key === 'applicationPunchInTime' || key === 'applicationPunchOutTime') && !isValidTimeFormat(value)) {
          return res.status(400).json({ error: `${key} must be in HH:mm 24-hour format (e.g., "09:00", "19:30")` });
        }

        updates[key] = value;
      }
    }

    let config = await Config.findOne();

    if (!config) {
      config = await Config.create(updates);
    } else {
      config.set(updates);
      await config.save();
    }

    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update config' });
  }
};

