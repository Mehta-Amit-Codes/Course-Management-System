const express = require("express");
const controller = require("../controllers/notificationsController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { authenticateTeacher, authenticateStudent } = require("../middleware/auth");
const { idParamSchema, notificationSchema, paginationSchema } = require("../utils/schemas");

const router = express.Router();
router.get("/", authenticateStudent, validate(paginationSchema, "query"), asyncHandler(controller.getNotifications));
router.post("/", authenticateTeacher, validate(notificationSchema), asyncHandler(controller.sendNotification));
router.patch("/:id", authenticateStudent, validate(idParamSchema, "params"), asyncHandler(controller.markNotificationAsRead));
module.exports = router;
