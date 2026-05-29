import { AdSlot } from '@/components/common/AdSlot';
import { AffiliateSlot } from '@/components/common/AffiliateSlot';
import { ShopModeToggle } from '@/components/common/ShopModeToggle';
import { SheetOptimizerTool } from '@/components/tools/SheetOptimizerTool';
import { LinearOptimizerTool } from '@/components/tools/LinearOptimizerTool';
import { KerfCalculator } from '@/components/tools/KerfCalculator';
import { PlywoodYieldCalculator } from '@/components/tools/PlywoodYieldCalculator';
import { siteUrl, type SeoPage } from '@/data/pages';
import { guideContentBySlug } from '@/data/guideContent';
import { presetContentBySlug, type StockCutPresetContent } from '@/data/presetContent';
import type { LinearPresetKey, SheetPresetKey } from '@/data/presets';

const sheetPresetKeys = new Set<SheetPresetKey>(['imperial-sheet', 'metric-sheet', 'plywood-4x8', 'mdf-metric', 'acrylic-metric', 'melamine-cabinet', 'cabinet', 'bookshelf', 'drawer-box', 'closet-shelf', 'workbench']);
const linearPresetKeys = new Set<LinearPresetKey>(['imperial-linear', 'metric-linear', 'linear-bar', 'steel-tube', 'aluminum-extrusion', 'pvc-pipe', 'lumber-length', 'rebar']);

function jsonLd(page: SeoPage) {
  const url = `${siteUrl}${page.slug === '/' ? '' : page.slug}`;
  const guide = guideContentBySlug[page.slug];
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: page.title, item: url }
    ]
  };

  if (page.kind === 'guide') {
    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.title,
      description: page.description,
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'StockCut' },
      publisher: { '@type': 'Organization', name: 'StockCut' },
      dateModified: '2026-05-30'
    };
    const faq = guide ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    } : null;
    return JSON.stringify(faq ? [article, faq, breadcrumb] : [article, breadcrumb]);
  }

  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: page.title,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: page.description
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Does StockCut upload my cut list?', acceptedAnswer: { '@type': 'Answer', text: 'No. StockCut calculates and autosaves in your browser and does not cloud-save cut lists.' } },
      { '@type': 'Question', name: 'Does StockCut guarantee a mathematically optimal layout?', acceptedAnswer: { '@type': 'Answer', text: 'No. It creates practical kerf-aware layouts for planning and printing; verify before cutting.' } },
      { '@type': 'Question', name: 'Can I print or save a PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the print button and choose Save as PDF in your browser.' } }
    ]
  };
  return JSON.stringify([app, faq, breadcrumb]);
}

export function PageShell({ page }: { page: SeoPage }) {
  const sheetPreset = sheetPresetKeys.has(page.preset as SheetPresetKey) ? page.preset as SheetPresetKey : 'imperial-sheet';
  const linearPreset = linearPresetKeys.has(page.preset as LinearPresetKey) ? page.preset as LinearPresetKey : 'imperial-linear';
  const presetContent = presetContentBySlug[page.slug];
  return <main className="mx-auto max-w-7xl px-4 py-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(page) }} />
    <ShopModeToggle />
    <section className="mb-4 md:mb-6">
      <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">Local-first · kerf-aware · printable</p>
      <h1 className="print-title max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{page.title}</h1>
      <p className="mt-3 max-w-3xl text-base text-stock-muted">{page.description}</p>
    </section>
    {page.kind === 'sheet' && <SheetOptimizerTool preset={sheetPreset} />}
    {page.kind === 'linear' && <LinearOptimizerTool preset={linearPreset} />}
    {page.kind === 'kerf' && <KerfCalculator />}
    {(page.slug.includes('plywood-yield') || page.slug === '/tools/plywood-yield-calculator') && <PlywoodYieldCalculator />}
    {presetContent && <PresetContent content={presetContent} />}
    {page.kind === 'guide' && <GuideContent page={page} />}
    {(page.kind === 'legal' || page.kind === 'about') && <LegalContent page={page} />}
    <AdSlot />
    <AffiliateSlot />
    <section className="guide-card grid gap-4 md:grid-cols-3">
      <div className="tool-card"><h2 className="font-black">What StockCut does</h2><p className="text-sm text-stock-muted">It creates practical rectangular sheet and straight-stock layouts with kerf, labels, waste, offcuts, cut sequence tables, and print-friendly output.</p></div>
      <div className="tool-card"><h2 className="font-black">What it does not do</h2><p className="text-sm text-stock-muted">No accounts, cloud save, CNC toolpaths, G-code, true angle-cut geometry, circular parts, triangle parts, polygon nesting, enterprise inventory, or AI cabinet design. The DXF export is a rectangular planning outline, not machine-ready CAM.</p></div>
      <div className="tool-card"><h2 className="font-black">Privacy model</h2><p className="text-sm text-stock-muted">Cut lists are processed in the browser. Autosave uses localStorage. The tool does not upload or cloud-save your project data.</p></div>
    </section>
  </main>;
}


function PresetContent({ content }: { content: StockCutPresetContent }) {
  return <section className="tool-card space-y-6" aria-label={`${content.title} guide`}>
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-stock-muted">{content.eyebrow}</p>
      <h2 className="text-2xl font-black">{content.title}</h2>
      <p className="mt-3 text-stock-muted">{content.lead}</p>
    </div>
    <figure className="overflow-hidden rounded-2xl border border-stock-line bg-white">
      <figcaption className="border-b border-stock-line bg-stock-paper px-4 py-2 text-sm font-bold text-stock-ink">Preset parameters and review points</figcaption>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-stock-ink"><tr>{content.presetTable.headers.map((header) => <th key={header} className="border-b border-stock-line px-4 py-2 font-black">{header}</th>)}</tr></thead>
          <tbody>{content.presetTable.rows.map((row) => <tr key={row.join('|')} className="border-b border-stock-line last:border-b-0">{row.map((cell) => <td key={cell} className="px-4 py-2 text-stock-muted">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </figure>
    <div className="grid gap-4 lg:grid-cols-2">
      {content.blocks.map((block) => <section key={block.title} className="rounded-2xl border border-stock-line bg-white p-4">
        <h3 className="font-black text-stock-ink">{block.title}</h3>
        <div className="mt-2 space-y-2">
          {block.body.map((paragraph) => <p key={paragraph} className="text-sm text-stock-muted">{paragraph}</p>)}
        </div>
        {block.bullets && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stock-muted">{block.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
        {block.table && <figure className="mt-3 overflow-hidden rounded-xl border border-stock-line">
          {block.table.caption && <figcaption className="border-b border-stock-line bg-stock-paper px-3 py-2 text-xs font-bold text-stock-ink">{block.table.caption}</figcaption>}
          <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-xs"><thead><tr>{block.table.headers.map((header) => <th key={header} className="border-b border-stock-line px-3 py-2 font-black text-stock-ink">{header}</th>)}</tr></thead><tbody>{block.table.rows.map((row) => <tr key={row.join('|')} className="border-b border-stock-line last:border-b-0">{row.map((cell) => <td key={cell} className="px-3 py-2 text-stock-muted">{cell}</td>)}</tr>)}</tbody></table></div>
        </figure>}
      </section>)}
    </div>
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-stock-line bg-stock-paper p-4">
        <h3 className="font-black text-stock-ink">Common mistakes to avoid</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stock-muted">{content.mistakes.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="rounded-2xl border border-stock-line bg-stock-paper p-4">
        <h3 className="font-black text-stock-ink">Related tools and guides</h3>
        <ul className="mt-3 space-y-3 text-sm text-stock-muted">
          {content.related.map((item) => <li key={item.href}><a className="font-bold text-stock-ink underline" href={item.href}>{item.label}</a><span className="block text-xs text-stock-muted">{item.purpose}</span></li>)}
        </ul>
      </div>
    </section>
  </section>;
}

function GuideContent({ page }: { page: SeoPage }) {
  const guide = guideContentBySlug[page.slug];
  if (!guide) {
    return <section className="tool-card"><h2 className="text-2xl font-black">{page.title}</h2><p className="mt-3 text-stock-muted">This guide page needs a dedicated content module before it should be promoted as a standalone search landing page.</p><p className="mt-3 text-stock-muted">Use the related StockCut calculator pages for live planning, and verify dimensions, kerf, stock defects, and shop process before cutting.</p></section>;
  }
  return <article className="tool-card space-y-6">
    <div>
      <h2 className="text-2xl font-black">{page.title}</h2>
      <p className="mt-3 text-stock-muted">{guide.lead}</p>
    </div>
    {guide.sections.map((section) => (
      <section key={section.heading} className="space-y-3">
        <h3 className="text-xl font-black">{section.heading}</h3>
        {section.body.map((paragraph) => <p key={paragraph} className="text-stock-muted">{paragraph}</p>)}
        {section.bullets && <ul className="list-disc space-y-2 pl-5 text-stock-muted">{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
        {section.table && <figure className="overflow-hidden rounded-2xl border border-stock-line bg-white">
          {section.table.caption && <figcaption className="border-b border-stock-line bg-stock-paper px-4 py-2 text-sm font-bold text-stock-ink">{section.table.caption}</figcaption>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-stock-ink"><tr>{section.table.headers.map((header) => <th key={header} className="border-b border-stock-line px-4 py-2 font-black">{header}</th>)}</tr></thead>
              <tbody>{section.table.rows.map((row) => <tr key={row.join('|')} className="border-b border-stock-line last:border-b-0">{row.map((cell) => <td key={cell} className="px-4 py-2 text-stock-muted">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </figure>}
      </section>
    ))}
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-stock-line bg-white p-4">
        <h3 className="font-black">Related StockCut tools</h3>
        <ul className="mt-3 space-y-2 text-sm text-stock-muted">
          {guide.related.map((item) => <li key={item.href}><a className="font-bold text-stock-ink underline" href={item.href}>{item.label}</a></li>)}
        </ul>
      </div>
      <div className="rounded-2xl border border-stock-line bg-white p-4">
        <h3 className="font-black">Quick FAQ</h3>
        <div className="mt-3 space-y-2">
          {guide.faq.map((item) => <details key={item.question} className="rounded-xl border border-stock-line bg-stock-paper p-3"><summary className="cursor-pointer font-bold text-stock-ink">{item.question}</summary><p className="mt-2 text-sm text-stock-muted">{item.answer}</p></details>)}
        </div>
      </div>
    </section>
    <p className="text-sm text-stock-muted">Use the live calculator on this site to test the same assumptions with your own stock size, part list, kerf, strategy, and export needs.</p>
  </article>;
}

function LegalContent({ page }: { page: SeoPage }) {
  const privacy = page.slug.includes('privacy');
  return <section className="tool-card"><h2 className="text-2xl font-black">{page.title}</h2><p className="mt-3 text-stock-muted">StockCut is a free planning tool. All calculations are estimates and should be verified before cutting material. {privacy ? 'Cut lists, dimensions, and project drafts are processed locally in your browser and are not uploaded or cloud-saved by this app. Analytics, advertising cookies, or affiliate links may be used only for standard site operation and monetization.' : 'You are responsible for safe tool operation, measurement verification, material decisions, and compliance with your shop process.'}</p></section>;
}
