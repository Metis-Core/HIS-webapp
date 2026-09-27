import type { NextConfig } from 'next';

const apiUpstream = process.env.API_UPSTREAM ?? 'http://156.67.25.40/his';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/his/:path*',
        destination: `${apiUpstream.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
