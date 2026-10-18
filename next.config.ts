import type { NextConfig } from 'next';

const isDevelopment = process.env.ENVIRONMENT === 'development';
const apiUpstream = process.env.API_UPSTREAM ?? 'http://156.67.25.40/his';

const nextConfig: NextConfig = {
  // Local: browser calls the API directly. Deployed: same-origin /his proxied via rewrite.
  env: {
    NEXT_PUBLIC_API_URL: isDevelopment ? 'http://localhost:8000' : '/his',
  },
  async rewrites() {
    if (isDevelopment) return [];
    return [
      {
        source: '/his/:path*',
        destination: `${apiUpstream.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
