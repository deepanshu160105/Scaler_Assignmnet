import { Prisma } from "@prisma/client";

/**
 * Global error handling middleware.
 * Catches Prisma-specific errors and returns clean JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          success: false,
          message: `Duplicate value for field: ${err.meta?.target?.join(", ")}`,
        });
      case "P2025":
        return res.status(404).json({
          success: false,
          message: "Record not found.",
        });
      case "P2003":
        return res.status(400).json({
          success: false,
          message: "Invalid reference. Related record does not exist.",
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Database error: ${err.message}`,
        });
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided.",
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
