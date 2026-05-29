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
      { source: '/guides/saw-kerf-explained', destination: '/how-to-account-for-saw-kerf', permanent: true },
      { source: '/saw-kerf-explained', destination: '/how-to-account-for-saw-kerf', permanent: true },
      { source: '/why-two-24-inch-panels-do-not-fit-on-48-inch-sheet', destination: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', permanent: true },
      { source: '/calculators/mdf-sheet-cut-calculator', destination: '/mdf-sheet-cut-calculator', permanent: true },
      { source: '/calculators/acrylic-sheet-cutting-layout-tool', destination: '/acrylic-sheet-cutting-layout-tool', permanent: true },
      { source: '/calculators/cabinet-cut-list-optimizer', destination: '/cabinet-cut-list-optimizer', permanent: true },
      { source: '/calculators/bookshelf-cut-list-calculator', destination: '/bookshelf-cut-list-calculator', permanent: true },
      { source: '/calculators/drawer-box-cut-list-calculator', destination: '/drawer-box-cut-list-calculator', permanent: true },
      { source: '/calculators/closet-shelf-plywood-calculator', destination: '/closet-shelf-plywood-calculator', permanent: true },
      { source: '/calculators/workbench-plywood-cut-layout', destination: '/workbench-plywood-cut-layout', permanent: true },
      { source: '/calculators/steel-tube-cutting-optimizer', destination: '/steel-tube-cutting-optimizer', permanent: true },
      { source: '/calculators/aluminum-extrusion-cut-list-optimizer', destination: '/aluminum-extrusion-cut-list-optimizer', permanent: true },
      { source: '/calculators/pvc-pipe-cutting-optimizer', destination: '/pvc-pipe-cutting-optimizer', permanent: true },
      { source: '/calculators/lumber-length-cutting-optimizer', destination: '/lumber-length-cutting-optimizer', permanent: true },
      { source: '/calculators/rebar-cutting-optimizer', destination: '/rebar-cutting-optimizer', permanent: true },
      { source: '/calculators/melamine-cut-list-optimizer', destination: '/melamine-cut-list-optimizer', permanent: true },
      { source: '/calculators/saw-kerf-compensation-calculator', destination: '/saw-kerf-compensation-calculator', permanent: true },
      { source: '/calculators/plywood-yield-rate-calculator', destination: '/plywood-yield-rate-calculator', permanent: true },
      { source: '/tools/plywood-yield-calculator', destination: '/plywood-yield-rate-calculator', permanent: true },
      { source: '/guides/how-to-account-for-saw-kerf', destination: '/how-to-account-for-saw-kerf', permanent: true },
      { source: '/guides/how-to-read-a-plywood-cutting-diagram', destination: '/how-to-read-a-plywood-cutting-diagram', permanent: true },
      { source: '/guides/cut-list-optimizer-vs-excel', destination: '/cut-list-optimizer-vs-excel', permanent: true },
      { source: '/guides/cut-list-optimizer-vs-sketchup', destination: '/cut-list-optimizer-vs-sketchup', permanent: true },
      { source: '/guides/guillotine-cut-vs-nesting', destination: '/guillotine-cut-vs-nesting', permanent: true },
      { source: '/guides/plywood-factory-edge-trim', destination: '/plywood-factory-edge-trim', permanent: true },
      { source: '/guides/grain-direction-in-cut-lists', destination: '/grain-direction-in-cut-lists', permanent: true },
      { source: '/guides/edge-banding-in-cut-list', destination: '/edge-banding-in-cut-list', permanent: true },
      { source: '/guides/reduce-plywood-waste', destination: '/reduce-plywood-waste', permanent: true },
      { source: '/guides/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', destination: '/why-two-24-inch-panels-do-not-fit-on-a-48-inch-sheet', permanent: true },
      { source: '/legal/privacy', destination: '/privacy', permanent: true },
      { source: '/legal/terms', destination: '/terms', permanent: true },
      { source: '/legal/disclaimer', destination: '/disclaimer', permanent: true }
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
