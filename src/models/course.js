const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000 },
  order: { type: Number, required: true, min: 1 }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  lessons: { type: [lessonSchema], default: [] }
}, { timestamps: true, versionKey: false });

courseSchema.index({ title: "text", description: "text" });
module.exports = mongoose.model("Course", courseSchema);
