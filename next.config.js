/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Permitimos imágenes remotas (Cloudflare Images/otros CDNs)
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  webpack: (config, { isServer }) => {
    // Evita polyfills innecesarios en el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },

  // 🔐 Headers de seguridad globales
  async headers() {
    // Ajusta dominios si agregas nuevos orígenes externos
    const csp = [
      // Política base
      "default-src 'self'",
      // Imágenes: propias, data URI (LQIP), y Cloudflare Images
      "img-src 'self' data: https://imagedelivery.net",
      // Scripts: propios; (mantenemos 'unsafe-inline' por Next/inline data)
      "script-src 'self' 'unsafe-inline'",
      // Conexiones XHR/fetch: Algolia + Vercel Analytics
      "connect-src 'self' https://*.algolia.net https://*.algolianet.com https://vitals.vercel-insights.com",
      // Estilos: propios + inline (Tailwind/Next baseline)
      "style-src 'self' 'unsafe-inline'",
      // Fuentes
      "font-src 'self' data:",
      // Iframes deshabilitados (más estricto que X-Frame-Options)
      "frame-ancestors 'none'",
      // Opcional: media/objects
      "media-src 'self'",
      "object-src 'none'",
    ].join('; ');

    return [
      {
        // Aplica a todas las rutas
        source: '/(.*)',
        headers: [
          // Fuerza HTTPS (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // CSP (light) — ajusta si agregas nuevos orígenes
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          // Anti clickjacking (complementa a frame-ancestors)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Evita MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referer razonable
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Bloquea permisos del navegador que no usas
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ❌ Sin rewrites: robots y sitemap ya son páginas (no APIs)
  // async rewrites() { return []; },
};

module.exports = nextConfig;
