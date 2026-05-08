const { Op } = require('sequelize');
const Task = require('../models/Task');
const User = require('../models/User');

// @route  GET /api/v1/tasks
// @access Private (user sees own, admin sees all)
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.user.role !== 'admin') where.userId = req.user.id;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/v1/tasks/:id
// @access Private
const getTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') where.userId = req.user.id;

    const task = await Task.findOne({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/v1/tasks
// @access Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Task created', data: { task } });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/v1/tasks/:id
// @access Private
const updateTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') where.userId = req.user.id;

    const task = await Task.findOne({ where });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { title, description, status, priority, dueDate } = req.body;
    await task.update({ title, description, status, priority, dueDate });

    res.status(200).json({ success: true, message: 'Task updated', data: { task } });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/v1/tasks/:id
// @access Private (admin can delete any, user can delete own)
const deleteTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') where.userId = req.user.id;

    const task = await Task.findOne({ where });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await task.destroy();
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
