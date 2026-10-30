import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const ARCHIVED_EMAIL_DOMAIN = "@archived.labmatrixindia.com";

/**
 * Derives a stamp from the user's current password hash. It is embedded in issued tokens
 * so that changing the password (or clearing it on account deletion) invalidates them.
 */
export function credentialStamp(passwordHash: string | null | undefined): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
  return crypto
    .createHmac("sha256", secret)
    .update(passwordHash || "no-password")
    .digest("hex")
    .slice(0, 32);
}

export interface ActiveUserState {
  role: string;
  stamp: string;
}

/**
 * Returns the current role and credential stamp for an active account,
 * or null when the user no longer exists or has been deleted (archived).
 */
export async function getActiveUserState(userId: string): Promise<ActiveUserState | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, password: true, role: true },
  });

  if (!user || user.email.endsWith(ARCHIVED_EMAIL_DOMAIN)) {
    return null;
  }

  return { role: user.role, stamp: credentialStamp(user.password) };
}
