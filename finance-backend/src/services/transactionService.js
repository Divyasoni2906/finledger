const { v4: uuidv4 } = require('uuid');
const { query, run, queryOne } = require('../models/db');

/**
 * Get transactions with optional filters and pagination.
 * Filters: type, category, dateFrom, dateTo
 * Pagination: page, limit
 */
const getTransactions = ({ type, category, dateFrom, dateTo, page = 1, limit = 20 } = {}) => {
  const conditions = ['deleted = 0'];
  const params = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (category) {
    conditions.push('LOWER(category) = LOWER(?)');
    params.push(category);
  }
  if (dateFrom) {
    conditions.push('date >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('date <= ?');
    params.push(dateTo);
  }

  const where = conditions.join(' AND ');

  const countRow = queryOne(`SELECT COUNT(*) as total FROM transactions WHERE ${where}`, params);
  const total = countRow ? countRow.total : 0;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const data = query(
    `SELECT * FROM transactions WHERE ${where} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return {
    data,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a single active transaction by ID.
 */
const getTransactionById = (id) => {
  const transaction = queryOne('SELECT * FROM transactions WHERE id = ? AND deleted = 0', [id]);
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }
  return transaction;
};

/**
 * Create a new financial transaction.
 * Allowed roles: admin, analyst (enforced at route level).
 */
const createTransaction = ({ amount, type, category, date, notes, createdBy }) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const txDate = date || now.split('T')[0];

  run(
    `INSERT INTO transactions (id, amount, type, category, date, notes, created_by, deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [id, parseFloat(amount), type, category, txDate, notes || '', createdBy, now, now]
  );

  return queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
};

/**
 * Update an existing transaction (admin only).
 */
const updateTransaction = (id, { amount, type, category, date, notes }) => {
  const transaction = queryOne('SELECT id FROM transactions WHERE id = ? AND deleted = 0', [id]);
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }

  const validTypes = ['income', 'expense'];
  if (type && !validTypes.includes(type)) {
    const err = new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const fields = [];
  const values = [];

  if (amount !== undefined) { fields.push('amount = ?'); values.push(parseFloat(amount)); }
  if (type) { fields.push('type = ?'); values.push(type); }
  if (category) { fields.push('category = ?'); values.push(category); }
  if (date) { fields.push('date = ?'); values.push(date); }
  if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
  fields.push('updated_at = ?'); values.push(now);
  values.push(id);

  run(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);

  return queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
};

/**
 * Soft delete: marks transaction as deleted, preserves record in DB.
 */
const deleteTransaction = (id) => {
  const transaction = queryOne('SELECT id FROM transactions WHERE id = ? AND deleted = 0', [id]);
  if (!transaction) {
    const err = new Error('Transaction not found');
    err.status = 404;
    throw err;
  }

  const now = new Date().toISOString();
  run(
    'UPDATE transactions SET deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?',
    [now, now, id]
  );

  return { message: 'Transaction deleted successfully' };
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
