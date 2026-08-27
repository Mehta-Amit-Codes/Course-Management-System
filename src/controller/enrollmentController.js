const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const AppError = require("../utils/appError");
const { getPagination } = require("../utils/pagination");

exports.getAvailableCourses = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const enrolled = await Enrollment.find({ student: req.user._id }).distinct("course");

  const filter = { _id: { $nin: enrolled } };
  if (req.query.search) filter.$text = { $search: req.query.search.trim() };

  const [courses, total] = await Promise.all([
    Course.find(filter).populate("teacher", "username school").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Course.countDocuments(filter)
  ]);

  res.json({ data: courses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.enrollInCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).select("_id");
  if (!course) throw new AppError(404, "Course not found", "COURSE_NOT_FOUND");

  try {
    const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
    res.status(201).json({ enrollment });
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, "Student is already enrolled in this course", "ALREADY_ENROLLED");
    throw err;
  }
};