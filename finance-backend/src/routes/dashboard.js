const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

// Viewers can see the summary and recent activity (read-only overview)
// Analysts and admins get full analytics access

// GET /api/dashboard/summary - All roles
router.get('/summary', authorize('viewer', 'analyst', 'admin'), getSummary);

// GET /api/dashboard/recent - All roles
router.get('/recent', authorize('viewer', 'analyst', 'admin'), getRecentActivity);

// GET /api/dashboard/categories - Analyst and admin
router.get('/categories', authorize('analyst', 'admin'), getCategoryTotals);

// GET /api/dashboard/trends/monthly?year=2024 - Analyst and admin
router.get('/trends/monthly', authorize('analyst', 'admin'), getMonthlyTrends);

// GET /api/dashboard/trends/weekly?weeks=8 - Analyst and admin
router.get('/trends/weekly', authorize('analyst', 'admin'), getWeeklyTrends);

module.exports = router;
