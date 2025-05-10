// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/payment/:path*',
        destination: 'http://localhost:5003/api/payment/:path*',
      },
    ];
  },
};

module.exports = nextConfig;