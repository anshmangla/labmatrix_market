import { SignJWT, jwtVerify } from "jose";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "labmatrix_secure_jwt_fallback_key_2026_at_least_32_characters_long";
  return new TextEncoder().encode(secret);
}

export interface MobileTokenPayload {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

/**
 * Signs a JWT token for mobile authentication (valid for 30 days).
 */
export async function signMobileToken(user: {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
}): Promise<string> {
  const key = getSecretKey();
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name || null,
    role: user.role || "USER",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

/**
 * Verifies and decodes a mobile JWT token.
 */
export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key);
    if (!payload || !payload.id || !payload.email) {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      role: (payload.role as string) || "USER",
    };
  } catch {
    return null;
  }
}
