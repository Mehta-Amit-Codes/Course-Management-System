const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  readAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

notificationSchema.index({ recipient: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", notificationSchema);