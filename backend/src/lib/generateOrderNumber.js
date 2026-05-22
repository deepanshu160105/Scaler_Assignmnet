import crypto from "crypto";

/**
 * Generates a unique, human-readable order number.
 * Format: ORD-<timestamp>-<random>
 * Example: ORD-1716300000-A3F2
 */
export function generateOrderNumber() {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${random}`;
}
