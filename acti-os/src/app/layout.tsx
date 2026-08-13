import type { Metadata } from "next";
import { Poppins, Source_Sans_3 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_TITLE,
  SITE_FULL_NAME,
  SITE_URL,
} from "@/lib/seo";
import { INSTITUTION } from "@/lib/types";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_OG_TITLE,
    template: "%s | ACTI",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "ACTI OS",
  authors: [{ name: INSTITUTION.name }],
  creator: INSTITUTION.founder,
  publisher: INSTITUTION.name,
  keywords: [
    "ACTI",
    "Amana College of Technology and Innovation",
    "Oron",
    "Akwa Ibom",
    "National Diploma",
    "engineering",
    "admissions",
    "technical education",
    "vocational training",
    "ACTI OS",
  ],
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_FULL_NAME,
    title: DEFAULT_OG_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_OG_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
