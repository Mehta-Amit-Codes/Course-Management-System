const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/user");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required", "AUTH_REQUIRED");
  }

  const token = header.slice(7).trim();
  if (!token) throw new AppError(401, "Authentication required", "AUTH_REQUIRED");

  let payload;
  try {
    payload = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw new AppError(401, "Invalid or expired token", "INVALID_TOKEN");
  }

  const user = await User.findById(payload.sub).select("_id username role school");
  if (!user) throw new AppError(401, "User no longer exists", "USER_NOT_FOUND");

  req.user = user;
  next();
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action", "FORBIDDEN"));
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  authenticateTeacher: [authenticate, authorize("teacher")],
  authenticateStudent: [authenticate, authorize("student")]
};
