import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer Sourcing Requirements Board | Wanted Refurbished & Used Lab Equipment",
  description:
    "Explore active buyer requirements for refurbished and pre-owned laboratory instruments and spare parts. Have matching equipment? Submit your quotation directly to verified buyers.",
  alternates: {
    canonical: "/requests",
  },
  keywords: [
    "buy refurbished HPLC",
    "buy refurbished GC-MS",
    "refurbished analytical instruments wanted",
    "laboratory equipment wanted",
    "sell used HPLC to buyers",
    "sell surplus GC-MS",
    "buy requests analytical instruments India",
    "pharma equipment procurement",
    "sell used ICP-OES India",
    "laboratory testing instrument buyers",
    "refurbished lab machinery sourcing",
  ],
  openGraph: {
    title: "Buyer Sourcing Requirements Board | LabMatrix Marketplace",
    description:
      "Active procurement inquiries for refurbished and pre-owned analytical equipment from pharmaceutical facilities across India.",
    url: "/requests",
  },
};

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
