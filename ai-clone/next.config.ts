import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {}, // Use an empty object instead of `true`
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/, // Match SVG files
      use: ["@svgr/webpack"], // Use SVGR to load SVGs as React components
    });
    return config;
  },
};

export default nextConfig;
