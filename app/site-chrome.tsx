import Link from 'next/link';

type SiteHeaderProps = {
  contents?: Array<[string, string]>;
  language?: 'en' | 'zh';
  active?: 'foundations' | 'evolution' | 'breakdown' | 'pipelines' | 'capabilities' | 'simulation' | 'hardware' | 'research-lineages';
};

const subpageContents = {
  'research-lineages': [['Overview','#top'],['Reading guide','#reading-guide'],['Research families','#families'],['Composable grasping','#composable-grasping'],['Progress chronology','#chronology'],['Open frontier','#open-frontier']],
  foundations: [['Overview','#top'],['Core directions','#directions'],['Planning + control','#control-architecture'],['Simulation contract','#simulation-ready'],['Full learning stack','#full-stack'],['Human evidence','#mocap'],['Research map','#survey'],['RL + transfer','#rl-loop'],['Terms + questions','#taxonomy'],['Methodology','#method']],
  evolution: [['Overview','#top'],['Historical lineage','#historical'],['Structural phases','#phases'],['Observed shifts','#trends'],['Enduring question','#verification']],
  breakdown: [['Overview','#top'],['Shared spine','#spine'],['Capture','#capture'],['Geometry','#geometry'],['Scene state','#scene-state'],['Assets','#assets'],['Physics','#physics'],['Retargeting','#retargeting'],['Policy loop','#policy-loop'],['Contracts','#contracts']],
  pipelines: [['Overview','#top'],['Pipeline atlas','#catalog']],
  capabilities: [['Overview','#top'],['Scene graph','#stack'],['Tool atlas','#tools']],
  simulation: [['Overview','#top'],['Statistics','#dashboard'],['MicroDuck case','#microduck'],['Simulation taxonomy','#sim-data'],['Efficiency','#efficiency']],
  hardware: [['Overview','#top'],['Embodiment atlas','#atlas'],['Gloves / wearables','#gloves']],
} satisfies Record<NonNullable<SiteHeaderProps['active']>, Array<[string,string]>>;

const navigationZh: Record<string, string> = {
  Foundations: '基础概念', Evolution: '历史演进', Breakdown: '流程拆解', Pipelines: '流程图谱',
  'Capability stack': '能力栈', 'Sim data': '仿真数据', Hardware: '硬件', 'Research progress': '研究进展',
  Overview: '概览', 'Reading guide': '阅读指南', 'Research families': '研究家族',
  'Composable grasping': '可组合抓取', 'Progress chronology': '进展编年史', 'Open frontier': '待解问题',
};

export function SiteHeader({ active, language = 'en', contents }: SiteHeaderProps) {
  const label = (text: string) => language === 'zh' ? navigationZh[text] ?? text : text;
  return (
    <><header className="site-header">
      <Link className="brand" href="/" aria-label={language === 'zh' ? 'Real2Sim Frontier 首页' : 'Real2Sim Frontier home'}><span className="brand-mark">R²S</span></Link>
      <nav aria-label={language === 'zh' ? '主导航' : 'Primary navigation'}>
        <Link className={`nav-featured${active === 'foundations' ? ' active' : ''}`} href="/foundations/" aria-current={active === 'foundations' ? 'page' : undefined}>{label('Foundations')}</Link>
        <Link className={`nav-featured${active === 'evolution' ? ' active' : ''}`} href="/evolution/" aria-current={active === 'evolution' ? 'page' : undefined}>{label('Evolution')}</Link>
        <Link className={`nav-featured${active === 'breakdown' ? ' active' : ''}`} href="/breakdown/" aria-current={active === 'breakdown' ? 'page' : undefined}>{label('Breakdown')}</Link>
        <Link className={`nav-featured${active === 'pipelines' ? ' active' : ''}`} href="/pipelines/" aria-current={active === 'pipelines' ? 'page' : undefined}>{label('Pipelines')}</Link>
        <Link className={`nav-featured${active === 'capabilities' ? ' active' : ''}`} href="/capabilities/" aria-current={active === 'capabilities' ? 'page' : undefined}>{label('Capability stack')}</Link>
        <Link className={`nav-featured${active === 'simulation' ? ' active' : ''}`} href="/simulation/" aria-current={active === 'simulation' ? 'page' : undefined}>{label('Sim data')}</Link>
        <Link className={`nav-featured${active === 'hardware' ? ' active' : ''}`} href="/hardware/" aria-current={active === 'hardware' ? 'page' : undefined}>{label('Hardware')}</Link>
        <Link className={`nav-featured${active === 'research-lineages' ? ' active' : ''}`} href="/research-lineages/" aria-current={active === 'research-lineages' ? 'page' : undefined}>{label('Research progress')}</Link>
      </nav>
    </header>{active && <aside className="edge-contents" aria-label={language === 'zh' ? '目录' : 'Contents'}><span>{language === 'zh' ? '目录' : 'CONTENTS'}</span><nav>{(contents ?? subpageContents[active]).map(([text, href], index) => <a href={href} key={href}><small>{String(index + 1).padStart(2,'0')}</small>{label(text)}</a>)}</nav></aside>}</>
  );
}

export function SiteFooter({ language = 'en' }: { language?: 'en' | 'zh' } = {}) {
  return (
    <footer>
      <div><span className="brand-mark">R²S</span><strong>Real2Sim Frontier</strong></div>
      <p>{language === 'zh' ? '图形学 × 机器人学习流程。' : 'Graphics × robot learning pipelines.'}<br />{language === 'zh' ? '最近来源复核：2026-09-03。' : 'Last source review: 03 Sep 2026.'}</p>
      <a href="#top">{language === 'zh' ? '返回顶部 ↑' : 'Back to top ↑'}</a>
    </footer>
  );
}
