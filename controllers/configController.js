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
      const allowedUpdates = ['inactivityDurationMins', 'screenshotIntervalMins'];
      const updates = {};
  
      // Filter only allowed fields from request body
      for (const key of allowedUpdates) {
        if (req.body.hasOwnProperty(key)) {
          updates[key] = req.body[key];
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
  
