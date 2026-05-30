import type { NextConfig } from 'next';
import { redirectAliases } from './src/data/pages';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return redirectAliases;
  },
  experimental: {
    cpus: 1,
    workerThreads: false
  }
};

export default nextConfig;
