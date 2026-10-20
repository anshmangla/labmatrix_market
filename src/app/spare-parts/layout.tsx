import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refurbished & Replacement Analytical Instrument Spare Parts & Modules",
  description:
    "Source certified refurbished spare parts, OEM replacement modules, deuterium lamps, detector boards, valves, and consumables for HPLC, GC-MS, and analytical testing instruments in India.",
  alternates: {
    canonical: "/spare-parts",
  },
  keywords: [
    "refurbished lab spare parts India",
    "refurbished HPLC spare parts",
    "refurbished GC replacement modules",
    "refurbished detector boards",
    "refurbished chromatography power supply",
    "analytical instrument spare parts India",
    "PerkinElmer GC spare parts",
    "PerkinElmer Clarus PPC module",
    "PerkinElmer PPC board pre-owned",
    "PerkinElmer Clarus power supply",
    "HPLC replacement modules",
    "GC power supply replacement",
    "deuterium lamps HPLC",
    "used chromatography detectors",
    "laboratory equipment consumables surplus",
    "refurbished laboratory components",
  ],
  openGraph: {
    title: "Refurbished & Replacement Analytical Spare Parts | LabMatrix",
    description:
      "Verified refurbished components, OEM consumables, and spare parts for laboratory machinery across India.",
    url: "/spare-parts",
  },
};

export default function SparePartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
