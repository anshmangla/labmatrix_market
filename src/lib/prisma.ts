import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { withConnectionRetry } from "@/lib/db-retry";

function getOrCreatePool(): Pool {
  if (!globalForPrisma.pgPool) {
    // Timeouts are sized so one failed attempt plus one retry (src/lib/db-retry.ts) stays well under
    // the mobile app's 15s request timeout: ~5s + 0.3s + ~5s instead of hanging for 20s+.
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Small per-instance pool; Neon's pooler endpoint shares connections across instances
      // Close idle connections soon. On Vercel, attachDatabasePool (below) keeps the instance alive
      // this long after the last query so they are actually closed before the instance is paused.
      idleTimeoutMillis: 5000,
      // A suspended Neon database usually wakes in 1-2s; a connection attempt that hangs longer
      // is abandoned and retried on a fresh connection.
      connectionTimeoutMillis: 5000,
      // A query on a connection that died silently would otherwise wait forever.
      // After 5s it errors, the pool discards that connection, and reads retry on a fresh one.
      query_timeout: 5000,
      keepAlive: true, // Detect dead TCP connections sooner...
      keepAliveInitialDelayMillis: 10000, // ...starting after 10s idle instead of the OS default (~2h)
    });
    // Fluid compute pauses instances between requests, and paused timers don't run, so idle
    // connections would otherwise stay open, die while paused, and be reused later
    // ("write ETIMEDOUT"). This keeps the instance alive until the pool has closed them.
    attachDatabasePool(pool);
    // A connection closed while idle (e.g. Neon suspended) must never crash the process;
    // the pool discards it and opens a fresh one on the next query.
    pool.on("error", (err) => {
      console.warn("Postgres idle connection error (connection will be replaced):", err.message);
    });
    globalForPrisma.pgPool = pool;
  }
  return globalForPrisma.pgPool;
}

// Set DB_QUERY_LOG=1 to log every query with its duration (for profiling; off in production)
const LOG_QUERIES = process.env.DB_QUERY_LOG === "1";

function createPrismaClient() {
  const adapter = new PrismaPg(getOrCreatePool());
  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        if (!LOG_QUERIES) {
          return withConnectionRetry(operation, () => query(args));
        }
        const start = performance.now();
        try {
          return await withConnectionRetry(operation, () => query(args));
        } finally {
          console.log(`[db] ${model ?? "raw"}.${operation} ${(performance.now() - start).toFixed(1)}ms`);
        }
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
