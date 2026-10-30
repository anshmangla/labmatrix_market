import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Each verification attempt shortens the code's remaining lifetime, so a 10-minute
// code allows ~5 guesses in total, enforced in the database across all server instances.
const ATTEMPT_COST_MS = 2 * 60 * 1000;

// Resending a code starts a fresh guess budget, so the number of codes per email is
// capped per 24 hours. Sends are logged as VerificationToken rows under this prefix.
const DAILY_SEND_LIMIT = 10;
const SEND_LOG_PREFIX = "otp-send-log:";
const SEND_LOG_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Records a code dispatch for the key (e.g. `reset:user@example.com`) and returns false
 * once the 24-hour cap is reached. Enforced in the database across all server instances.
 */
export async function recordOtpSend(key: string): Promise<boolean> {
  const now = new Date();
  await prisma.verificationToken.deleteMany({
    where: { identifier: { startsWith: SEND_LOG_PREFIX }, expires: { lt: now } },
  });

  const identifier = `${SEND_LOG_PREFIX}${key}`;
  const sentToday = await prisma.verificationToken.count({
    where: { identifier, expires: { gt: now } },
  });
  if (sentToday >= DAILY_SEND_LIMIT) {
    return false;
  }

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: crypto.randomUUID(),
      expires: new Date(now.getTime() + SEND_LOG_TTL_MS),
    },
  });
  return true;
}

export type OtpCheckResult = "valid" | "invalid" | "expired" | "missing" | "retry";

/**
 * Verifies a 6-digit code stored (hashed) in VerificationToken for the identifier.
 * Does not delete the token on success; callers do that once the action completes.
 */
export async function checkOtp(identifier: string, code: string): Promise<OtpCheckResult> {
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (!tokenRecord) {
    return "missing";
  }

  if (tokenRecord.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return "expired";
  }

  // Atomically consume one attempt; a concurrent attempt that already changed the
  // expiry makes this update match nothing, so parallel guesses cannot bypass the budget.
  const consumed = await prisma.verificationToken.updateMany({
    where: {
      identifier,
      token: tokenRecord.token,
      expires: tokenRecord.expires,
    },
    data: {
      expires: new Date(tokenRecord.expires.getTime() - ATTEMPT_COST_MS),
    },
  });

  if (consumed.count === 0) {
    return "retry";
  }

  const hashedInput = crypto.createHash("sha256").update(code).digest("hex");
  return hashedInput === tokenRecord.token ? "valid" : "invalid";
}
