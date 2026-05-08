const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus, getStats } = require('../../controllers/adminController');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/stats', getStats);

module.exports = router;
