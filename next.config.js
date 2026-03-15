const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.BUNDLE_ANALYZER === 'true',
});

const withRoutes = require('nextjs-routes/config')({
  outDir: 'nextjs',
});

const headers = require('./nextjs/headers');
const redirects = require('./nextjs/redirects');
const rewrites = require('./nextjs/rewrites');

/** @type {import('next').NextConfig} */
const moduleExports = {
  transpilePackages: [
    'react-syntax-highlighter',
  ],
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    );
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.output.environment = {
      ...config.output.environment,
      asyncFunction: true,
    };

    return config;
  },

  // NOTE: all config functions should be static and not depend on any environment variables
  rewrites,
  redirects,

  // On étend les headers existants pour ajouter une CSP correcte
  async headers() {
    // Récupère les headers existants (si définis dans ./nextjs/headers.js)
    const existingHeaders = (await headers()) || [];

    return [
      ...existingHeaders,
      {
        // Applique à toutes les pages
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval souvent requis pour Next.js en dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.vylte-finuka.com",  // ← LIGNE CRITIQUE : ton domaine externe
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Headers de sécurité bonus (optionnels mais recommandés)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  output: 'standalone',
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["@opentelemetry/sdk-node", "@opentelemetry/auto-instrumentations-node"],
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

module.exports = withBundleAnalyzer(withRoutes(moduleExports));
