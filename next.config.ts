import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `http://localhost:4000/api/v1/:path*`,
      },
      {
        source: '/docs/:path*', // /docs 접속하면
        destination: `http://localhost:4000/docs/:path*`,
      },
    ];
  },
};

export default nextConfig;
