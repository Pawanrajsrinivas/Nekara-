import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.106", "localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/images/brand/tab_logo.png",
      },
    ];
  },
};

export default nextConfig;
