import { ShopModeToggle } from '@/components/common/ShopModeToggle';
import { SheetOptimizerTool } from '@/components/tools/SheetOptimizerTool';
import { LinearOptimizerTool } from '@/components/tools/LinearOptimizerTool';
import { KerfCalculator } from '@/components/tools/KerfCalculator';
import { PlywoodYieldCalculator } from '@/components/tools/PlywoodYieldCalculator';
import { siteUrl, type SeoPage } from '@/data/pages';
import { organizationJsonLd, siteLastModified, siteOgImage, websiteJsonLd } from '@/data/siteMeta';
import { guideContentBySlug } from '@/data/guideContent';
import { presetContentBySlug, type StockCutPresetContent } from '@/data/presetContent';
import type { LinearPresetKey, SheetPresetKey } from '@/data/presets';
import { IntentNavigation } from '@/components/page/IntentNavigation';
import { PageEvidencePanel } from '@/components/page/PageEvidencePanel';
import { intentClusterJsonLd, relatedPagesFor } from '@/data/seoIntentClusters';
import { evidenceJsonLd, pageAboutTerms, pageMentions } from '@/data/pageEvidence';
import { detailedEvidenceRoutes } from '@/data/publicPolicy';

const sheetPresetKeys = new Set<SheetPresetKey>(['imperial-sheet', 'metric-sheet', 'plywood-4x8', 'mdf-metric', 'acrylic-metric', 'melamine-cabinet', 'cabinet', 'bookshelf', 'drawer-box', 'closet-shelf', 'workbench']);
const linearPresetKeys = new Set<LinearPresetKey>(['imperial-linear', 'metric-linear', 'linear-bar', 'steel-tube', 'aluminum-extrusion', 'pvc-pipe', 'lumber-length', 'rebar']);

function pageKeywords(page: SeoPage) {
  return [page.primaryQuery, page.title, 'cut list optimizer', 'kerf', page.kind === 'linear' ? 'linear stock cutting' : 'sheet cutting layout'].filter(Boolean).join(', ');
}

function jsonLd(page: SeoPage) {
  const url = `${siteUrl}${page.slug === '/' ? '' : page.slug}`;
  const relatedPages = relatedPagesFor(page, 6);
  const aboutTerms = pageAboutTerms(page);
  const mentions = pageMentions(page);
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'StockCut', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: page.title, item: url }
    ]
  };
  const webPage = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${siteUrl}/#website` },
    breadcrumb,
    dateModified: siteLastModified,
    image: siteOgImage,
    about: aboutTerms.map((name) => ({ '@type': 'Thing', name })),
    mentions: mentions.map((name) => ({ '@type': 'Thing', name })),
    relatedLink: relatedPages.map((related) => `${siteUrl}${related.slug === '/' ? '' : related.slug}`)
  };

  if (page.kind === 'guide') {
    const article = {
      '@type': 'Article',
      headline: page.title,
      description: page.description,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      author: { '@type': 'Organization', name: 'StockCut', url: siteUrl },
      publisher: { '@id': `${siteUrl}/#organization` },
      isPartOf: { '@id': `${siteUrl}/#website` },
      inLanguage: 'en',
      datePublished: '2026-05-30',
      dateModified: siteLastModified,
      image: siteOgImage,
      keywords: pageKeywords(page),
      about: [
        ...aboutTerms.map((name) => ({ '@type': 'Thing', name }))
      ],
      mentions: mentions.map((name) => ({ '@type': 'Thing', name }))
    };
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [organizationJsonLd(), websiteJsonLd(), intentClusterJsonLd(), webPage, article, evidenceJsonLd(page), breadcrumb] });
  }

  const app = {
    '@type': 'WebApplication',
    name: page.title,
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${siteUrl}/#website` },
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    isAccessibleForFree: true,
    softwareVersion: '1.0.0',
    browserRequirements: 'Requires a modern browser with JavaScript enabled; calculations run locally in the browser.',
    dateModified: siteLastModified,
    image: siteOgImage,
    keywords: pageKeywords(page),
    about: aboutTerms.map((name) => ({ '@type': 'Thing', name })),
    mentions: mentions.map((name) => ({ '@type': 'Thing', name })),
    featureList: page.kind === 'linear'
      ? ['Linear stock cut optimization', 'Kerf-aware cut sequence', 'Reusable offcut tracking', 'CSV, JSON, and PDF output']
      : ['Rectangular sheet layout optimization', 'Kerf-aware panel placement', 'Rotation and grain review', 'Printable diagrams and CSV, JSON, PDF, DXF output']
  };
  const graph: unknown[] = [organizationJsonLd(), websiteJsonLd(), intentClusterJsonLd(), webPage, breadcrumb];
  if (page.kind !== 'legal' && page.kind !== 'about') graph.splice(4, 0, app, evidenceJsonLd(page));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

export function PageShell({ page }: { page: SeoPage }) {
  const sheetPreset = sheetPresetKeys.has(page.preset as SheetPresetKey) ? page.preset as SheetPresetKey : 'imperial-sheet';
  const linearPreset = linearPresetKeys.has(page.preset as LinearPresetKey) ? page.preset as LinearPresetKey : 'imperial-linear';
  const presetContent = presetContentBySlug[page.slug];
  const isTool = page.kind === 'sheet' || page.kind === 'linear' || page.kind === 'kerf';
  return <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(page) }} />
    {isTool && <ShopModeToggle />}
    {page.kind === 'sheet' && page.slug.includes('plywood-yield') ? <PlywoodYieldCalculator /> : null}
    {page.kind === 'sheet' && !page.slug.includes('plywood-yield') && <SheetOptimizerTool preset={sheetPreset} />}
    {page.kind === 'linear' && <LinearOptimizerTool preset={linearPreset} />}
    {page.kind === 'kerf' && <KerfCalculator />}
    <section className={`${isTool ? 'mt-6 ' : ''}mb-4 md:mb-6`}>
      <p className="mb-3 inline-flex rounded-full border border-stock-line bg-stock-paper px-3 py-1 text-sm font-semibold text-stock-muted">{isTool ? 'Local-first · kerf-aware · printable' : page.kind === 'guide' ? 'Practical cutting guide' : 'StockCut information'}</p>
      <h1 className="print-title max-w-5xl text-3xl font-black tracking-tight md:text-5xl">{page.title}</h1>
      <p className="mt-3 max-w-3xl text-base text-stock-muted">{page.description}</p>
    </section>
    {presetContent && <PresetContent content={presetContent} />}
    {page.kind === 'guide' && <GuideContent page={page} />}
    {(page.kind === 'legal' || page.kind === 'about') && <LegalContent page={page} />}
    {detailedEvidenceRoutes.has(page.slug) && <PageEvidencePanel page={page} />}
    {(isTool || page.kind === 'guide') && <IntentNavigation page={page} />}
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
  const contact = page.slug.includes('contact');
  const about = page.slug.includes('about');
  if (about) {
    return <section className="tool-card space-y-5"><h2 className="text-2xl font-black">{page.title}</h2><p className="text-stock-muted">StockCut is a YmirTool planning tool for sheet goods, boards, pipe, tube, bar stock, kerf-aware cut lists, printable layouts, and shop preparation. The project focuses on practical browser-side planning rather than account-based cloud storage or certified manufacturing output.</p><section><h3 className="font-black text-stock-ink">What the tool is built to verify</h3><p className="mt-2 text-stock-muted">The calculators help users compare stock sizes, include saw kerf, mark repeated parts, review waste, identify unplaced pieces, and print a shop-readable layout before cutting. Sheet pages focus on rectangular panel layouts. Linear pages focus on straight boards, pipe, tube, extrusion, bar stock, and rebar.</p></section><section><h3 className="font-black text-stock-ink">Calculation boundaries</h3><p className="mt-2 text-stock-muted">StockCut is not CNC CAM, polygon nesting, G-code generation, certified estimating, structural engineering, or a substitute for shop safety checks. Users should verify stock dimensions, blade kerf, factory-edge trim, defects, grain direction, edge banding marks, and machine setup against physical material before cutting.</p></section><section><h3 className="font-black text-stock-ink">Privacy and data handling</h3><p className="mt-2 text-stock-muted">Cut lists are processed locally in the browser. Autosave uses localStorage, and share links encode project data in the URL hash. This means project dimensions are not intentionally uploaded to a StockCut server by the optimizer workflow.</p></section><section><h3 className="font-black text-stock-ink">Feedback and corrections</h3><p className="mt-2 text-stock-muted">For corrections, bug reports, source updates, or feedback about a preset page, email <a className="font-bold underline" href="mailto:ymirtool@ymirtool.com">ymirtool@ymirtool.com</a>. Include the page URL, stock dimensions, kerf, part list, expected result, and actual result when reporting a layout issue. Do not send private customer files or unnecessary personal information.</p></section></section>;
  }
  return <section className="tool-card"><h2 className="text-2xl font-black">{page.title}</h2><p className="mt-3 text-stock-muted">StockCut is a YmirTool planning tool for sheet goods, boards, pipe, tube, bar stock, kerf-aware cut lists, printable layouts, and shop preparation. All calculations are estimates and should be verified before cutting material. {privacy ? 'Cut lists, dimensions, and project drafts are processed locally in your browser and are not uploaded or cloud-saved by this app. Analytics, advertising cookies, or affiliate links may be used only for standard site operation and monetization.' : 'You are responsible for safe tool operation, measurement verification, material decisions, and compliance with your shop process.'}</p>{contact && <p className="mt-3 text-stock-muted">For corrections, bug reports, source updates, or feedback about a preset page, email <a className="font-bold underline" href="mailto:ymirtool@ymirtool.com">ymirtool@ymirtool.com</a>. Include the page URL, stock dimensions, kerf, part list, expected result, and actual result when reporting a layout issue. Do not send private customer files or unnecessary personal information.</p>}</section>;
}
