import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    metadataBase: new URL(SITE_URL),
    title: `${settings.businessName} | Book Your Cut`,
    description: settings.barber.bioShort,
    applicationName: settings.businessName,
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.businessName,
      description: settings.tagline,
      type: "website",
      url: SITE_URL,
      locale: "en_ZA",
      siteName: settings.businessName,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.businessName,
      description: settings.tagline,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
