import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next 15 type validation can hang in the current Node 22 sandbox.
  // The build script runs `tsc --noEmit` first, then lets Next compile with its internal check skipped.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 1,
    workerThreads: false
  }
};

export default nextConfig;
