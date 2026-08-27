const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const AppError = require("../utils/appError");

async function getEnrollment(student, courseId) {
  const enrollment = await Enrollment.findOne({ student, course: courseId }).populate("course", "title lessons");
  if (!enrollment) throw new AppError(404, "Course not found or student not enrolled in this course", "ENROLLMENT_NOT_FOUND");
  return enrollment;
}

exports.getStudentCourseProgress = async (req, res) => {
  const enrollment = await getEnrollment(req.user._id, req.params.id);
  res.json({
    progress: {
      courseId: enrollment.course._id,
      completedLessons: enrollment.completedLessons,
      quizScores: Object.fromEntries(enrollment.quizScores)
    }
  });
};

exports.markLessonCompleted = async (req, res) => {
  const { lessonId } = req.body;
  const enrollment = await getEnrollment(req.user._id, req.params.id);
  const validLesson = enrollment.course.lessons.some(l => l._id.toString() === lessonId);
  if (!validLesson) throw new AppError(400, "Lesson does not belong to this course", "INVALID_LESSON");

  await Enrollment.updateOne(
    { _id: enrollment._id },
    { $addToSet: { completedLessons: lessonId } }
  );
  res.json({ message: "Lesson marked as completed" });
};

exports.recordQuizScore = async (req, res) => {
  const { quizId, score } = req.body;
  const enrollment = await getEnrollment(req.user._id, req.params.id);
  await Enrollment.updateOne(
    { _id: enrollment._id },
    { $set: { [`quizScores.${quizId}`]: score } }
  );
  res.json({ message: "Quiz score recorded" });
};