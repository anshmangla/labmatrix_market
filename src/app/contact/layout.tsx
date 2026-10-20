import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | LabMatrix Instrument India Pvt Ltd",
  description:
    "Connect directly with LabMatrix Instrument India Pvt Ltd in New Delhi. Official sales desk for certified refurbished & pre-owned laboratory machinery, quotations, and equipment inspection.",
  alternates: {
    canonical: "/contact",
  },
  keywords: [
    "contact LabMatrix India",
    "refurbished lab instruments Delhi contact",
    "buy refurbished HPLC quotation",
    "analytical equipment inspection Delhi NCR",
    "laboratory machinery dealers India",
  ],
  openGraph: {
    title: "Contact LabMatrix Instrument India Pvt Ltd",
    description:
      "Get in touch with our laboratory specialists in New Delhi. Direct hotline: +91 7303040804.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
