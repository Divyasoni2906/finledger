const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createUserValidation,
  updateUserValidation,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// GET /api/users - Admin only: list all users
router.get('/', authorize('admin'), getAllUsers);

// GET /api/users/:id - Admin only: get single user
router.get('/:id', authorize('admin'), getUserById);

// POST /api/users - Admin only: create a user with any role
router.post('/', authorize('admin'), createUserValidation, createUser);

// PATCH /api/users/:id - Admin only: update name, role, status
router.patch('/:id', authorize('admin'), updateUserValidation, updateUser);

// DELETE /api/users/:id - Admin only: hard delete a user
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
