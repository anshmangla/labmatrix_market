import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refurbished & Pre-Owned Analytical & Testing Equipment",
  description:
    "Explore verified refurbished and pre-owned HPLC, GC-MS, UV-Vis, AAS, ICP-OES, and DSC-TGA analytical instruments available across pharmaceutical & chemical laboratories in India.",
  alternates: {
    canonical: "/listings",
  },
  keywords: [
    "refurbished analytical instruments India",
    "refurbished HPLC machines",
    "refurbished GC-MS systems India",
    "refurbished ICP-OES spectrometer",
    "refurbished AAS spectrometer",
    "refurbished UV-Vis spectrophotometer",
    "DSC-TGA thermal analyzers refurbished",
    "pre-owned HPLC machines",
    "used analytical laboratory instruments Delhi",
    "buy refurbished pharma testing equipment",
    "refurbished Agilent Waters Shimadzu PerkinElmer",
    "analytical equipment marketplace India",
    "certified refurbished lab machinery",
  ],
  openGraph: {
    title: "Refurbished & Pre-Owned Equipment | LabMatrix Marketplace",
    description:
      "Verified refurbished and pre-owned analytical instruments catalog from leading global manufacturers across India.",
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
