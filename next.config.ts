import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/tools/sheet-cutting-optimizer', destination: '/sheet-cutting-optimizer', permanent: true },
      { source: '/tools/linear-cutting-optimizer', destination: '/linear-cutting-optimizer', permanent: true },
      { source: '/tools/saw-kerf-calculator', destination: '/saw-kerf-calculator', permanent: true },
      { source: '/calculators/4x8-plywood-cut-list-optimizer', destination: '/4x8-plywood-cut-list-optimizer', permanent: true },
      { source: '/calculators/plywood-cutting-layout-calculator', destination: '/plywood-cutting-layout-calculator', permanent: true },
      { source: '/guides/saw-kerf-explained', destination: '/guides/how-to-account-for-saw-kerf', permanent: true },
      { source: '/why-two-24-inch-panels-do-not-fit-on-48-inch-sheet', destination: '/guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', permanent: true }
    ];
  },
  // Next 15 type validation can hang in the current Node 22 sandbox.
  // The build script runs `tsc --noEmit` first, then lets Next compile with its internal check skipped.
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 1,
    workerThreads: false
  }
};

export default nextConfig;
