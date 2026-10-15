import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer Sourcing Requirements Board",
  description:
    "Explore active buyer requirements for laboratory instruments and spare parts. Have matching equipment? Submit your quotation directly to verified buyers.",
  alternates: {
    canonical: "/requests",
  },
  keywords: [
    "laboratory equipment wanted",
    "sell used HPLC to buyers",
    "sell surplus GC-MS",
    "buy requests analytical instruments India",
    "pharma equipment procurement",
    "sell used ICP-OES India",
    "laboratory testing instrument buyers",
  ],
  openGraph: {
    title: "Buyer Sourcing Requirements Board | LabMatrix Marketplace",
    description:
      "Active procurement inquiries for analytical equipment from pharmaceutical facilities across India.",
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
