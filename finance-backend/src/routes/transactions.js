const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransactionValidation,
  updateTransactionValidation,
} = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');

// All transaction routes require authentication
router.use(authenticate);

// GET /api/transactions - All roles can view transactions
router.get('/', authorize('viewer', 'analyst', 'admin'), getTransactions);

// GET /api/transactions/:id - All roles can view a single transaction
router.get('/:id', authorize('viewer', 'analyst', 'admin'), getTransactionById);

// POST /api/transactions - Analyst and admin can create transactions
router.post('/', authorize('analyst', 'admin'), createTransactionValidation, createTransaction);

// PATCH /api/transactions/:id - Admin only can update transactions
router.patch('/:id', authorize('admin'), updateTransactionValidation, updateTransaction);

// DELETE /api/transactions/:id - Admin only can delete (soft delete)
router.delete('/:id', authorize('admin'), deleteTransaction);

module.exports = router;
