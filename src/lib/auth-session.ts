import { auth } from "@/auth";
import { verifyMobileToken, type MobileTokenPayload } from "@/lib/mobile-auth";
import {
  getActiveUserState,
  type ActiveUserProfile,
  type ActiveUserState,
} from "@/lib/session-validity";

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
  /**
   * The user's current database record, present when this request already loaded it to
   * verify the session (mobile bearer tokens). Routes can use it instead of querying again.
   * Its presence also means `user.role` was read from the database on this request.
   */
  profile?: ActiveUserProfile;
}

/** Returns the verified payload of a mobile `Authorization: Bearer` token, if one was sent. */
async function getBearerPayload(request?: Request): Promise<MobileTokenPayload | null> {
  if (!request) return null;
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const payload = await verifyMobileToken(token);
  return payload?.id ? payload : null;
}

/**
 * Turns a verified token plus the result of the account-state lookup into a session.
 * Returns null for deleted accounts or tokens issued before the last password change.
 */
function sessionFromBearer(
  payload: MobileTokenPayload,
  state: PromiseSettledResult<ActiveUserState | null>
): AuthSession | null {
  if (state.status === "rejected") {
    // On a transient DB failure keep the signed token's claims rather than logging users out
    console.warn("Could not verify mobile token state:", state.reason);
    return {
      user: { id: payload.id, email: payload.email, name: payload.name || null, role: payload.role || "USER" },
    };
  }
  const active = state.value;
  if (!active || (payload.sv && payload.sv !== active.stamp)) {
    return null;
  }
  return {
    user: { id: payload.id, email: payload.email, name: payload.name || null, role: active.role },
    profile: active.profile,
  };
}

async function getCookieSession(): Promise<AuthSession | null> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email || null,
          name: session.user.name || null,
          role: (session.user as any).role || "USER",
        },
      };
    }
  } catch {
    // If NextAuth fails or runs outside request scope, treat as null
  }
  return null;
}

/**
 * Resolves the authenticated session from either:
 * 1. Mobile Authorization: Bearer <JWT_TOKEN>
 * 2. Web NextAuth Cookie Session
 *
 * This allows both the web frontend and mobile client to share the exact same API endpoints seamlessly.
 */
export async function getAuthSession(request?: Request): Promise<AuthSession | null> {
  // 1. Check for Bearer token in the Authorization header (Mobile client)
  const payload = await getBearerPayload(request);
  if (payload) {
    const [state] = await Promise.allSettled([getActiveUserState(payload.id)]);
    return sessionFromBearer(payload, state);
  }

  // 2. Fall back to NextAuth session cookies (Web client)
  return getCookieSession();
}

/**
 * For read-only handlers whose queries only need the user's id. With a mobile bearer token
 * (signature already verified, no DB needed) the account-state check and `load` run
 * concurrently instead of one after the other, saving a database round trip. The loaded data
 * is returned only when the check passes, so nothing is exposed for deleted accounts or
 * revoked tokens. `load` must not change any data.
 *
 * Returns null when the request is not authenticated.
 */
export async function getAuthSessionAndRead<T>(
  request: Request,
  load: (userId: string) => Promise<T>
): Promise<{ session: AuthSession; data: T } | null> {
  const payload = await getBearerPayload(request);
  if (payload) {
    const [state, data] = await Promise.allSettled([getActiveUserState(payload.id), load(payload.id)]);
    const session = sessionFromBearer(payload, state);
    if (!session) return null;
    if (data.status === "rejected") throw data.reason;
    return { session, data: data.value };
  }

  const session = await getCookieSession();
  if (!session) return null;
  return { session, data: await load(session.user.id) };
}
