const rateLimit = require("express-rate-limit");

// Auth limiter 
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 5,
  message: {
    result: "fail",
    message: "Too many attempts, try again later",
  },
});

// Search limiter
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    result: "fail",
    message: "Too many search requests",
  },
});

// Export limiter 
const exportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    result: "fail",
    message: "Too many export requests",
  },
});

//  Users limiter
const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
});

//   Dashboard limiter
const dashboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
});

//  General API limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

module.exports = {
  authLimiter,
  searchLimiter,
  exportLimiter,
  userLimiter,
  dashboardLimiter,
  apiLimiter,
};
