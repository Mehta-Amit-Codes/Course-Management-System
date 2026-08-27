const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 80,
    index: true
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "teacher"], required: true, index: true },
  school: { type: String, trim: true, maxlength: 200 }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("User", userSchema);
