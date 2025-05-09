const Config = require('../models/Config');

async function initDefaultConfig() {
  const existing = await Config.findOne();
  if (!existing) {
    await Config.create({
      inactivityDurationMins: 10,
      screenshotIntervalMins: 5,
    });
    console.log('✅ Default configuration created in DB');
  } else {
    console.log('✅ Configuration already exists');
  }
}

module.exports = initDefaultConfig;
