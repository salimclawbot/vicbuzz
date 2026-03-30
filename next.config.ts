import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "*.squarespace-cdn.com" },
      { protocol: "https", hostname: "whatson.melbourne.vic.gov.au" },
    ],
  },
};

export default nextConfig;
