import type { NextConfig } from "next";

const remoteHosts = (process.env.NEXT_IMAGE_REMOTE_HOSTS ?? "images.unsplash.com")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteHosts.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
