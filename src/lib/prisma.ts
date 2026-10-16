import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function getOrCreatePool(): Pool {
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Max 10 active connections in pool to prevent Neon exhaustion
      idleTimeoutMillis: 30000, // Reclaim idle connections after 30 seconds
      connectionTimeoutMillis: 5000, // Fail fast if database cannot be reached in 5s
    });
  }
  return globalForPrisma.pgPool;
}

function getOrCreatePrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const pool = getOrCreatePool();
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export const prisma = getOrCreatePrisma();
