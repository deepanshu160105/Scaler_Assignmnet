import { PrismaClient } from "@prisma/client";

// In serverless environments (Vercel), each invocation may reuse
// or create a new container. Use a singleton to avoid exhausting connections.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
