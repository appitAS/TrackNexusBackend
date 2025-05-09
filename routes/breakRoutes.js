const express = require('express');
const router = express.Router();
const { startBreak, editBreak, getBreaksInRange, endBreak } = require('../controllers/breakController');
const {auth} = require('../middleware/auth');

router.post('/start', auth, startBreak);
router.put('/:breakId', auth, editBreak);
router.get('/range', auth, getBreaksInRange);
router.post('/end', auth, endBreak);

module.exports = router;
