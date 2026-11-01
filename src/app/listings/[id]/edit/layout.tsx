import type { Metadata } from "next";

// Edit form: not useful as a search result.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EditListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
