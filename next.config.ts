import type { NextConfig } from 'next';
import { serviceLandings } from './lib/service-landings';

const config: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  poweredByHeader: false,
  async redirects() {
    return serviceLandings.map((page) => ({
      source: `/${page.slug}.html`,
      destination: `/${page.slug}`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default config;