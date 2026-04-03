const dashboardService = require("../services/dashboard.service");

const getSummary = async (req, res) => {
  try {
    const result = await dashboardService.getSummary(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch summary",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const result = await dashboardService.getCategoryBreakdown(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch category breakdown",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Category Breakdown Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const getMonthlyTrends = async (req, res) => {
  try {
    const result = await dashboardService.getMonthlyTrends(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch trends",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Monthly Trends Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const getWeeklyTrends = async (req, res) => {
  try {
    const result = await dashboardService.getWeeklyTrends(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch weekly trends",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Weekly Trends Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const result = await dashboardService.getRecentTransactions();

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch recent transactions",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Recent Transactions Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const getBalanceOverTime = async (req, res) => {
  try {
    const result = await dashboardService.getBalanceOverTime(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch balance trend",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Balance Over Time Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const getTopCategories = async (req, res) => {
  try {
    const result = await dashboardService.getTopCategories(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch top categories",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Top Categories Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary (income, expense, net balance)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           example: "2026-04-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           example: "2026-04-30"
 *     responses:
 *       200:
 *         description: Summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_income:
 *                       type: number
 *                       example: 50000
 *                     total_expense:
 *                       type: number
 *                       example: 20000
 *                     net_balance:
 *                       type: number
 *                       example: 30000
 *       400:
 *         description: Invalid date format
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/dashboard/by-category:
 *   get:
 *     summary: Category-wise income and expense breakdown
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           example: "2026-04-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           example: "2026-04-30"
 *     responses:
 *       200:
 *         description: Category breakdown fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "Food"
 *                       total:
 *                         type: number
 *                         example: 5000
 *                       count:
 *                         type: number
 *                         example: 10
 *       400:
 *         description: Invalid date
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/trends/monthly:
 *   get:
 *     summary: Monthly income vs expense trends
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *     responses:
 *       200:
 *         description: Monthly trends fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: number
 *                         example: 1
 *                       income:
 *                         type: number
 *                         example: 50000
 *                       expense:
 *                         type: number
 *                         example: 20000
 *                       net:
 *                         type: number
 *                         example: 30000
 *       400:
 *         description: Invalid year
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/dashboard/trends/weekly:
 *   get:
 *     summary: Weekly income vs expense trends
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 4
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *     responses:
 *       200:
 *         description: Weekly trends fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       week:
 *                         type: number
 *                       income:
 *                         type: number
 *                       expense:
 *                         type: number
 *       400:
 *         description: Invalid month/year
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get latest 10 transactions
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recent transactions fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       type:
 *                         type: string
 *                       category:
 *                         type: string
 *                       date:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/balance-over-time:
 *   get:
 *     summary: Get running balance over time
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           example: "2026-04-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           example: "2026-04-30"
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           example: daily
 *     responses:
 *       200:
 *         description: Balance trend fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       balance:
 *                         type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/dashboard/top-categories:
 *   get:
 *     summary: Get top 5 categories by total amount
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           example: "2026-04-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           example: "2026-04-30"
 *     responses:
 *       200:
 *         description: Top categories fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "Food"
 *                       total:
 *                         type: number
 *                         example: 5000
 *                       percentage:
 *                         type: number
 *                         example: 25.5
 *       400:
 *         description: Invalid date
 *       401:
 *         description: Unauthorized
 */

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getTopCategories,
  getWeeklyTrends,
  getBalanceOverTime,
  getRecentTransactions,
};
