const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadScreenshot, getScreenshotsInRange , getAllScreenshotsGroupedByUser } = require('../controllers/screenshotController');
const { auth, requireRole } = require('../middleware/auth');

// POST /api/screenshots/upload
router.post('/upload', auth, upload.single('screenshot'), uploadScreenshot);

// GET /api/screenshots/range?startDate=...&endDate=...
router.get('/range', auth, getScreenshotsInRange);
router.get('/all-in-range', auth, requireRole('manager', 'admin'), getAllScreenshotsGroupedByUser);

module.exports = router;
