const express = require("express");
const controller = require("../controllers/authController");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { registerSchema, loginSchema } = require("../utils/schemas");

const router = express.Router();
router.post("/register", validate(registerSchema), asyncHandler(controller.registerUser));
router.post("/login", validate(loginSchema), asyncHandler(controller.loginUser));
module.exports = router;