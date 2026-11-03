import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const ARCHIVED_EMAIL_DOMAIN = "@archived.labmatrixindia.com";

/** Returns the auth signing secret; fails closed instead of using a guessable default. */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

/**
 * Derives a stamp from the user's current password hash. It is embedded in issued tokens
 * so that changing the password (or clearing it on account deletion) invalidates them.
 */
export function credentialStamp(passwordHash: string | null | undefined): string {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(passwordHash || "no-password")
    .digest("hex")
    .slice(0, 32);
}

/** Public profile fields of the signed-in user, loaded with the session check at no extra cost. */
export interface ActiveUserProfile {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  companyName: string | null;
  role: string;
  createdAt: Date;
  hasPassword: boolean;
}

export interface ActiveUserState {
  role: string;
  stamp: string;
  name: string | null;
  profile: ActiveUserProfile;
}

/**
 * Returns the current role and credential stamp for an active account,
 * or null when the user no longer exists or has been deleted (archived).
 */
export async function getActiveUserState(userId: string): Promise<ActiveUserState | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true,
      phoneNumber: true,
      companyName: true,
      createdAt: true,
    },
  });

  if (!user || user.email.endsWith(ARCHIVED_EMAIL_DOMAIN)) {
    return null;
  }

  const { password, ...rest } = user;
  return {
    role: user.role,
    stamp: credentialStamp(password),
    name: user.name,
    profile: { ...rest, hasPassword: Boolean(password) },
  };
}
