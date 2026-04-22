import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "var(--color-primary)",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vicbuzz.com.au"),
  title: {
    default: "VicBuzz — Family Activities Victoria",
    template: "%s | VicBuzz",
  },
  description:
    "Discover the best family activities, kids events, playgrounds and free things to do across Victoria.",
  keywords:
    "family activities Victoria, kids activities Melbourne, things to do with kids, playgrounds Melbourne",
  openGraph: {
    title: "VicBuzz — Family Activities Victoria",
    description: "Discover the best family activities, kids events, playgrounds and free things to do across Victoria.",
    type: "website",
    url: "https://vicbuzz.com.au",
    siteName: "VicBuzz",
  },
  twitter: {
    card: "summary_large_image",
    title: "VicBuzz — Family Activities Victoria",
    description: "Discover the best family activities, kids events, playgrounds and free things to do across Victoria.",
    site: "@VicBuzzAU",
  },
  alternates: {
    canonical: "https://vicbuzz.com.au",
  },
  verification: {
    google: "9xeA8nlFMAUaXYPW-msSoILNadBgQUTbpulVRi8fNUQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NVHFNY440J"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NVHFNY440J');
          `}
        </Script>
      </head>
      <body className="antialiased bg-[var(--color-bg)]">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
