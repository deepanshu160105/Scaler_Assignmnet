import { PrismaClient } from "@prisma/client";

// Use a singleton pattern to prevent multiple Prisma Client instances
// in development (due to hot-reloading with nodemon)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
