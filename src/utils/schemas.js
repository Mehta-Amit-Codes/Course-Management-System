const { z } = require("zod");

const username = z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+$/);
const password = z.string().min(8).max(128);

const registerSchema = z.object({
  username,
  password,
  role: z.enum(["student", "teacher"]).optional(),
  school: z.string().trim().max(200).optional()
});

const loginSchema = z.object({ username, password });

const lessonInput = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  order: z.number().int().positive()
});

const courseCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(1).max(5000),
  lessons: z.array(lessonInput).max(500).optional()
});

const courseUpdateSchema = courseCreateSchema.partial().refine(v => Object.keys(v).length > 0, {
  message: "At least one field must be supplied"
});

const idParamSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id") });

const lessonSchema = z.object({
  lessonId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid lesson id")
});

const quizSchema = z.object({
  quizId: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  score: z.number().min(0).max(100)
});

const notificationSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  recipientId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid recipient id")
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional()
});

module.exports = {
  registerSchema, loginSchema, courseCreateSchema, courseUpdateSchema,
  idParamSchema, lessonSchema, quizSchema, notificationSchema, paginationSchema
};
