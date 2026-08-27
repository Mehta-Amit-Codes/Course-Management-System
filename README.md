# Course Management System — 2026 Edition

A production-oriented Node.js + MongoDB REST API for teachers and students.

## What was fixed

The original project had several correctness and production-readiness gaps:

- `src/routes/user.js` imported `authController`, but that controller did not exist.
- The project used `src/controller` while routes referenced `src/controllers`.
- Authentication only implemented teacher authorization; `authenticateStudent` was missing.
- The JWT contained no user id, while controllers expected `req.user._id`.
- The middleware accepted the whole `Authorization` header as the token instead of requiring `Bearer <token>`.
- Invalid/expired JWTs returned HTTP 500 instead of HTTP 401.
- `Config.js` contained a hard-coded MongoDB URI and JWT secret.
- Public registration could assign the `teacher` role, creating a privilege-escalation path.
- Course update/delete did not verify that the teacher owned the course.
- The documented `GET /api/courses` endpoint was missing.
- Request validation was inconsistent and mostly manual.
- Embedded enrollments and notifications in the User document would grow without a good upper bound.
- Enrollment had a race condition between “check exists” and `$push`.
- Completed lessons could be duplicated.
- Lesson IDs were never checked against the course.
- Quiz scores were not range validated.
- Errors were returned inconsistently and internal errors leaked through console logging.
- No rate limiting, security headers, structured request logging, health/readiness checks, or graceful shutdown existed.
- There were no automated tests.

## 2026 technology baseline

The implementation targets Node.js 24 LTS rather than the old Node 14 baseline. Node.js 24 is in LTS and is supported through April 2028. Express 5 is used for the HTTP layer, and Mongoose 9 is the current major Mongoose line. See the official release/support references linked below.

- Node.js 24 LTS: https://nodejs.org/en/download/
- Express 5 migration guide: https://expressjs.com/en/guide/migrating-5/
- Mongoose version support: https://mongoosejs.com/docs/version-support.html
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/

## Architecture

```text
app.js
 ├── config/
 ├── middleware/
 │    ├── auth.js
 │    ├── validate.js
 │    ├── security.js
 │    └── errorHandler.js
 ├── routes/
 ├── controllers/
 ├── models/
 │    ├── User
 │    ├── Course
 │    ├── Enrollment
 │    └── Notification
 └── utils/
```

The important data-model improvement is that enrollments and notifications are separate collections. This avoids continuously growing User documents and allows independent indexes, pagination, and lifecycle management.

## Setup

### Requirements

- Node.js 24 LTS
- MongoDB 7/8 or a compatible MongoDB deployment
- npm

### Install

```bash
cp .env.example .env
npm install
```

Set a strong `JWT_SECRET` in `.env` (32+ characters).

### Run

```bash
npm run dev
```

Production:

```bash
npm start
```

Tests:

```bash
npm test
```

Syntax check:

```bash
npm run check
```

## API

The new canonical prefix is `/api/v1`. `/api` remains mounted as a compatibility alias.

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
```

Student registration is public. Teacher registration requires `X-Teacher-Registration-Key` matching `TEACHER_REGISTRATION_KEY`.

### Courses

```text
GET    /api/v1/courses?page=1&limit=20&search=node
POST   /api/v1/courses                 Teacher
PUT    /api/v1/courses/:id             Owning teacher
DELETE /api/v1/courses/:id             Owning teacher
```

Course creation/update can include:

```json
{
  "title": "Node.js Fundamentals",
  "description": "Backend fundamentals",
  "lessons": [
    { "title": "Async JavaScript", "description": "Promises and async/await", "order": 1 }
  ]
}
```

### Enrollment

```text
GET  /api/v1/enrollment/courses
POST /api/v1/enrollment/courses/:id
```

A unique compound index guarantees one enrollment per student/course even under concurrent requests.

### Progress

```text
GET  /api/v1/progress/courses/:id
POST /api/v1/progress/courses/:id/lesson
POST /api/v1/progress/courses/:id/quiz
```

Quiz scores are constrained to 0–100. Completed lessons use `$addToSet` to prevent duplicates.

### Notifications

```text
GET   /api/v1/notifications
POST  /api/v1/notifications                 Teacher
PATCH /api/v1/notifications/:id             Student recipient only
```

Notifications are paginated and indexed by recipient and creation time.

## Security improvements

- Environment-based secrets.
- Password hashing with bcrypt.
- Bearer-token parsing and JWT verification.
- User lookup after JWT verification so deleted users cannot keep accessing the API.
- Explicit role-based authorization.
- Teacher registration protection.
- Course ownership authorization.
- Object-level notification authorization.
- Zod request validation.
- Helmet security headers.
- CORS configuration.
- Global rate limiting.
- Request body size limit.
- Generic authentication errors to reduce account enumeration.
- Centralized error handling.
- Structured Pino request logging.
- Disabled `X-Powered-By`.
- Health and readiness endpoints.

These changes directly address API risks such as broken authentication, broken object/function authorization, unrestricted resource consumption, security misconfiguration, and insufficient logging.

## Legacy data migration

The original schema stored `enrolledCourses` and `notifications` inside the `users` collection. A one-time migration script is included:

```bash
node scripts/migrate-legacy.js
```

Back up the database first. The script copies data into the new collections and intentionally does not delete the legacy fields. Verify the migrated records before removing old fields.

Because the original notification model did not store a sender, migrated notifications use the recipient as a neutral placeholder. For production data, review these migrated records before treating their sender information as authoritative.

## Recommended next production steps

1. Use a managed MongoDB deployment with backups and monitoring.
2. Put the API behind a reverse proxy/API gateway.
3. Use a secrets manager instead of `.env` in production.
4. Add refresh-token/session rotation if long-lived browser sessions are required.
5. Add OpenAPI/Swagger and generated client contracts.
6. Add integration tests against a disposable MongoDB instance.
7. Add CI with dependency auditing, tests, linting, and container scanning.
8. Add distributed tracing/metrics with OpenTelemetry.
9. Add Redis-backed rate limiting when running multiple API instances.
10. Add an admin role and audited teacher provisioning instead of relying on the teacher registration key.