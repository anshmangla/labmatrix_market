import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytical Instrument Spare Parts & Consumables",
  description:
    "Source verified spare parts, replacement modules, deuterium lamps, detectors, valves, and consumables for HPLC, GC-MS, and analytical testing instruments in India.",
  alternates: {
    canonical: "/spare-parts",
  },
  keywords: [
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
  ],
  openGraph: {
    title: "Analytical Instrument Spare Parts & Consumables | LabMatrix",
    description:
      "Verified replacement components, OEM consumables, and spare parts for laboratory machinery across India.",
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
