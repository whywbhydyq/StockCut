# StockCut AdSense P0 Fix Report

Formal domain: `https://stockcut.ymirtool.com`

## Fixed in this package

- Added `public/ads.txt` with the required Google publisher record.
- Added the AdSense account meta tag to `src/app/layout.tsx`.
- Added one Auto Ads script in `src/app/layout.tsx`.
- Replaced visible affiliate placeholder wording with a neutral workshop planning note.
- Extended `scripts/validate-site.mjs` to verify ads.txt, AdSense meta, script uniqueness, and removal of affiliate placeholder wording.

## Local verification performed

- `npm install --prefer-offline`: passed; npm reported 2 moderate vulnerabilities.
- `npm run lint`: passed.
- `npm test -- --run`: passed; 7 test files, 28 tests.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: passed; 78 static routes.
- Local `next start` checks:
  - `/ads.txt` returns the required publisher record.
  - `/robots.txt` allows crawling and points to `https://stockcut.ymirtool.com/sitemap.xml`.
  - `/sitemap.xml` uses the formal domain.
  - homepage includes canonical for `https://stockcut.ymirtool.com/`.
  - homepage HTML contains exactly one AdSense account meta and one Auto Ads script reference.
- `npm run e2e`: attempted, but the current container blocks Chromium access to localhost with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Run this in a normal local or CI environment.

## Still external / not fixable inside the package

- Bind `stockcut.ymirtool.com` in Vercel.
- Configure DNS and wait for propagation.
- Verify production URLs after deployment:
  - `/`
  - `/ads.txt`
  - `/robots.txt`
  - `/sitemap.xml`
  - `/privacy`
  - `/terms`
  - `/disclaimer`
  - `/contact`
