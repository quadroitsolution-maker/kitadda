import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "fulltimestore.in" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  experimental: {
    serverMinification: false,
  },
};

export default nextConfig;
