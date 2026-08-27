const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config/env");
const AppError = require("../utils/appError");

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, username: user.username },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

exports.registerUser = async (req, res) => {
  const { username, password, role, school } = req.body;

  // Prevent privilege escalation: teacher registration requires a separate provisioning key.
  let assignedRole = "student";
  if (role === "teacher") {
    if (!config.TEACHER_REGISTRATION_KEY || req.get("X-Teacher-Registration-Key") !== config.TEACHER_REGISTRATION_KEY) {
      throw new AppError(403, "Teacher registration is restricted", "TEACHER_REGISTRATION_RESTRICTED");
    }
    assignedRole = "teacher";
  }

  const existing = await User.findOne({ username }).lean();
  if (existing) throw new AppError(409, "Username already exists", "USERNAME_EXISTS");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    password: passwordHash,
    role: assignedRole,
    school
  });

  res.status(201).json({
    user: { id: user._id, username: user.username, role: user.role, school: user.school }
  });
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, "Invalid username or password", "INVALID_CREDENTIALS");
  }

  res.json({
    token: signToken(user),
    expiresIn: config.JWT_EXPIRES_IN,
    user: { id: user._id, username: user.username, role: user.role, school: user.school }
  });
};
