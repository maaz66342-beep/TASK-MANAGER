const User = require('../models/User');
const Task = require('../models/Task');

// @route  GET /api/v1/admin/users
// @access Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/v1/admin/users/:id/toggle
// @access Admin only
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account.' });
    }

    await user.update({ isActive: !user.isActive });
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/v1/admin/stats
// @access Admin only
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalTasks = await Task.count();
    const pendingTasks = await Task.count({ where: { status: 'pending' } });
    const completedTasks = await Task.count({ where: { status: 'completed' } });

    res.status(200).json({
      success: true,
      data: { totalUsers, totalTasks, pendingTasks, completedTasks },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, toggleUserStatus, getStats };
