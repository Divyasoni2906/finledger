const { query, queryOne } = require('../models/db');

/**
 * Overall financial summary: income, expenses, balance, count.
 */
const getSummary = () => {
  const row = queryOne(`
    SELECT
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 2)  AS totalIncome,
      ROUND(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2) AS totalExpenses,
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 2) AS netBalance,
      COUNT(*) AS transactionCount
    FROM transactions
    WHERE deleted = 0
  `);

  return {
    totalIncome: row.totalIncome || 0,
    totalExpenses: row.totalExpenses || 0,
    netBalance: row.netBalance || 0,
    transactionCount: row.transactionCount || 0,
  };
};

/**
 * Totals grouped by category, showing income, expense, and net per category.
 */
const getCategoryTotals = () => {
  return query(`
    SELECT
      category,
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 2)  AS income,
      ROUND(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2) AS expense,
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 2) AS net,
      COUNT(*) AS count
    FROM transactions
    WHERE deleted = 0
    GROUP BY LOWER(category)
    ORDER BY expense DESC
  `);
};

/**
 * Monthly income/expense/net trends, filtered by year.
 * Defaults to current year.
 */
const getMonthlyTrends = (year) => {
  const targetYear = year || new Date().getFullYear();

  return query(`
    SELECT
      strftime('%Y-%m', date) AS month,
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 2)  AS income,
      ROUND(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2) AS expense,
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 2) AS net,
      COUNT(*) AS count
    FROM transactions
    WHERE deleted = 0 AND strftime('%Y', date) = ?
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month ASC
  `, [String(targetYear)]);
};

/**
 * Weekly income/expense for the last N weeks (default 8).
 */
const getWeeklyTrends = (weeks = 8) => {
  return query(`
    SELECT
      strftime('%Y-W%W', date) AS week,
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 2)  AS income,
      ROUND(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2) AS expense,
      ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 2) AS net
    FROM transactions
    WHERE deleted = 0
      AND date >= date('now', ? || ' days')
    GROUP BY strftime('%Y-W%W', date)
    ORDER BY week ASC
  `, [String(-(weeks * 7))]);
};

/**
 * Most recent N transactions (default 10).
 */
const getRecentActivity = (limit = 10) => {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit)));
  return query(
    'SELECT * FROM transactions WHERE deleted = 0 ORDER BY created_at DESC LIMIT ?',
    [safeLimit]
  );
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};
