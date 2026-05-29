# Test Results

Date: 2026-05-25

## Passed

```bash
npm run typecheck
npm run lint
npm run test
```

Vitest result after the second continuation pass:

- 10 test files passed.
- 37 tests passed.

Covered areas include:

- Dimension parsing, including fractional and mixed user inputs.
- Sheet optimization, kerf, stock limits, material matching, rotation, offcut behavior.
- Manual sheet adjustment, overlap blocking, grain-locked rotation blocking, and offcut recomputation after manual edits.
- Linear optimization, kerf, finite stock, reusable offcuts, material matching, and miter/angle planning metadata preservation.
- Offcut inventory conversion back into sheet/linear stock rows.
- Paste import.
- Workbook import.
- Share hash storage.
- Page registry uniqueness.
- Planning DXF export.

## Build status in this sandbox

`NEXT_TELEMETRY_DISABLED=1 npm run build` was run after the second continuation pass.

Observed result under the sandbox Node v22.16.0 runtime:

- Explicit `tsc --noEmit` typecheck passed.
- Next compiled successfully.
- `.next/BUILD_ID` was generated.
- The process did not complete within the sandbox timeout while generating static pages.
- The package declares Node 20.x in `engines`; run the final production build on Node 20.x locally or in Vercel.

## Not fully verified in this sandbox

- Full `next build` completion under the sandbox Node 22 runtime.
- Playwright browser E2E and screenshot tests. Prior attempts in this environment were blocked by browser/page access restrictions.
- Actual browser Worker execution and manual drag interaction. TypeScript/tests cover the code paths, but runtime browser interaction requires local/production browser testing.
