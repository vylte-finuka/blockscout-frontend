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
  reactStrictMode: false,
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

  rewrites,
  redirects,

  // ──────────────────────────────────────────────────────────────
  // AJOUT : Gestion complète de la CSP pour autoriser www.vylte-finuka.com
  // ──────────────────────────────────────────────────────────────
  async headers() {
    // Récupère les headers déjà définis dans ./nextjs/headers.js (si existants)
    const existingHeaders = (await headers()) || [];

    return [
      ...existingHeaders,
      {
        // Applique à TOUTES les pages
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              // Ligne critique : autorise les fetch / websocket / etc vers ton domaine
              "connect-src 'self' https://www.vylte-finuka.com https://*.vylte-finuka.com",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // Optionnel : upgrade HTTP → HTTPS
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Headers de sécurité recommandés (bonus)
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
