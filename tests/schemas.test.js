const test = require("node:test");
const assert = require("node:assert/strict");
const { registerSchema, loginSchema, quizSchema } = require("../src/utils/schemas");

test("rejects weak passwords", () => {
  assert.equal(registerSchema.safeParse({ username: "amit", password: "123" }).success, false);
});

test("accepts valid login input", () => {
  assert.equal(loginSchema.safeParse({ username: "amit", password: "password123" }).success, true);
});

test("rejects quiz scores outside 0..100", () => {
  assert.equal(quizSchema.safeParse({ quizId: "quiz-1", score: 101 }).success, false);
});