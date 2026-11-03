import type { DefaultSession } from "next-auth";

// The app stores the user's id and role on the session and JWT (see src/auth.ts).
declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    /** Credential stamp: changes when the password changes, ending older sessions */
    sv?: string;
  }
}
