'use client';

import { useEffect, useState } from 'react';

export function ShopModeToggle() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('shop-mode', enabled);
  }, [enabled]);
  return (
    <button type="button" className="no-print mb-4 bg-[#eee5d8] text-stock-ink" onClick={() => setEnabled((value) => !value)}>
      {enabled ? 'Exit shop mode' : 'Shop mode'}
    </button>
  );
}
