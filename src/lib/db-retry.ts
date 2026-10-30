/**
 * Retry policy for database connection failures.
 *
 * Neon suspends an idle database and closes its connections; the first request after
 * that can fail while the database wakes up or because it picked up a connection that
 * was already closed. Retrying once fixes that without the user seeing an error.
 */

// Operations that only read data, so running them twice can never change anything
const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

// Failures where no connection was ever established, so the query never reached the database
const CONNECT_FAILURE_PATTERNS = [
  /timeout exceeded when trying to connect/i,
  /can't reach database server/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /EAI_AGAIN/i,
];

// Failures where an existing connection was dropped (e.g. closed while the database slept)
const DROPPED_CONNECTION_PATTERNS = [
  /connection terminated/i,
  /server has closed the connection/i,
  /ECONNRESET/i,
  /EPIPE/i,
  /Client has encountered a connection error/i,
];

const CONNECT_FAILURE_CODES = new Set(["P1001", "P1002"]);
const DROPPED_CONNECTION_CODES = new Set(["P1017"]);

function describe(error: unknown): { code?: string; text: string } {
  if (!error || typeof error !== "object") return { text: String(error) };
  const e = error as { code?: unknown; message?: unknown; cause?: unknown };
  const cause = e.cause && typeof e.cause === "object" ? (e.cause as { message?: unknown; code?: unknown }) : undefined;
  return {
    code: typeof e.code === "string" ? e.code : undefined,
    text: [e.message, cause?.message, cause?.code].filter((part) => typeof part === "string").join(" | "),
  };
}

export function isConnectFailure(error: unknown): boolean {
  const { code, text } = describe(error);
  return (code !== undefined && CONNECT_FAILURE_CODES.has(code)) || CONNECT_FAILURE_PATTERNS.some((p) => p.test(text));
}

export function isDroppedConnection(error: unknown): boolean {
  const { code, text } = describe(error);
  return (code !== undefined && DROPPED_CONNECTION_CODES.has(code)) || DROPPED_CONNECTION_PATTERNS.some((p) => p.test(text));
}

/**
 * Runs a database operation, retrying once after a connection failure when it is safe:
 * reads are retried after any connection error; writes only when the connection was never
 * established, so a write can never be applied twice.
 */
export async function withConnectionRetry<T>(
  operation: string,
  run: () => Promise<T>,
  delayMs = 300
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const retryable =
      isConnectFailure(error) || (READ_OPERATIONS.has(operation) && isDroppedConnection(error));
    if (!retryable) throw error;

    console.warn(`Retrying database ${operation} after connection error:`, describe(error).text);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return run();
  }
}
