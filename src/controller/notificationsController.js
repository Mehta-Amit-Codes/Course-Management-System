const Notification = require("../models/notification");
const User = require("../models/user");
const AppError = require("../utils/appError");
const { getPagination } = require("../utils/pagination");

exports.getNotifications = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { recipient: req.user._id };
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate("sender", "username role")
      .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter)
  ]);
  res.json({ data: notifications, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.sendNotification = async (req, res) => {
  const { message, recipientId } = req.body;
  const recipient = await User.findOne({ _id: recipientId, role: "student" }).select("_id");
  if (!recipient) throw new AppError(404, "Student recipient not found", "RECIPIENT_NOT_FOUND");

  const notification = await Notification.create({
    message, recipient: recipient._id, sender: req.user._id
  });
  res.status(201).json({ notification });
};

exports.markNotificationAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) throw new AppError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
  res.json({ notification });
};
