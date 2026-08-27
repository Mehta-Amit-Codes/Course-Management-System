const express = require("express");
const controller = require("../controllers/courseController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { authenticateTeacher } = require("../middleware/auth");
const { courseCreateSchema, courseUpdateSchema, idParamSchema, paginationSchema } = require("../utils/schemas");

const router = express.Router();

router.get("/", validate(paginationSchema, "query"), asyncHandler(controller.listCourses));
router.post("/", authenticateTeacher, validate(courseCreateSchema), asyncHandler(controller.createCourse));
router.put("/:id", authenticateTeacher, validate(idParamSchema, "params"), validate(courseUpdateSchema), asyncHandler(controller.updateCourse));
router.delete("/:id", authenticateTeacher, validate(idParamSchema, "params"), asyncHandler(controller.deleteCourse));

module.exports = router;
