import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // For Next.js 12.2.0 and newer (recommended)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.campustimes.press',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.campustimes.press',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'campustimes.press',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'campustimes.press',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ticktock.campustimes.press',
        port: '',
        pathname: '/**',
      },
    ],

    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
