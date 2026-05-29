import type { Metadata } from 'next';
import { StockCutHomeWorkspace } from '@/components/home/StockCutHomeWorkspace';

export const metadata: Metadata = {
  title: 'Cut List Optimizer for Sheet Goods, Boards, Pipe, and Tube - StockCut',
  description: 'Enter stock size, parts, kerf, and quantity to generate a browser-based cut layout, cutting sequence, waste estimate, and printable cut list for sheet goods and straight stock.',
  alternates: { canonical: '/' }
};

export default function HomePage() {
  return <StockCutHomeWorkspace />;
}
