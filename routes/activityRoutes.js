const express = require('express');
const router = express.Router();
const { getDailyStats, getRangeStats, updateLastSeen, getAllUsersStatsInRange } = require('../controllers/activityController');
const {auth, requireRole} = require('../middleware/auth');

router.get('/stats/:userId', auth, getDailyStats);
router.get('/range/:userId', auth, getRangeStats);
router.post('/last-seen', auth, updateLastSeen);
router.get('/all-users', auth,requireRole('manager', 'admin'), getAllUsersStatsInRange);
module.exports = router;
