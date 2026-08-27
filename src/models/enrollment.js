const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  enrolledAt: { type: Date, default: Date.now },
  completedLessons: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  quizScores: { type: Map, of: Number, default: {} }
}, { timestamps: true, versionKey: false });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
module.exports = mongoose.model("Enrollment", enrollmentSchema);