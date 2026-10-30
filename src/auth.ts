import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getActiveUserState } from "@/lib/session-validity";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: cast prisma adapter to any if Prisma 7 client types have minor differences
  adapter: PrismaAdapter(prisma as any),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        // Brute-force protection, matching the mobile login limits
        const ip = getClientIp(request);
        const ipLimit = checkRateLimit(`web_login_ip:${ip}`, 15, 10 * 60 * 1000);
        const emailLimit = checkRateLimit(`web_login_email:${email}`, 8, 10 * 60 * 1000);
        if (!ipLimit.success || !emailLimit.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }

      if (token.id) {
        try {
          // End sessions for deleted accounts or ones issued before the last password change,
          // and always take the role from the database
          const state = await getActiveUserState(token.id as string);
          if (!state || (token.sv && token.sv !== state.stamp)) {
            return null;
          }
          token.role = state.role;
          token.sv = state.stamp;
        } catch (error) {
          // On a transient DB failure keep the existing session rather than signing users out
          console.warn("Could not verify session state:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || session.user.id;
        (session.user as any).role = token.role || "USER";
      }
      return session;
    },
  },
});
