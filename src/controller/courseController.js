const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const AppError = require("../utils/appError");
const { getPagination } = require("../utils/pagination");

exports.listCourses = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.search) filter.$text = { $search: req.query.search.trim() };

  const [courses, total] = await Promise.all([
    Course.find(filter).populate("teacher", "username school").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Course.countDocuments(filter)
  ]);

  res.json({ data: courses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.createCourse = async (req, res) => {
  const course = await Course.create({ ...req.body, teacher: req.user._id });
  res.status(201).json({ course });
};

exports.updateCourse = async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, teacher: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate("teacher", "username school");

  if (!course) throw new AppError(404, "Course not found or not owned by current teacher", "COURSE_NOT_FOUND");
  res.json({ course });
};

exports.deleteCourse = async (req, res) => {
  const course = await Course.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
  if (!course) throw new AppError(404, "Course not found or not owned by current teacher", "COURSE_NOT_FOUND");

  await Enrollment.deleteMany({ course: course._id });
  res.json({ message: "Course deleted successfully" });
};