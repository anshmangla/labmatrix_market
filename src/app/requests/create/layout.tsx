import type { Metadata } from "next";

// Request form: not useful as a search result.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CreateRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
