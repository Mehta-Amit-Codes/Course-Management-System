const express = require("express");
const controller = require("../controllers/enrollmentController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { authenticateStudent } = require("../middleware/auth");
const { idParamSchema, paginationSchema } = require("../utils/schemas");

const router = express.Router();
router.get("/courses", authenticateStudent, validate(paginationSchema, "query"), asyncHandler(controller.getAvailableCourses));
router.post("/courses/:id", authenticateStudent, validate(idParamSchema, "params"), asyncHandler(controller.enrollInCourse));
module.exports = router;
