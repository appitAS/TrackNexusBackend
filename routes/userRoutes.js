const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  logout,
  authLogin,
  authLogout,
  updateUser,
  deleteUser,
  getAllUsers,
} = require('../controllers/userController');

const { auth, requireRole } = require('../middleware/auth');

router.post('/signup', signup);

// Original login/logout (with activity tracking)
router.post('/login', login);
router.post('/logout', auth, logout);

// Functional authentication-only endpoints for browser login
router.post('/auth/login', authLogin);
router.post('/auth/logout', auth, authLogout);

router.put('/:id', auth, updateUser);
router.delete('/:id', auth, requireRole('manager', 'admin'), deleteUser);
router.get('/', auth, requireRole('manager', 'admin'), getAllUsers);

module.exports = router;
