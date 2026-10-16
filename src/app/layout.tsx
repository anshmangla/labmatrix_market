import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountDeletedBanner from "@/components/AccountDeletedBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://surplus.labmatrixindia.com"),
  title: {
    default: "LabMatrix Marketplace | Pre-Owned Analytical & Pharma Lab Instruments",
    template: "%s | LabMatrix Instrument India",
  },
  description:
    "The dedicated B2B marketplace for buying and selling pre-owned HPLC, GC-MS, UV-Vis, AAS, ICP, DSC-TGA, spare parts, and analytical laboratory machinery in India.",
  keywords: [
    "used HPLC machine India",
    "refurbished GC-MS",
    "UV-Vis spectrophotometer used",
    "AAS atomic absorption spectrometer",
    "ICP-OES ICP-MS surplus India",
    "DSC TGA thermal analyzer pre-owned",
    "analytical lab equipment Delhi NCR",
    "pharma testing machinery marketplace",
    "PerkinElmer pre-owned instruments",
    "PerkinElmer Clarus GC spare parts",
    "PerkinElmer PPC board module",
    "PerkinElmer ICP-OES Avio Optima",
    "Waters Agilent Shimadzu pre-owned",
    "laboratory instrument spare parts India",
    "chromatography power supply surplus",
    "pre-owned analytical instruments marketplace",
    "refurbished laboratory equipment India",
    "buy used pharma instruments",
    "sell surplus lab equipment India",
    "lab instrument AMC calibration relocation",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://surplus.labmatrixindia.com",
    siteName: "LabMatrix Instrument India Pvt Ltd",
    title: "LabMatrix Marketplace | Pre-Owned Analytical & Pharma Lab Instruments",
    description:
      "Buy & sell certified pre-owned HPLC, GC-MS, Spectroscopy, Elemental & Thermal Analysis equipment and replacement spares.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 200,
        alt: "LabMatrix Instrument India Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LabMatrix Marketplace | Pre-Owned Analytical & Pharma Lab Instruments",
    description:
      "Verified B2B marketplace for pre-owned laboratory machinery, spare parts, and analytical testing equipment.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/fav.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://surplus.labmatrixindia.com/#organization",
      name: "LABMATRIX INSTRUMENT INDIA PVT LTD",
      alternateName: "LabMatrix Surplus Analytical Marketplace",
      url: "https://surplus.labmatrixindia.com",
      logo: "https://surplus.labmatrixindia.com/logo.png",
      telephone: "+917303040804",
      email: "sales@labmatrixindia.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "514/5, Mehrauli",
        addressLocality: "New Delhi",
        postalCode: "110030",
        addressCountry: "IN",
      },
      sameAs: [
        "https://www.labmatrixindia.com",
        "https://wa.me/917303040804",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://surplus.labmatrixindia.com/#website",
      url: "https://surplus.labmatrixindia.com",
      name: "LabMatrix Surplus Marketplace",
      publisher: {
        "@id": "https://surplus.labmatrixindia.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://surplus.labmatrixindia.com/listings?query={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <AccountDeletedBanner />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
