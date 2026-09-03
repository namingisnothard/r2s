import Link from 'next/link';

type SiteHeaderProps = {
  active?: 'foundations' | 'evolution' | 'breakdown' | 'pipelines' | 'capabilities' | 'simulation' | 'hardware';
};

const subpageContents = {
  foundations: [['Overview','#top'],['Core directions','#directions'],['Planning + control','#control-architecture'],['Simulation contract','#simulation-ready'],['Full learning stack','#full-stack'],['Human evidence','#mocap'],['Research map','#survey'],['RL + transfer','#rl-loop'],['Terms + questions','#taxonomy'],['Methodology','#method']],
  evolution: [['Overview','#top'],['Historical lineage','#historical'],['Structural phases','#phases'],['Observed shifts','#trends'],['Enduring question','#verification']],
  breakdown: [['Overview','#top'],['Shared spine','#spine'],['Capture','#capture'],['Geometry','#geometry'],['Scene state','#scene-state'],['Assets','#assets'],['Physics','#physics'],['Retargeting','#retargeting'],['Policy loop','#policy-loop'],['Contracts','#contracts']],
  pipelines: [['Overview','#top'],['Pipeline atlas','#catalog']],
  capabilities: [['Overview','#top'],['Scene graph','#stack'],['Tool atlas','#tools']],
  simulation: [['Overview','#top'],['Statistics','#dashboard'],['MicroDuck case','#microduck'],['Simulation taxonomy','#sim-data'],['Efficiency','#efficiency']],
  hardware: [['Overview','#top'],['Embodiment atlas','#atlas'],['Gloves / wearables','#gloves']],
} satisfies Record<NonNullable<SiteHeaderProps['active']>, Array<[string,string]>>;

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <><header className="site-header">
      <Link className="brand" href="/" aria-label="Real2Sim Frontier home"><span className="brand-mark">R²S</span></Link>
      <nav aria-label="Primary navigation">
        <Link className={`nav-featured${active === 'foundations' ? ' active' : ''}`} href="/foundations/" aria-current={active === 'foundations' ? 'page' : undefined}>Foundations</Link>
        <Link className={`nav-featured${active === 'evolution' ? ' active' : ''}`} href="/evolution/" aria-current={active === 'evolution' ? 'page' : undefined}>Evolution</Link>
        <Link className={`nav-featured${active === 'breakdown' ? ' active' : ''}`} href="/breakdown/" aria-current={active === 'breakdown' ? 'page' : undefined}>Breakdown</Link>
        <Link className={`nav-featured${active === 'pipelines' ? ' active' : ''}`} href="/pipelines/" aria-current={active === 'pipelines' ? 'page' : undefined}>Pipelines</Link>
        <Link className={`nav-featured${active === 'capabilities' ? ' active' : ''}`} href="/capabilities/" aria-current={active === 'capabilities' ? 'page' : undefined}>Capability stack</Link>
        <Link className={`nav-featured${active === 'simulation' ? ' active' : ''}`} href="/simulation/" aria-current={active === 'simulation' ? 'page' : undefined}>Sim data</Link>
        <Link className={`nav-featured${active === 'hardware' ? ' active' : ''}`} href="/hardware/" aria-current={active === 'hardware' ? 'page' : undefined}>Hardware</Link>
      </nav>
    </header>{active && <aside className="edge-contents" aria-label="Contents"><span>CONTENTS</span><nav>{subpageContents[active].map(([label, href], index) => <a href={href} key={href}><small>{String(index + 1).padStart(2,'0')}</small>{label}</a>)}</nav></aside>}</>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div><span className="brand-mark">R²S</span><strong>Real2Sim Frontier</strong></div>
      <p>Graphics × robot learning pipelines.<br />Last source review: 03 Sep 2026.</p>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
