import Link from 'next/link';
import type { ContentPage, ContentSection, WorkedExample } from '@/src/content/pages';
import { allTools } from '@/src/content/pages';
import { SourceList } from '@/src/components/assumptions/SourceList';
import { ProfessionalBoundary } from '@/src/components/professional-boundary/ProfessionalBoundary';
import { ToolCalculator } from '@/src/components/calculators/ToolCalculator';

export function PageRenderer({ page }: { page: ContentPage }) {
  if (page.kind === 'tool' && page.toolKind) return <ToolPage page={page} />;
  return <ArticlePage page={page} />;
}

function ToolPage({ page }: { page: ContentPage }) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Calculator</p>
        <h1 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em] md:text-6xl">{page.h1}</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-600">{page.description}</p>
        <div className="mt-5"><ProfessionalBoundary /></div>
      </section>
      <section className="mx-auto max-w-6xl px-4"><ToolCalculator kind={page.toolKind!} /></section>
      <section className="mx-auto max-w-6xl px-4 py-8"><ResultUseCard /></section>
      <section className="mx-auto max-w-6xl px-4 py-8"><ContentSections sections={page.sections} /></section>
      <section className="mx-auto max-w-6xl px-4 py-8"><WorkedExamples examples={page.examples} /></section>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 md:grid-cols-2">
        <InfoCard title="What is included" items={page.includes ?? []} />
        <InfoCard title="What is not included" items={page.excludes ?? []} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8"><RelatedLinks page={page} /></section>
      <section className="mx-auto max-w-6xl px-4 py-8"><SourceList /></section>
      <section className="mx-auto max-w-6xl px-4 py-8"><Faq page={page} /></section>
      <section className="mx-auto max-w-6xl px-4 py-8"><RelatedTools current={page.path} /></section>
    </>
  );
}

function ArticlePage({ page }: { page: ContentPage }) {
  const showSources = page.kind !== 'support';
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">{page.kind}</p>
      <h1 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em]">{page.h1}</h1>
      <p className="mt-5 text-lg text-slate-600">{page.description}</p>
      {page.directAnswer ? <article className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight">Quick answer</h2>
        <p className="mt-3 text-slate-700">{page.directAnswer}</p>
        {page.relatedToolPath ? <Link className="mt-5 inline-block rounded-full bg-blue-700 px-5 py-3 font-bold text-white no-underline" href={page.relatedToolPath}>Open related calculator</Link> : null}
      </article> : null}
      <div className="mt-8"><ContentSections sections={page.sections} /></div>
      <div className="mt-8"><WorkedExamples examples={page.examples} /></div>
      <div className="mt-8"><RelatedLinks page={page} /></div>
      {showSources ? <div className="mt-8"><SourceList /></div> : null}
      <div className="mt-8"><Faq page={page} /></div>
    </section>
  );
}

function ContentSections({ sections }: { sections?: ContentSection[] }) {
  if (!sections?.length) return null;
  return <div className="grid gap-5">{sections.map((section) => <section key={section.heading} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
    <h2 className="text-2xl font-black tracking-tight">{section.heading}</h2>
    <div className="mt-4 space-y-3 text-slate-700">{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    {section.bullets?.length ? <ul className="mt-4 space-y-2 text-slate-700">{section.bullets.map((item) => <li key={item}>• {item}</li>)}</ul> : null}
    {section.table ? <div className="mt-5 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr>{section.table.headers.map((header) => <th key={header} className="border-b border-line bg-slate-50 p-3 font-bold">{header}</th>)}</tr></thead><tbody>{section.table.rows.map((row) => <tr key={row.join('|')}>{row.map((cell, index) => <td key={`${row.join('|')}-${index}`} className="border-b border-line p-3 align-top text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div> : null}
  </section>)}</div>;
}

function WorkedExamples({ examples }: { examples?: WorkedExample[] }) {
  if (!examples?.length) return null;
  return <div className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-2xl font-black tracking-tight">Worked examples</h2><div className="mt-4 grid gap-4">{examples.map((example) => <article key={example.title} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{example.title}</h3><ul className="mt-3 space-y-1 text-sm text-slate-700">{example.inputs.map((input) => <li key={input}>• {input}</li>)}</ul><p className="mt-3 font-bold text-slate-900">{example.result}</p><p className="mt-2 text-sm text-slate-700">{example.explanation}</p></article>)}</div></div>;
}

function RelatedLinks({ page }: { page: ContentPage }) {
  if (!page.relatedLinks?.length) return null;
  return <div className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-2xl font-black tracking-tight">Related reading and tools</h2><p className="mt-4 flex flex-wrap gap-3">{page.relatedLinks.map((link) => <Link key={link.path} href={link.path}>{link.label}</Link>)}</p></div>;
}

function ResultUseCard() {
  const items = ['Compare the range and formula before changing inputs.', 'Use the notes to understand which assumptions moved the result.', 'Copy, download or print the result for later review.'];
  return <div className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-2xl font-black tracking-tight">How to use this result</h2><ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-3">{items.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-4">{item}</li>)}</ul></div>;
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-2xl font-black tracking-tight">{title}</h2><ul className="mt-4 space-y-2 text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>;
}

function Faq({ page }: { page: ContentPage }) {
  if (!page.faqs?.length) return null;
  return <div className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-2xl font-black tracking-tight">FAQ</h2>{page.faqs.map((faq) => <details key={faq.question} className="mt-4 rounded-2xl bg-slate-50 p-4" open><summary className="font-bold">{faq.question}</summary><p className="mt-2 text-slate-700">{faq.answer}</p></details>)}</div>;
}

function RelatedTools({ current }: { current: string }) {
  return <div className="rounded-3xl border border-line bg-white p-6 shadow-sm"><h2 className="text-2xl font-black tracking-tight">Related calculators</h2><p className="mt-4 flex flex-wrap gap-3">{allTools.filter((tool) => tool.path !== current).slice(0, 5).map((tool) => <Link key={tool.path} href={tool.path}>{tool.h1}</Link>)}</p></div>;
}
