import type { Metadata } from 'next';
import Link from 'next/link';
import { HardwareAtlas } from './hardware-atlas';
import { SiteFooter, SiteHeader } from '../site-chrome';
import { gloveEvidence, hardwarePlatforms } from '../data';

export const metadata: Metadata = {
  title: 'Hardware Atlas — Real2Sim Frontier',
  description: 'Robot embodiments, arms, dexterous hands, grippers, joint interfaces, simulator support, and verified use in human-to-robot and real-to-sim pipelines.',
};

export default function HardwarePage() {
  return (
    <main id="top">
      <SiteHeader active="hardware" />
      <section className="subpage-hero hardware-subpage-hero">
        <div><p className="eyebrow">RESEARCH INDEX · EMBODIMENTS</p><h1>Hardware is part of the <em>method.</em></h1></div>
        <div className="subpage-intro"><p>Compare robot bodies by actionable interface—not marketing category. Every card connects morphology and control constraints to simulator support and published downstream use.</p><div><span>{hardwarePlatforms.length} platforms</span><span>{gloveEvidence.length} wearable systems</span><span>Usage-first ordering</span><span>Product imagery only</span></div><Link className="button secondary" href="/pipelines/">← Return to Pipeline Atlas</Link></div>
      </section>
      <HardwareAtlas />
      <SiteFooter />
    </main>
  );
}
