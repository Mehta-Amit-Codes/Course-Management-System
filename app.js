const express = require("express");
const pino = require("pino");
const pinoHttp = require("pino-http");
const config = require("./src/config/env");
const { connectDatabase, disconnectDatabase } = require("./src/config/database");
const mongoose = require("mongoose");
const { helmetMiddleware, corsMiddleware, limiter } = require("./src/middleware/security");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/auth");
const courseRoutes = require("./src/routes/courses");
const enrollmentRoutes = require("./src/routes/enrollment");
const progressRoutes = require("./src/routes/progress");
const notificationRoutes = require("./src/routes/notifications");

const logger = pino({ level: config.LOG_LEVEL });
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(pinoHttp({ logger }));
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(limiter);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/ready", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready" });
});

const api = express.Router();
api.use("/auth", authRoutes);
api.use("/courses", courseRoutes);
api.use("/enrollment", enrollmentRoutes);
api.use("/progress", progressRoutes);
api.use("/notifications", notificationRoutes);

app.use("/api/v1", api);
// Compatibility alias for clients using the original route prefix.
app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  const server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, "Course Management API started");
  });

  const shutdown = async signal => {
    logger.info({ signal }, "Shutting down");
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

if (require.main === module) {
  start().catch(err => {
    logger.fatal({ err }, "Application startup failed");
    process.exit(1);
  });
}

module.exports = app;