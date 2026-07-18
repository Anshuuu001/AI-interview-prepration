const express = require('express');
const router = express.Router();
const { 
  login, 
  register, 
  googleLogin, 
  suspendAccount, 
  verifyDeviceCode, 
  unlockAccount, 
  getUsersList, 
  toggleUserRole,
  extendSuspension,
  banUser,
  updateProfile
} = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/verify-device', verifyDeviceCode);
router.post('/register', register);
router.post('/google', googleLogin);
router.post('/suspend', suspendAccount);

// Protected Admin Routes
router.post('/unlock', authMiddleware, adminMiddleware, unlockAccount);
router.get('/users', authMiddleware, adminMiddleware, getUsersList);
router.post('/toggle-role', authMiddleware, adminMiddleware, toggleUserRole);
router.post('/extend-suspension', authMiddleware, adminMiddleware, extendSuspension);
router.post('/ban', authMiddleware, adminMiddleware, banUser);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
