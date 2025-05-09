const Screenshot = require('../models/Screenshot');
const path = require('path');
const User = require('../models/User')
exports.uploadScreenshot = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const screenshot = new Screenshot({
      userId,
      timestamp: new Date(Date.now() + 5.5 * 60 * 60 * 1000),
      filename: req.file.filename
    });

    await screenshot.save();
    res.json({ msg: 'Screenshot uploaded', screenshot });
  } catch (err) {
    console.error('Upload Screenshot Error:', err);
    res.status(500).json({ msg: 'Failed to upload screenshot' });
  }
};

exports.getScreenshotsInRange = async (req, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({ msg: 'startDate and endDate required' });
      }
      if (!startDate || !endDate) {
        return res.status(400).json({ msg: 'startDate and endDate are required' });
      }
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // start of the day

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // end of the day
  
      const screenshots = await Screenshot.find({
        userId,
        timestamp: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      }).sort({ timestamp: 1 });
  
      // Add public URL to each screenshot
      const enriched = screenshots.map(ss => ({
        _id: ss._id,
        timestamp: ss.timestamp,
        url: `${req.protocol}://${req.get('host')}/uploads/screenshots/${ss.filename}`
      }));
  
      res.json({ screenshots: enriched });
    } catch (err) {
      console.error('Fetch Screenshots Error:', err);
      res.status(500).json({ msg: 'Failed to fetch screenshots' });
    }
  };
  
  exports.getAllScreenshotsGroupedByUser = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ msg: 'startDate and endDate are required' });
      }
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // start of the day

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // end of the day

      const screenshots = await Screenshot.find({
        timestamp: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      }).populate('userId', 'name email') // Adjust as needed per your User model
        .sort({ timestamp: 1 });
  
      const grouped = {};
  
      screenshots.forEach(ss => {
        if (!ss.userId) {
          console.warn(`Screenshot ${ss._id} has no valid user reference.`);
          return;
        }
  
        const userName = ss.userId.name;
        if (!grouped[userName]) {
          grouped[userName] = {
            user: {
              id: ss.userId._id,
              name: ss.userId.name,
              email: ss.userId.email
            },
            screenshots: []
          };
        }
  
        grouped[userName].screenshots.push({
          _id: ss._id,
          timestamp: ss.timestamp,
          url: `${req.protocol}://${req.get('host')}/uploads/screenshots/${ss.filename}`
        });
      });
  
      res.json(grouped);
    } catch (err) {
      console.error('Error fetching all screenshots:', err);
      res.status(500).json({ msg: 'Failed to fetch screenshots' });
    }
  };