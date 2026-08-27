/**
 * Validates req.body / req.params / req.query against Zod schemas and returns
 * a clean 400 with field-level errors instead of letting bad input reach
 * Mongoose (which previously surfaced as an unhandled 500, e.g. an invalid
 * ObjectId in a route param).
 *
 * Usage: router.post("/", validate({ body: createCourseSchema }), handler)
 */
function validate(schemas) {
  return (req, res, next) => {
    for (const key of ["body", "params", "query"]) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        });
      }
      req[key] = result.data;
    }
    return next();
  };
}

module.exports = validate;