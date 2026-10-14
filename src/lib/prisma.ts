import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: 10, // Max 10 active connections in pool to prevent Neon exhaustion
      idleTimeoutMillis: 30000, // Reclaim idle connections after 30 seconds
      connectionTimeoutMillis: 5000, // Fail fast if database cannot be reached in 5s
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
