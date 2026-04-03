// routes/auth.routes.js

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");

const {
  getRecords,
  getRecordById,
  updateRecord,
  createRecord,
  deleteRecord,
  searchRecords,
  exportRecords,
} = require("../controllers/record.controller");

const {
  getSummary,
  getCategoryBreakdown,
  getTopCategories,
  getMonthlyTrends,
  getBalanceOverTime,
  getRecentTransactions,
  getWeeklyTrends,
} = require("../controllers/dashboard.controller");

const {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/category.controller");

//  Rate Limiters
const {
  authLimiter,
  searchLimiter,
  exportLimiter,
  userLimiter,
  dashboardLimiter,
  apiLimiter,
} = require("../middleware/rateLimiter");

//#region middleware
const {
  validate,
  registerSchema,
  loginSchema,
  createRecordSchema,
  createCategorySchema,
  updateRecordSchema,
  updateUserSchema,
  updateCategorySchema,
  updateRoleSchema,
} = require("../middleware/auth.validation");

//#region Authentication
router.post(
  "/auth/register",
  authLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(registerSchema),
  registerUser,
);

router.post("/auth/login", authLimiter, validate(loginSchema), loginUser);

router.post("/auth/logout", authMiddleware, logoutUser);

// #region User & Role Management
router.get(
  "/users",
  userLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  getUsers,
);

router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserById);

router.post(
  "/users",
  userLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(registerSchema),
  createUser,
);

router.put(
  "/users/:id",
  userLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(updateUserSchema),
  updateUser,
);

router.patch(
  "/users/:id/role",
  userLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(updateRoleSchema),
  updateUserRole,
);

router.delete(
  "/users/:id",
  userLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser,
);

//#region Financial Records
router.get(
  "/records",
  apiLimiter,
  authMiddleware,
  roleMiddleware(["viewer", "analyst", "admin"]),
  getRecords,
);

router.post(
  "/records",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(createRecordSchema),
  createRecord,
);

router.put(
  "/records/:id",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(updateRecordSchema),
  updateRecord,
);

router.delete(
  "/records/:id",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  deleteRecord,
);

router.get(
  "/records/search",
  searchLimiter,
  authMiddleware,
  roleMiddleware(["analyst", "admin"]),
  searchRecords,
);

router.get(
  "/records/export",
  exportLimiter,
  authMiddleware,
  roleMiddleware(["analyst", "admin"]),
  exportRecords,
);
router.get("/records/:id", authMiddleware, getRecordById);
//#region Dashboard
router.get("/dashboard/summary", dashboardLimiter, authMiddleware, getSummary);

router.get(
  "/dashboard/by-category",
  dashboardLimiter,
  authMiddleware,
  getCategoryBreakdown,
);

router.get(
  "/dashboard/trends/monthly",
  dashboardLimiter,
  authMiddleware,
  roleMiddleware(["analyst", "admin"]),
  getMonthlyTrends,
);

router.get(
  "/dashboard/trends/weekly",
  dashboardLimiter,
  authMiddleware,
  roleMiddleware(["analyst", "admin"]),
  getWeeklyTrends,
);

router.get(
  "/dashboard/balance-over-time",
  dashboardLimiter,
  authMiddleware,
  roleMiddleware(["analyst", "admin"]),
  getBalanceOverTime,
);

router.get(
  "/dashboard/top-categories",
  dashboardLimiter,
  authMiddleware,
  roleMiddleware(["analyst", "admin"]),
  getTopCategories,
);

router.get(
  "/dashboard/recent",
  dashboardLimiter,
  authMiddleware,
  getRecentTransactions,
);

//#region Categories
router.get("/categories", apiLimiter, authMiddleware, getCategories);

router.post(
  "/categories",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(createCategorySchema),
  createCategory,
);

router.put(
  "/categories/:id",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  validate(updateCategorySchema),
  updateCategory,
);

router.delete(
  "/categories/:id",
  apiLimiter,
  authMiddleware,
  roleMiddleware("admin"),
  deleteCategory,
);

module.exports = router;
