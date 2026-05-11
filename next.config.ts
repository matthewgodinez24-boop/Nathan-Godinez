import type { NextConfig } from "next";

/**
 * Next.js config.
 *
 * - `images.remotePatterns`: extend when off-domain image hosts are added.
 * - `headers()`: baseline security headers applied to every route. CSP is
 *   intentionally NOT set here — the theme-boot inline script in
 *   `app/layout.tsx` needs a hash/nonce strategy that's worth treating as
 *   its own change. The headers below are safe defaults that don't require
 *   per-script accounting.
 */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const config: NextConfig = {
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default config;
