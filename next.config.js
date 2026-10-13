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
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    // MetaMask SDK optionally imports RN async-storage; alias to empty stub (boolean false breaks minify)
    const emptyStub = require('path').join(__dirname, 'webpack-stubs/empty.js');
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@react-native-async-storage/async-storage': emptyStub,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // WalletConnect / Dynamic / ox "tempo" uses dynamic require(); silence + don't fail build
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { module: /node_modules[\\/]ox[\\/]/ },
      { module: /node_modules[\\/]@walletconnect[\\/]/ },
      { module: /node_modules[\\/]@dynamic-labs[\\/]/ },
      { module: /node_modules[\\/]@reown[\\/]/ },
    ];

    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.output.environment = {
      ...config.output.environment,
      asyncFunction: true,
    };

    return config;
  },

  rewrites,
  redirects,

  async headers() {
    const existingHeaders = (await headers()) || [];

    return [
      ...existingHeaders,
      {
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
              "connect-src 'self' https://www.vylte-finuka.com https://*.vylte-finuka.com",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
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

  // Skip TS + ESLint during production Docker builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withBundleAnalyzer(withRoutes(moduleExports));
