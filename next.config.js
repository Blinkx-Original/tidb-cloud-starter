/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false
      };
    }
    return config;
  },
  async rewrites() {
    return [
      { source: '/robots.txt', destination: '/api/robots.txt' },
      { source: '/sitemap.xml', destination: '/api/sitemap.xml' }
    ];
  }
};

module.exports = nextConfig;
