# Continuation Report 2

Date: 2026-05-25

## Implemented in this pass

1. Manual sheet layout adjustment
   - Added a real manual adjustment layer to `SheetLayoutSvg`.
   - Users can select a placed sheet part, drag it inside the usable sheet area, nudge it by buttons, or rotate it.
   - Moves are blocked when they would overlap another part.
   - Moves are clamped to the usable sheet area after trim.
   - Grain-locked parts cannot be manually rotated.
   - Offcut regions are recomputed after accepted manual edits.
   - Result warnings record that manual editing changed the generated layout.

2. Offcut inventory library
   - Added `src/core/storage/offcutInventory.ts`.
   - Sheet and linear results can be saved into a local browser offcut library.
   - Saved offcuts can be loaded back into additional stock rows.
   - Library data stays in `localStorage` and is capped to 100 entries.
   - Added UI for loading and clearing sheet/linear offcut libraries.

3. Tests
   - Added tests for manual sheet adjustment, overlap blocking, grain-locked rotation blocking, offcut recomputation, and inventory conversion.
   - Test count increased from 31 to 37.

4. Documentation cleanup
   - Updated README and coverage documents to reflect planning DXF, miter/angle notes, manual adjustment, and the local offcut library.

## External implementation notes used

- Web Worker behavior remains aligned with MDN's Worker model: background thread, `postMessage`, and `terminate` for cancellation/fallback planning.
- The PDF route remains the existing custom vector-PDF approach rather than relying on browser screenshot capture.

## Still intentionally unsupported

- True angled-cut geometry.
- G-code or machine-ready CAM.
- Non-rectangular nesting.
- Enterprise inventory / ERP.
- Cloud accounts or server-side project storage.
