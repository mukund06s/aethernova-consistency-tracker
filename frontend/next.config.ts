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
};

export default nextConfig;
