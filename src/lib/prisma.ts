import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { withConnectionRetry } from "@/lib/db-retry";

function getOrCreatePool(): Pool {
  if (!globalForPrisma.pgPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Small per-instance pool; Neon's pooler endpoint shares connections across instances
      idleTimeoutMillis: 10000, // Close idle connections soon so fewer go stale while Neon/Vercel sleep
      connectionTimeoutMillis: 10000, // Give a suspended Neon database time to wake (fits the app's 15s request timeout)
      // A query on a connection that died silently during idle would otherwise wait forever.
      // After 6s it errors, the pool discards that connection, and reads retry on a fresh one.
      query_timeout: 6000,
      keepAlive: true, // Detect dead TCP connections sooner
    });
    // A connection closed while idle (e.g. Neon suspended) must never crash the process;
    // the pool discards it and opens a fresh one on the next query.
    pool.on("error", (err) => {
      console.warn("Postgres idle connection error (connection will be replaced):", err.message);
    });
    globalForPrisma.pgPool = pool;
  }
  return globalForPrisma.pgPool;
}

function createPrismaClient() {
  const adapter = new PrismaPg(getOrCreatePool());
  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        return withConnectionRetry(operation, () => query(args));
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma?: ExtendedPrismaClient;
  pgPool?: Pool;
};

function getOrCreatePrisma(): ExtendedPrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = getOrCreatePrisma();
