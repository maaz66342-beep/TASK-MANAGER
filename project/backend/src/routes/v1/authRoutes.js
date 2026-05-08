const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../../controllers/authController');
const { protect } = require('../../middleware/auth');
const { registerValidator, loginValidator } = require('../../middleware/validate');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);

module.exports = router;
