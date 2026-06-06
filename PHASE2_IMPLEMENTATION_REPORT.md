# StockCut Phase 2 Security and Stability Fixes

## Scope

Implemented the second-phase fixes identified in the prior audit:

- Input scale limits for quantities and expanded optimizer jobs.
- CSV, paste, workbook, JSON, localStorage, and share-link validation.
- CSV formula injection protection.
- Runtime schema validation for StockCut project imports.
- Safer Service Worker caching.
- Dynamic loading for heavy import/export modules on tool pages.
- Dependency audit cleanup.

## Code changes

### Input and optimizer limits

- Added `src/core/validation/limits.ts`.
- Updated `src/core/validation/quantity.ts` to enforce bounded quantities.
- Updated sheet and linear optimizers to reject jobs that expand beyond 20,000 parts/cuts instead of expanding unbounded arrays.

### Runtime project validation

- Added `src/core/validation/projectSchema.ts`.
- JSON imports now validate sheet and linear project structure before state mutation.
- Share-link reads and localStorage restores now use the same validators.
- Oversized share hashes and oversized localStorage payloads are rejected.

### Import hardening

- Paste imports now enforce maximum text length, row count, column count, and cell size.
- CSV/TXT file reads now check file size before `file.text()`.
- Workbook imports now check file size, ZIP entry count, XML entry sizes, and total XML size.
- Binary `.xls` workbook streams are size-capped before parsing.

### CSV export safety

- CSV cell values starting with `=`, `+`, `-`, `@`, tab, or carriage return are prefixed with an apostrophe before quoting.
- Object URLs are revoked asynchronously for better browser compatibility.

### Service Worker cache strategy

- Replaced broad cache-all behavior with:
  - network-first navigation handling,
  - same-origin cache-first asset handling,
  - runtime cache trimming,
  - no fallback of arbitrary non-navigation requests to `/`.

### Bundle hygiene

- Tool pages now dynamically import workbook parsing and export modules when those actions are used.
- Home page already used dynamic export imports; JSON/CSV file handling was hardened there too.

### Dependency audit

- Added npm override for `postcss@8.5.10`, including Next's nested PostCSS resolution.
- Current `npm audit` reports 0 vulnerabilities.

## Verification run

Executed locally:

```bash
npm ci --ignore-scripts
npm run typecheck
node scripts/validate-site.mjs
npm audit --omit=dev --json
npm audit --json
```

Results:

- TypeScript typecheck: passed.
- Static site validation: passed.
- Production npm audit: 0 vulnerabilities.
- Full npm audit: 0 vulnerabilities.

## Explicitly not run

Per instruction:

- `npm run build` was not executed.
- Vitest was not executed.
- Playwright/e2e tests were not executed.
