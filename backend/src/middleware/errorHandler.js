import { Prisma } from "@prisma/client";

/**
 * Global error handling middleware.
 * Catches Prisma-specific errors and returns clean JSON responses.
 * Never exposes internal error details to the client in production.
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
          message: "A database error occurred. Please try again.",
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

  // Prisma connection/init errors (e.g., PgBouncer prepared statement issues)
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError ||
    err?.message?.includes("prepared statement") ||
    err?.message?.includes("ConnectorError")
  ) {
    return res.status(503).json({
      success: false,
      message: "Database temporarily unavailable. Please try again.",
    });
  }

  // Default server error — never expose raw error messages in production
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : (err.message || "Something went wrong"),
  });
};
