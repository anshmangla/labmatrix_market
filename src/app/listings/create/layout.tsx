import type { Metadata } from "next";

// Listing form: not useful as a search result.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CreateListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
