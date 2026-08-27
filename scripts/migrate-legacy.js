/*
 * One-time migration from the original embedded User.enrolledCourses / User.notifications model.
 * Run against a backup first:
 *   node scripts/migrate-legacy.js
 *
 * The script copies legacy embedded records into Enrollment/Notification collections.
 * It does not delete legacy fields; remove them only after verifying the migrated data.
 */
const mongoose = require("mongoose");
const config = require("../src/config/env");
const User = require("../src/models/user");
const Enrollment = require("../src/models/enrollment");
const Notification = require("../src/models/notification");

async function run() {
  await mongoose.connect(config.MONGODB_URI);
  const LegacyUser = mongoose.model("LegacyUser", new mongoose.Schema({}, { strict: false, collection: "users" }));

  let migratedEnrollments = 0;
  let migratedNotifications = 0;

  for await (const user of LegacyUser.find({})) {
    const legacyEnrollments = user.enrolledCourses || [];
    for (const item of legacyEnrollments) {
      try {
        await Enrollment.updateOne(
          { student: user._id, course: item.courseId },
          {
            $setOnInsert: {
              student: user._id,
              course: item.courseId,
              enrolledAt: item.enrollmentDate || new Date(),
              completedLessons: item.progress?.completedLessons || [],
              quizScores: item.progress?.quizScores || {}
            }
          },
          { upsert: true }
        );
        migratedEnrollments++;
      } catch (err) {
        console.error("Enrollment migration failed:", user._id.toString(), item.courseId?.toString(), err.message);
      }
    }

    for (const item of (user.notifications || [])) {
      try {
        await Notification.create({
          recipient: user._id,
          // Legacy notifications did not store sender. Use the recipient as a neutral migration placeholder.
          sender: user._id,
          message: item.message,
          createdAt: item.date || new Date(),
          readAt: item.isRead ? (item.date || new Date()) : null
        });
        migratedNotifications++;
      } catch (err) {
        console.error("Notification migration failed:", user._id.toString(), err.message);
      }
    }
  }

  console.log({ migratedEnrollments, migratedNotifications });
  await mongoose.disconnect();
}

run().catch(async err => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});