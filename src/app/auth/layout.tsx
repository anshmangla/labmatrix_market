import type { Metadata } from "next";

// Sign-in, sign-up and password reset pages are not search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
