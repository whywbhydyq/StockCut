import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-4xl font-black tracking-tight">Page not found</h1>
      <p className="mt-4 text-slate-600">The calculator or guide you requested does not exist.</p>
      <Link className="mt-6 inline-block rounded-full bg-blue-700 px-5 py-3 font-bold text-white" href="/">
        Return to calculators
      </Link>
    </section>
  );
}
