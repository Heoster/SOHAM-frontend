const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /\/uploads\/.*/i,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /^https:\/\/image\.pollinations\.ai\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'pollinations-images',
          expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\/_next\/static.+\.js$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static-js',
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'apis',
          expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
    serverComponentsExternalPackages: [
      '@genkit-ai/ai',
      '@genkit-ai/core',
      'genkit',
      'zod-to-json-schema',
      '@opentelemetry/api',
      '@opentelemetry/sdk-trace-base',
      '@opentelemetry/instrumentation',
      '@opentelemetry/resources',
      '@opentelemetry/sdk-node',
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.SKIP_ENV_VALIDATION === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_ENV_VALIDATION === 'true',
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'plus.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'image.pollinations.ai', pathname: '/**' },
    ],
  },
};

// ── Server proxy: forward /server/* → Express backend ─────────────────────────
// In development the Express server runs on :8080
// In production set NEXT_PUBLIC_SERVER_URL to your deployed backend URL
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:8080';

// rewrites() proxies Next.js API calls that need the Express backend
nextConfig.rewrites = async () => [
  // Proxy /server-api/* → Express backend (avoids CORS in dev)
  {
    source: '/server-api/:path*',
    destination: `${SERVER_URL}/api/:path*`,
  },
];

module.exports = withPWA(nextConfig);
