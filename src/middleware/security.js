const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("../config/env");

const corsOptions = config.CORS_ORIGIN === "*"
  ? { origin: true }
  : { origin: config.CORS_ORIGIN.split(",").map(v => v.trim()), credentials: true };

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  limit: config.RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests, please try again later" } }
});

module.exports = { helmetMiddleware: helmet(), corsMiddleware: cors(corsOptions), limiter };
