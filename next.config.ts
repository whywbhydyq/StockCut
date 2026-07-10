import type { NextConfig } from 'next';
import { redirectAliases } from './src/data/pages';
import { internalHumanRoutes, internalMachineRoutes } from './src/data/publicPolicy';

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google.com https://*.googlesyndication.com https://*.gstatic.com https://*.doubleclick.net",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://pagead2.googlesyndication.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net",
  'upgrade-insecure-requests'
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return redirectAliases;
  },
  async headers() {
    const noindexHeaders = [...internalHumanRoutes, ...internalMachineRoutes].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }]
    }));
    return [
      ...noindexHeaders,
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicyReportOnly }
        ]
      }
    ];
  },
  experimental: {
    cpus: 1,
    workerThreads: false
  }
};

export default nextConfig;
