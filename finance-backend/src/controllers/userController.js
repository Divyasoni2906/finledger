const { body, param } = require('express-validator');
const userService = require('../services/userService');
const { validate } = require('../middleware/validate');

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin'])
    .withMessage('Role must be viewer, analyst, or admin'),
  validate,
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin'])
    .withMessage('Role must be viewer, analyst, or admin'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  validate,
];

const getAllUsers = (req, res) => {
  try {
    res.json(userService.getAllUsers());
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getUserById = (req, res) => {
  try {
    res.json(userService.getUserById(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const updateUser = (req, res) => {
  try {
    const user = userService.updateUser(req.params.id, req.body);
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const deleteUser = (req, res) => {
  try {
    const result = userService.deleteUser(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createUserValidation,
  updateUserValidation,
};
