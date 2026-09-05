import type { Metadata } from 'next';
import ResearchReader from './research-reader';

export const metadata: Metadata = {
  title: 'Research Lineages & Progress — Real2Sim Frontier',
  description: 'Seven real-to-sim research families and a chronology of substantive advances, with editorial and compact reading modes in English and Chinese.',
};

export default function ResearchLineagesPage() {
  return <ResearchReader />;
}
