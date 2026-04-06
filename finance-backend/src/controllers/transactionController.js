const { body, query } = require('express-validator');
const transactionService = require('../services/transactionService');
const { validate } = require('../middleware/validate');

const createTransactionValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .optional()
    .isDate()
    .withMessage('Date must be a valid date (YYYY-MM-DD)'),
  body('notes').optional().isString(),
  validate,
];

const updateTransactionValidation = [
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('date')
    .optional()
    .isDate()
    .withMessage('Date must be a valid date (YYYY-MM-DD)'),
  body('notes').optional().isString(),
  validate,
];

const getTransactions = (req, res) => {
  try {
    const { type, category, dateFrom, dateTo, page, limit } = req.query;
    const result = transactionService.getTransactions({ type, category, dateFrom, dateTo, page, limit });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const getTransactionById = (req, res) => {
  try {
    res.json(transactionService.getTransactionById(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const createTransaction = (req, res) => {
  try {
    const transaction = transactionService.createTransaction({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const updateTransaction = (req, res) => {
  try {
    const transaction = transactionService.updateTransaction(req.params.id, req.body);
    res.json({ message: 'Transaction updated successfully', transaction });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

const deleteTransaction = (req, res) => {
  try {
    const result = transactionService.deleteTransaction(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransactionValidation,
  updateTransactionValidation,
};
