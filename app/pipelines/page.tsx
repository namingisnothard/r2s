import type { Metadata } from 'next';
import { TrackerPage } from '../page';

export const metadata: Metadata = {
  title: 'Pipeline Atlas — Real2Sim Frontier',
  description: 'Compare full real-to-simulation systems by stage coverage, output format, physics, hardware, publication status, and connected modules.',
};

export default function PipelinesPage() {
  return <TrackerPage view="pipelines" />;
}
