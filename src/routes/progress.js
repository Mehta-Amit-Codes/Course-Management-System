const express = require("express");
const controller = require("../controllers/progressController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { authenticateStudent } = require("../middleware/auth");
const { idParamSchema, lessonSchema, quizSchema } = require("../utils/schemas");

const router = express.Router();
router.get("/courses/:id", authenticateStudent, validate(idParamSchema, "params"), asyncHandler(controller.getStudentCourseProgress));
router.post("/courses/:id/lesson", authenticateStudent, validate(idParamSchema, "params"), validate(lessonSchema), asyncHandler(controller.markLessonCompleted));
router.post("/courses/:id/quiz", authenticateStudent, validate(idParamSchema, "params"), validate(quizSchema), asyncHandler(controller.recordQuizScore));
module.exports = router;
