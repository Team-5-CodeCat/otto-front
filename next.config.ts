import type { NextConfig } from 'next';

const backEndPort = process.env.BACKEND_PORT || 4000;
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `http://localhost:${backEndPort}/api/v1/:path*`,
      },
      {
        source: '/docs/:path*', // /docs 접속하면
        destination: `http://localhost:${backEndPort}/docs/:path*`,
      },
    ];
  },
};

export default nextConfig;
