import type { Metadata } from 'next';
import { TrackerPage } from '../page';

export const metadata: Metadata = {
  title: 'Capability Stack — Real2Sim Frontier',
  description: 'Foundation models and reusable real-to-simulation tools, ordered by verified downstream use and organized by pipeline stage.',
};

export default function CapabilitiesPage() {
  return <TrackerPage view="capabilities" />;
}
