import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Single shared Prisma Client.
 *
 * Prisma 7 requires a driver adapter — we use `@prisma/adapter-pg` (node-postgres)
 * against Neon's POOLED connection (`DATABASE_URL`). Migrations use the DIRECT
 * connection (`DIRECT_URL`) via prisma.config.ts.
 *
 * A `globalThis` cache prevents exhausting connections during Next.js hot-reload
 * in development.
 */
const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
