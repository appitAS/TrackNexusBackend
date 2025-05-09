const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const {getConfig,updateConfig} = require('../controllers/configController');

router.get('/',auth,getConfig);
router.put('/',auth,updateConfig);

module.exports = router;
