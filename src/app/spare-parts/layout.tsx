import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytical Instrument Spare Parts & Consumables",
  description:
    "Source verified spare parts, replacement modules, deuterium lamps, detectors, valves, and consumables for HPLC, GC-MS, and analytical testing instruments in India.",
  alternates: {
    canonical: "/spare-parts",
  },
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
