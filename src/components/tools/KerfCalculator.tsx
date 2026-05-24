'use client';

import { useMemo, useState } from 'react';
import type { DisplayUnit } from '@/core/types';
import { parseDimension } from '@/core/units/parseDimension';
import { formatDimension } from '@/core/units/formatDimension';

export function KerfCalculator() {
  const [unit, setUnit] = useState<DisplayUnit>('in');
  const [stock, setStock] = useState('48');
  const [part, setPart] = useState('24');
  const [quantity, setQuantity] = useState('2');
  const [kerf, setKerf] = useState('1/8');
  const result = useMemo(() => {
    const s = parseDimension(stock, unit); const p = parseDimension(part, unit); const k = parseDimension(kerf, unit); const q = Number(quantity);
    if (!s.ok || !p.ok || !k.ok || !Number.isInteger(q) || q <= 0) return { ok: false as const, message: 'Enter valid stock, part, quantity, and kerf.' };
    const cuts = Math.max(0, q - 1); const needed = p.valueUm * q + k.valueUm * cuts;
    return { ok: true as const, needed, fits: needed <= s.valueUm, loss: k.valueUm * cuts };
  }, [stock, part, quantity, kerf, unit]);
  return <section className="tool-card"><h2 className="text-2xl font-black tracking-tight">Saw Kerf Calculator</h2><div className="mt-4 grid gap-4 md:grid-cols-5"><label>Unit<select value={unit} onChange={(e) => setUnit(e.target.value as DisplayUnit)}><option value="in">inch</option><option value="mm">mm</option><option value="cm">cm</option><option value="ft-in">ft-in</option></select></label><label>Stock width/length<input value={stock} onChange={(e) => setStock(e.target.value)} /></label><label>Part size<input value={part} onChange={(e) => setPart(e.target.value)} /></label><label>Quantity<input value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><label>Kerf<input value={kerf} onChange={(e) => setKerf(e.target.value)} /></label></div><div className="mt-4 rounded-2xl border border-stock-line bg-white p-4">{result.ok ? <><p>Required raw stock: <strong>{formatDimension(result.needed, unit)}</strong></p><p>Kerf loss: <strong>{formatDimension(result.loss, unit)}</strong></p><p className={result.fits ? 'text-stock-ok' : 'text-stock-warn'}>{result.fits ? 'This fits the entered stock size.' : 'This does not fit once kerf is included.'}</p></> : <p>{result.message}</p>}<p className="mt-3 text-sm text-stock-muted">Example: two 24 in panels from a 48 in sheet require 48 in plus one blade kerf. With a 1/8 in blade, that is 48 1/8 in, so it does not fit.</p></div></section>;
}
