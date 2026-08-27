# Code Review & Improvement Log

## Findings in the original code

| Severity | Gap | Impact | Resolution |
|---|---|---|---|
| Critical | `authController` was imported but absent | Registration/login routes fail | Added controller and standardized controller directory |
| Critical | `src/controller` vs `src/controllers` mismatch | Controller imports fail | Standardized on `controllers/` |
| Critical | `authenticateStudent` was missing | Student routes cannot work | Added generic authentication + role authorization |
| Critical | JWT lacked user id | Controllers expected `req.user._id` | JWT now uses `sub`; middleware loads the current user |
| High | Authorization header was parsed as the whole token | Standard Bearer clients fail | Strict `Bearer <token>` parsing |
| High | Invalid JWT returned 500 | Incorrect API semantics | Invalid/expired tokens return 401 |
| Critical | Hard-coded JWT secret | Secret exposure/token forgery | Validated environment configuration |
| High | Public role selection could create teachers | Privilege escalation | Teacher registration requires a provisioning key |
| High | Course update/delete lacked ownership checks | Teachers could modify other teachers' courses | Enforced teacher ownership |
| High | Documented `GET /courses` was missing | API contract incomplete | Added paginated listing/search |
| High | Enrollments embedded in User | Document growth/contention | Separate `Enrollment` collection |
| High | Notifications embedded in User | Unbounded document growth | Separate `Notification` collection |
| High | Check-then-insert enrollment race | Duplicate enrollment under concurrency | Unique `(student, course)` index |
| Medium | Completed lessons could duplicate | Incorrect progress | `$addToSet` |
| High | Lesson IDs were not checked against the course | Arbitrary progress records | Course lesson validation |
| Medium | Quiz score was not validated | Invalid scores | Zod limits scores to 0–100 |
| High | Validation was inconsistent | Poor data quality/security | Centralized Zod schemas |
| High | No centralized error handling | Inconsistent responses/leakage | Error middleware |
| High | No rate limiting | Brute force/resource exhaustion exposure | Express rate limiter |
| Medium | No security headers | Larger attack surface | Helmet |
| Medium | No structured request logging | Poor incident diagnosis | Pino + pino-http |
| Medium | No readiness endpoint | Traffic can arrive before DB is ready | `/ready` checks MongoDB state |
| Medium | No graceful shutdown | Abrupt connection termination | SIGTERM/SIGINT shutdown |
| Medium | No automated tests | Regression risk | Node built-in test runner |
| Medium | Node 14 baseline was obsolete | Outdated runtime | Node 24 LTS baseline |
| Low | Hard-coded configuration | Unsafe deployments | Environment validation |
| Low | No pagination | Poor scaling | Bounded page/limit |
| Low | No course search | Poor discoverability | MongoDB text search |

## Architecture improvements

The revised project remains a **modular monolith** rather than introducing microservices prematurely.

```text
User 1 ──── * Enrollment * ──── 1 Course
User 1 ──── * Notification
Course 1 ── * Lesson
```

Separating high-growth relationships from `User` makes pagination and indexing practical and avoids a single ever-growing user document.

## Security model

Authentication answers "who are you?" and authorization additionally checks "are you allowed to modify this resource?"

Examples:

- A teacher can create courses.
- A teacher can update/delete only their own courses.
- A student can enroll and manage only their own progress.
- A student can mark only their own notifications as read.
- Teacher registration requires a separate provisioning key.

## 2026 baseline

The project targets Node.js 24 LTS, Express 5, and Mongoose 9. Node.js 24 is the LTS line as of this review; Express 5 is the current major Express line and Mongoose 9 is the current major Mongoose line.

## Remaining production backlog

- Add OpenAPI/Swagger and contract tests.
- Add full integration/e2e tests with disposable MongoDB.
- Add a real admin role and audited teacher provisioning.
- Add short-lived access tokens plus rotated refresh tokens if long browser sessions are required.
- Add OpenTelemetry traces/metrics.
- Add centralized log shipping and alerting.
- Add CI/CD dependency, secret and container scanning.
- Generate and commit a lockfile in the target deployment environment.
- Use managed MongoDB backups and test restores.
- Use Redis-backed rate limiting when horizontally scaling.
- Move email/push notifications to a queue/background worker.
- Add audit logs for sensitive operations.