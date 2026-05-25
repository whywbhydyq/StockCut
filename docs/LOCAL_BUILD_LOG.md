# Local Build Log

Date: 2026-05-25

Environment available in this sandbox:

- Node v22.16.0
- Project engine target: Node 20.x

## Commands run

```bash
npm run typecheck
npm run lint
npm run test
NEXT_TELEMETRY_DISABLED=1 npm run build
```

## Results

- `npm run typecheck`: passed.
- `npm run lint`: passed; static validation passed.
- `npm run test`: passed; 10 test files, 37 tests.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: explicit TypeScript check passed and Next compiled successfully, generated `.next/BUILD_ID`, but the build command did not complete before the sandbox timeout while generating static pages under Node 22.

## Interpretation

The package should be built on Node 20.x as declared in `package.json`. The sandbox could not provide Node 20.x for final production build verification. The build script deliberately runs `tsc --noEmit` before `next build --no-lint` because Next's internal type-validation stage has been unstable in this Node 22 sandbox.
