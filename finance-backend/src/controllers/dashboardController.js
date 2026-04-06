const dashboardService = require('../services/dashboardService');

const getSummary = (req, res) => {
  try {
    res.json(dashboardService.getSummary());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCategoryTotals = (req, res) => {
  try {
    res.json(dashboardService.getCategoryTotals());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMonthlyTrends = (req, res) => {
  try {
    const { year } = req.query;
    res.json(dashboardService.getMonthlyTrends(year));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWeeklyTrends = (req, res) => {
  try {
    const { weeks } = req.query;
    res.json(dashboardService.getWeeklyTrends(weeks));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRecentActivity = (req, res) => {
  try {
    const { limit } = req.query;
    res.json(dashboardService.getRecentActivity(limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};
