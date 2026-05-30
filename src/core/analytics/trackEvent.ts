export type StockCutEventName =
  | 'optimize_sheet_clicked'
  | 'optimize_linear_clicked'
  | 'sample_loaded'
  | 'paste_import_used'
  | 'print_clicked'
  | 'pdf_clicked'
  | 'csv_export_clicked'
  | 'json_export_clicked'
  | 'unit_changed'
  | 'kerf_changed'
  | 'share_link_created'
  | 'json_import_used'
  | 'csv_import_used'
  | 'xlsx_import_used'
  | 'pdf_export_clicked'
  | 'dxf_export_clicked'
  | 'optimization_cancelled'
  | 'mode_switched'
  | 'offcuts_saved_to_stock'
  | 'offcuts_saved_to_library'
  | 'offcut_library_loaded'
  | 'offcut_library_cleared';

export function trackEvent(name: StockCutEventName, meta: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;
  const safeMeta = { ...meta, source: 'stockcut', privacy: 'no_cut_list_dimensions_recorded' };
  const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push({ event: name, ...safeMeta });
  window.dispatchEvent(new CustomEvent('stockcut:event', { detail: { name, meta: safeMeta } }));
}
