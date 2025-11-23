const express = require('express');
const router = express.Router();
const { getMe, getAllUsers } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', verifyToken, getMe);

// GET /api/users (solo admin)
router.get('/', verifyToken, checkRole('admin'), getAllUsers);

module.exports = router;
