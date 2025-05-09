const express = require('express');
const router = express.Router();
const {
  getIdleTimeoutsByDateRange,
  submitClaim,
  updateIdleTimeoutById,
  getAllIdleTimeoutsByDateRange,
  deleteIdleTimeout,
  createIdleTimeout
} = require('../controllers/idleTimeoutController');

const { auth, requireRole } = require('../middleware/auth');

// 🟢 Regular User
router.get('/user/:userId', auth, getIdleTimeoutsByDateRange);
router.post('/submit-claim', auth, submitClaim);
router.post('/create',auth, createIdleTimeout);
// 🔒 Admin/Manager Only
router.put('/update/:activityId/:idleEventIndex', auth, requireRole('manager', 'admin'), updateIdleTimeoutById);
router.get('/all', auth, requireRole('manager', 'admin'), getAllIdleTimeoutsByDateRange);
router.delete('/delete/:activityId/:idleEventIndex', auth, requireRole('manager', 'admin'), deleteIdleTimeout);

module.exports = router;
