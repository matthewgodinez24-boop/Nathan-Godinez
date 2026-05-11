import type { NextConfig } from "next";

/**
 * Next.js config.
 *
 * Add a remotePattern entry here only when a real off-domain image
 * source is needed. Local images under /public are unrestricted.
 */
const config: NextConfig = {
  images: {
    // Use next/image for any local image; remote sources go here when needed.
    remotePatterns: [],
  },
};

export default config;
