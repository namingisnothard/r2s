import type { Metadata } from 'next';
import Link from 'next/link';
import { evolution, evolutionPhases, evolutionTrends } from '../data';
import { SiteFooter, SiteHeader } from '../site-chrome';

export const metadata: Metadata = {
  title: 'Evolution — Real2Sim Frontier',
  description: 'Historical lineage and structural evolution of motion retargeting, imitation learning, real-to-sim, and human-to-robot systems.',
};

const eras = ['Foundations', 'Physics & learning', 'Scaling & deployment'] as const;

export default function EvolutionPage() {
  return <main id="top">
    <SiteHeader active="evolution" />
    <section className="subpage-hero evolution-subpage-hero">
      <div><p className="eyebrow">HISTORICAL LINEAGE · STRUCTURAL EVOLUTION</p><h1>The tools change. <em>The questions persist.</em></h1></div>
      <div className="subpage-intro"><p>From constraint-based character retargeting and learning from demonstration to physics-based imitation, foundation models, agentic scene compilation, and video-conditioned policies.</p><div><span>1990s—2026</span><span>{evolution.length} historical anchors</span><span>{evolutionPhases.length} structural phases</span><span>{evolutionTrends.length} observed shifts</span></div><nav className="foundation-hero-links"><a className="button secondary" href="#historical">Trace the lineage ↓</a><Link className="button secondary" href="/foundations/">Foundations ↗</Link></nav></div>
    </section>

    <section className="evolution-section evolution-page-section" id="historical">
      <div className="section-heading"><div><p className="eyebrow">HISTORICAL LINEAGE</p><h2>This did not start with foundation models.</h2></div><p>Human motion retargeting, imitation, and learning from demonstration have been active research problems for decades. Modern pipelines change the scale and sensing stack; the core questions remain recognizable.</p></div>
      <div className="era-legend"><span><i /> Foundations</span><span><i /> Physics &amp; learning</span><span><i /> Scaling &amp; deployment</span></div>
      <div className="era-grid">{eras.map((era) => <section className={`era-column era-${era.toLowerCase().replaceAll(' ', '-').replace('&', 'and')}`} key={era} aria-label={era}><header><span>{era === 'Foundations' ? '1990s—2002' : era === 'Physics & learning' ? '2003—2018' : '2023—now'}</span><strong>{era}</strong></header>{evolution.filter((item) => item.era === era).map((item) => <a className="evolution-item" key={`${item.year}-${item.title}`} href={item.href} target="_blank" rel="noreferrer"><span className="evolution-year">{item.year}</span><h3>{item.title}</h3><p>{item.contribution}</p><blockquote>{item.question}</blockquote><b>Primary source ↗</b></a>)}</section>)}</div>
      <div className="continuity-callout"><span>THE CONTINUITY</span><p><strong>Then:</strong> preserve constraints across bodies.</p><i>→</i><p><strong>Now:</strong> recover those constraints from video, test them in physics, and scale them into policy data.</p></div>

      <div className="evolution-analysis-heading" id="phases"><div><p className="eyebrow">STRUCTURAL EVOLUTION</p><h2>The programmable interface is changing.</h2></div><p>Real2sim is moving from reconstructing everything directly to generating hypotheses, grounding them in evidence, and correcting them through tools, geometry, and simulation.</p></div>
      <div className="evolution-phase-grid">{evolutionPhases.map((phase, index) => <article key={phase.period}><span>{String(index + 1).padStart(2,'0')} · {phase.period}</span><h3>{phase.title}</h3><p>{phase.approach}</p><small><b>Bottleneck</b>{phase.bottleneck}</small></article>)}</div>

      <div className="evolution-trends-heading" id="trends"><p className="eyebrow">OBSERVED SHIFTS</p><h2>What changed—and what did not.</h2><p>These are cross-paper patterns rather than claims that one architecture has replaced all earlier approaches.</p></div>
      <div className="evolution-trend-grid">{evolutionTrends.map((trend) => <article key={trend.number}><span>{trend.number} · OBSERVED SHIFT</span><h3>{trend.title}</h3><p>{trend.summary}</p><blockquote>{trend.signal}</blockquote><nav aria-label={`${trend.title} sources`}>{trend.refs.map((ref) => <a href={ref.href} target="_blank" rel="noreferrer" key={ref.label}>{ref.label} ↗</a>)}</nav></article>)}</div>
      <div className="evolution-verification" id="verification"><span>THE QUESTION THAT SURVIVES EVERY ERA</span><p>Which aspects of reality must be reproduced for the downstream decision to remain correct?</p><div><b>Graphics</b><i>perceptual + compositional fidelity</i><b>Computer vision</b><i>evidential grounding + state recovery</i><b>Robotics</b><i>intervention + policy-ranking fidelity</i></div></div>
      <div className="evolution-next"><strong>Use the chronology as context—not a winner board.</strong><p>Older constraint, control, and learning formulations remain active inside newer pipelines. The useful question is which assumptions became learned, which interfaces became scalable, and which validation obligations remain unresolved.</p><nav><Link href="/breakdown/">See intermediate artifacts ↗</Link><Link href="/pipelines/">Compare full pipelines ↗</Link><Link href="/foundations/#questions">Open enduring questions ↗</Link></nav></div>
    </section>
    <SiteFooter />
  </main>;
}
