import { validationResult } from "express-validator";

/**
 * Middleware that checks express-validator results.
 * If validation errors exist, returns a 400 response with error details.
 * Use after validation chains in route definitions.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};
