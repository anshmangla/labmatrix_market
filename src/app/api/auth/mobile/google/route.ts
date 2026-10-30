import { NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { corsHeaders, handleCorsOptions } from "@/lib/cors";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

interface GoogleIdentity {
  sub: string;
  email: string;
  name: string | null;
  picture: string | null;
}

/** Verifies a Google ID token (native sign-in) issued for this app's OAuth client. */
async function verifyIdToken(idToken: string, clientId: string): Promise<GoogleIdentity | null> {
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: GOOGLE_ISSUERS,
      audience: clientId,
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    if (payload.email_verified !== true && payload.email_verified !== "true") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      picture: typeof payload.picture === "string" ? payload.picture : null,
    };
  } catch {
    return null;
  }
}

/** Verifies a Google access token (browser sign-in fallback) issued for this app's OAuth client. */
async function verifyAccessToken(accessToken: string, clientId: string): Promise<GoogleIdentity | null> {
  try {
    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );
    if (!infoRes.ok) return null;
    const info = await infoRes.json();
    // The token must have been issued to our client, not to some other app
    if (info.aud !== clientId && info.azp !== clientId) return null;
    if (typeof info.sub !== "string" || typeof info.email !== "string") return null;
    if (info.email_verified !== true && info.email_verified !== "true") return null;

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = profileRes.ok ? await profileRes.json() : {};
    return {
      sub: info.sub,
      email: info.email,
      name: typeof profile.name === "string" ? profile.name : null,
      picture: typeof profile.picture === "string" ? profile.picture : null,
    };
  } catch {
    return null;
  }
}

/**
 * Finds or creates the user for a Google identity exactly like the website's NextAuth
 * Google provider does: match the linked Google account first, then link an existing
 * user with the same email (allowDangerousEmailAccountLinking), otherwise create one.
 */
async function findOrCreateGoogleUser(identity: GoogleIdentity) {
  const linked = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: identity.sub } },
    select: { user: true },
  });
  if (linked?.user) return linked.user;

  const email = identity.email.toLowerCase().trim();
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: identity.name,
        email,
        image: identity.picture,
        emailVerified: null,
      },
    });
  }

  try {
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oidc",
        provider: "google",
        providerAccountId: identity.sub,
      },
    });
  } catch {
    // A concurrent sign-in already linked this Google account; use whichever user owns it
    const existing = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: identity.sub } },
      select: { user: true },
    });
    if (existing?.user) return existing.user;
    throw new Error("Failed to link Google account");
  }

  return user;
}

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`mobile_google_ip:${ip}`, 15, 10 * 60 * 1000);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please try again in a few minutes." },
        {
          status: 429,
          headers: { ...corsHeaders(), "Retry-After": ipLimit.resetSeconds.toString() },
        }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Google sign-in is not configured on this server." },
        { status: 503, headers: corsHeaders() }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { idToken, accessToken } = body;

    let identity: GoogleIdentity | null = null;
    if (typeof idToken === "string" && idToken) {
      identity = await verifyIdToken(idToken, clientId);
    } else if (typeof accessToken === "string" && accessToken) {
      identity = await verifyAccessToken(accessToken, clientId);
    }

    if (!identity) {
      return NextResponse.json(
        { error: "Google sign-in could not be verified. Please try again." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await findOrCreateGoogleUser(identity);

    if (user.email.endsWith("@archived.labmatrixindia.com")) {
      return NextResponse.json(
        { error: "This account has been deactivated." },
        { status: 403, headers: corsHeaders() }
      );
    }

    const token = await signMobileToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password: user.password,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          companyName: user.companyName,
          role: user.role,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Mobile Google login error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
