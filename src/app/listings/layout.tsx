import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Pre-Owned Analytical & Testing Equipment",
  description:
    "Explore verified pre-owned HPLC, GC-MS, UV-Vis, AAS, ICP-OES, and DSC-TGA analytical instruments available across pharmaceutical laboratories in India.",
  alternates: {
    canonical: "/listings",
  },
  openGraph: {
    title: "Browse Pre-Owned Equipment | LabMatrix Marketplace",
    description:
      "Verified analytical instruments catalog from leading global manufacturers across India.",
    url: "/listings",
  },
};

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
