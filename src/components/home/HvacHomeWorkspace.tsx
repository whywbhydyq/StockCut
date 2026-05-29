'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ToolKind } from '@/src/content/pages';
import { PROFESSIONAL_BOUNDARY } from '@/src/content/site';
import { ToolCalculator } from '@/src/components/calculators/ToolCalculator';

type HomeMode = {
  id: 'ac' | 'dehumidifier' | 'cfm';
  label: string;
  title: string;
  subtitle: string;
  toolKind: ToolKind;
  result: string;
  primaryLink: string;
  primaryLinkLabel: string;
  sample: string;
};

const homeModes: HomeMode[] = [
  {
    id: 'ac',
    label: 'Cooling load',
    title: 'AC BTU estimator',
    subtitle: 'Room size, ceiling height, sun, occupants and insulation.',
    toolKind: 'ac',
    result: 'BTU/h range, common sizes and oversizing warnings.',
    primaryLink: '/room-ac-btu-calculator/',
    primaryLinkLabel: 'Open full AC BTU page',
    sample: 'Default sample: 12 × 10 ft room, 8 ft ceiling, average sun.'
  },
  {
    id: 'dehumidifier',
    label: 'Moisture control',
    title: 'Dehumidifier size estimator',
    subtitle: 'Area, dampness, basement, temperature and water-source checks.',
    toolKind: 'dehumidifier',
    result: 'Pints/day range, product class and drainage recommendation.',
    primaryLink: '/dehumidifier-size-calculator/',
    primaryLinkLabel: 'Open full dehumidifier page',
    sample: 'Default sample: 1,000 sq ft damp space at 70°F.'
  },
  {
    id: 'cfm',
    label: 'Airflow math',
    title: 'CFM by ACH calculator',
    subtitle: 'Room volume and target air changes per hour.',
    toolKind: 'cfm-by-ach',
    result: 'CFM estimate with the visible room-volume formula.',
    primaryLink: '/cfm-by-ach-calculator/',
    primaryLinkLabel: 'Open full CFM / ACH page',
    sample: 'Default sample: 12 × 10 × 8 ft room at 6 ACH.'
  }
];

export function HvacHomeWorkspace() {
  const [activeId, setActiveId] = useState<HomeMode['id']>('ac');
  const activeMode = homeModes.find((mode) => mode.id === activeId) ?? homeModes[0];

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-5 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Free browser-side HVAC planning tools</p>
          <h1 className="mt-3 max-w-5xl text-4xl font-black leading-[1.03] tracking-[-0.055em] md:text-6xl">
            Estimate AC BTU, dehumidifier size, and room airflow
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Enter room dimensions and a few conditions. Get a preliminary BTU, pints/day, or CFM estimate with the formula and assumptions shown beside the inputs.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-800">No login</span>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-800">Visible formulas</span>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-900">Preliminary planning only</span>
          </div>
        </div>
        <aside className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950">
          <strong className="block text-base text-orange-950">Professional boundary</strong>
          <p className="mt-2">{PROFESSIONAL_BOUNDARY}</p>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-3">
        <div className="grid gap-3 md:grid-cols-3" aria-label="Choose an HVAC task">
          {homeModes.map((mode) => {
            const active = mode.id === activeId;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveId(mode.id)}
                className={`rounded-3xl border p-4 text-left shadow-sm transition ${
                  active ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-line bg-white hover:border-blue-300'
                }`}
                aria-pressed={active}
              >
                <span className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">{mode.label}</span>
                <span className="mt-1 block text-xl font-black tracking-tight text-ink">{mode.title}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">{mode.subtitle}</span>
                <span className="mt-3 block rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Output: {mode.result}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4" aria-labelledby="home-workbench-title">
        <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-line bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Selected task</p>
            <h2 id="home-workbench-title" className="text-2xl font-black tracking-tight">{activeMode.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{activeMode.sample}</p>
          </div>
          <Link href={activeMode.primaryLink} className="font-bold no-underline">
            {activeMode.primaryLinkLabel}
          </Link>
        </div>
        <ToolCalculator kind={activeMode.toolKind} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-5">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black tracking-tight">Use the estimate</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Copy the result or download CSV for notes. Treat it as a planning number, not final equipment selection.</p>
          </article>
          <article className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black tracking-tight">Check the formula</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">The result panel shows the formula and adjustments so users can see why the estimate moved.</p>
          </article>
          <article className="rounded-3xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black tracking-tight">Next checks</h2>
            <p className="mt-2 flex flex-wrap gap-2 text-sm">
              <Link href="/guides/how-many-btu-per-square-foot/">BTU per sq ft</Link>
              <Link href="/guides/cfm-vs-ach/">CFM vs ACH</Link>
              <Link href="/templates/hvac-contractor-questions/">Contractor questions</Link>
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
