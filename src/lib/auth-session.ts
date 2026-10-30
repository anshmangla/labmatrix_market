import { auth } from "@/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { getActiveUserState } from "@/lib/session-validity";

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
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
  if (request) {
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");

    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const payload = await verifyMobileToken(token);
        if (payload?.id) {
          let role = payload.role || "USER";
          try {
            // Reject tokens for deleted accounts or issued before the last password change
            const state = await getActiveUserState(payload.id);
            if (!state || (payload.sv && payload.sv !== state.stamp)) {
              return null;
            }
            role = state.role;
          } catch (error) {
            // On a transient DB failure keep the signed token's claims rather than logging users out
            console.warn("Could not verify mobile token state:", error);
          }

          return {
            user: {
              id: payload.id,
              email: payload.email,
              name: payload.name || null,
              role,
            },
          };
        }
      }
    }
  }

  // 2. Fall back to NextAuth session cookies (Web client)
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
