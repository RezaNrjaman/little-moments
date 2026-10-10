import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // This scrapbook is entirely session protected: pages opt out of instant
  // prerendering with `export const instant = false`, so skip the automatic
  // instant-navigation validation (Next.js 16) to keep builds/dev logs clean.
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
