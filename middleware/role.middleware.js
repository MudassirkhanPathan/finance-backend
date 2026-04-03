const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        result: "fail",
        message: "Forbidden - No user",
      });
    }

    //   Handle array or string
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(req.user.role)) {
        return res.status(403).json({
          result: "fail",
          message: "Forbidden - Access denied",
        });
      }
    } else {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          result: "fail",
          message: "Forbidden - Access denied",
        });
      }
    }

    next();
  };
};
module.exports = roleMiddleware;
