import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF6B6B",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vicbuzz.com.au"),
  title: {
    default: "VicBuzz — Family Activities Victoria",
    template: "%s | VicBuzz — Family Activities Victoria",
  },
  description:
    "Discover the best family activities, kids events, playgrounds and free things to do across Victoria. VicBuzz — Victoria's #1 family activity guide.",
  keywords:
    "family activities Victoria, kids activities Melbourne, things to do with kids Victoria, playgrounds Melbourne, free family events Victoria",
  openGraph: {
    title: "VicBuzz — Family Activities Victoria",
    description:
      "Discover the best family activities, kids events, playgrounds and free things to do across Victoria. VicBuzz — Victoria's #1 family activity guide.",
    type: "website",
    url: "https://vicbuzz.com.au",
    siteName: "VicBuzz",
    images: [
      {
        url: "https://vicbuzz.com.au/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VicBuzz — Family Activities Victoria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VicBuzz — Family Activities Victoria",
    description: "Discover the best family activities, kids events, playgrounds and free things to do across Victoria. VicBuzz — Victoria's #1 family activity guide.",
    site: "@VicBuzzAU",
    images: ["https://vicbuzz.com.au/og-image.jpg"],
  },
  alternates: {
    canonical: "https://vicbuzz.com.au",
  },
  verification: {
    google: "9xeA8nlFMAUaXYPW-msSoILNadBgQUTbpulVRi8fNUQ",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
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
          src="https://www.googletagmanager.com/gtag/js?id=G-509738454"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-509738454');
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
