import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Each verification attempt shortens the code's remaining lifetime, so a 10-minute
// code allows ~5 guesses in total, enforced in the database across all server instances.
const ATTEMPT_COST_MS = 2 * 60 * 1000;

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
