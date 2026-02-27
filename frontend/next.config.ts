import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure environment variables are properly passed
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  },
  // Image optimization config
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://aethernova-consistency-tracker.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
