'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { copy, localizedResearch, type Language } from './translations';
import { researchTree } from './decision-tree-data';
import { branchColors, landscapeNodes } from './tree-layout';
import type { SceneState, TreeScene } from './tree-scene';
import styles from './tree-landscape.module.css';

const shortBranches = { en: ['Assets & scenes', 'Dynamics', 'Actions & data', 'Policy simulation'], zh: ['资产与场景', '可控动态', '动作与数据', '策略仿真'] };

const words = {
  en: {
    eyebrow: 'Interactive research landscape', title: 'One landscape. Many frontiers.', intro: 'Follow four research outputs through their technical decisions to 31 paper leaves.',
    help: 'Drag to orbit · Scroll / pinch to zoom · Right-drag to pan · Click a node to inspect',
    note: 'Colors identify output branches. Spheres are papers; diamonds are decisions. Height and distance are layout choices, not performance or chronology.',
    family: 'Research family', all: 'All families', grasping: 'Composable grasping', search: 'Find a paper', placeholder: 'Name, date, or technical contribution…',
    expand: 'Expand map', close: 'Close expanded view', reset: 'Reset view', focus: 'Focus selected node', zoomIn: 'Zoom in', zoomOut: 'Zoom out', clear: 'Clear filters', allBranches: 'All outputs',
    papers: 'papers', decisions: 'decision nodes', root: 'Research question', selected: 'Selected paper', choice: 'Technical distinction', advance: 'What moves forward',
    path: 'Decision path', alternatives: 'Same decision, different choices', choose: 'Explore a branch or paper.', chooseHint: 'Click a sphere, a diamond, or a name in the paper index. Your selection highlights the complete path.',
    index: 'Paper index', indexHint: 'Every paper is available here, including labels hidden to avoid overlap.', noResults: 'No papers match these filters.',
    loading: 'Building the 3D landscape…', unavailable: 'The 3D renderer is unavailable on this device. You can still explore every paper in the index or switch to the decision tree.',
    retry: 'Retry 3D', tree: 'Open decision tree', node: 'Decision node', outputs: 'Output branches', shared: 'Shared pipeline', boundary: 'Family frontier',
  },
  zh: {
    eyebrow: '交互式研究版图', title: '一张版图，多条技术前沿。', intro: '从四类研究产出出发，沿技术判断走到 31 篇论文叶子。',
    help: '拖动旋转 · 滚轮／双指缩放 · 右键拖动平移 · 点击节点查看',
    note: '颜色表示产出分支，球体表示论文，菱形表示判断节点。高度与距离用于布局，不表示性能或时间顺序。',
    family: '研究家族', all: '全部家族', grasping: '可组合抓取', search: '查找论文', placeholder: '名称、日期或技术贡献…',
    expand: '展开版图', close: '关闭展开视图', reset: '重置视角', focus: '聚焦所选节点', zoomIn: '放大', zoomOut: '缩小', clear: '清除筛选', allBranches: '全部产出',
    papers: '篇论文', decisions: '个判断节点', root: '研究问题', selected: '所选论文', choice: '技术区别', advance: '具体推进了什么',
    path: '判断路径', alternatives: '同一判断点，不同技术选择', choose: '探索一个分支或一篇论文。', chooseHint: '点击球体、菱形或论文索引中的名称，即可高亮完整路径。',
    index: '论文索引', indexHint: '这里保留全部论文，包括为避免重叠而隐藏的图中标签。', noResults: '没有符合当前筛选的论文。',
    loading: '正在构建三维研究版图…', unavailable: '当前设备无法使用三维渲染。你仍可通过论文索引探索全部内容，或切换至决策树。',
    retry: '重试三维视图', tree: '打开决策树', node: '判断节点', outputs: '产出分支', shared: '共同流程', boundary: '家族技术前沿',
  },
};

export default function TreeLandscape({ language, selectedPaper, onSelect }: { language: Language; selectedPaper: string; onSelect: (id: string) => void }) {
  const t = words[language];
  const { families, grasping } = localizedResearch(language);
  const papers = [...families.flatMap(f => f.papers), grasping];
  const paperMap = new Map(papers.map(p => [p.arxiv, p]));
  const [query, setQuery] = useState('');
  const [familyId, setFamilyId] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [decisionId, setDecisionId] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TreeScene | null>(null);
  const activeFamily = families.find(f => f.id === familyId);
  const branch = landscapeNodes.find(n => n.id === branchId);
  const search = query.trim().toLocaleLowerCase();
  const visiblePapers = papers.filter(p => {
    const leaf = landscapeNodes.find(n => n.id === p.arxiv)!;
    const matchesFamily = familyId === 'all' || (familyId === 'grasping' ? p.arxiv === grasping.arxiv : activeFamily?.papers.some(other => other.arxiv === p.arxiv));
    return matchesFamily && (!branch || branch.papers.includes(p.arxiv)) && `${p.name} ${p.date} ${p.advance} ${leaf.data.answer[language]}`.toLocaleLowerCase().includes(search);
  });
  const visibleIds = new Set(visiblePapers.map(p => p.arxiv));
  const activeNodes = new Set(landscapeNodes.filter(n => n.papers.some(id => visibleIds.has(id))).map(n => n.id));
  const selectedId = decisionId || selectedPaper;
  const selectedNode = activeNodes.has(selectedId) ? landscapeNodes.find(n => n.id === selectedId) : undefined;
  const selected = selectedNode?.data.kind === 'paper' ? paperMap.get(selectedId) : undefined;
  const selectedFamily = selected ? families.find(f => f.papers.some(p => p.arxiv === selected.arxiv)) : undefined;
  const selectedPath: typeof landscapeNodes = [];
  let ancestor = selectedNode;
  while (ancestor) { selectedPath.unshift(ancestor); ancestor = landscapeNodes.find(n => n.id === ancestor?.parent); }
  const parent = landscapeNodes.find(n => n.id === selectedNode?.parent);
  const alternatives = parent?.data.kind === 'decision' ? parent.data.children.filter(n => n.kind === 'paper' && n.paper !== selectedId) : [];

  function clearFilters() { setQuery(''); setFamilyId('all'); setBranchId('all'); }
  function choosePaper(id: string) {
    if (!visibleIds.has(id)) clearFilters();
    setDecisionId(''); onSelect(id);
  }
  const onPick = useEffectEvent((id: string) => {
    if (paperMap.has(id)) choosePaper(id); else setDecisionId(id);
  });
  const currentState = useEffectEvent((): SceneState => ({
    active: activeNodes, selected: selectedNode?.id ?? '', path: new Set(selectedPath.map(n => n.id)),
    labels: new Map(landscapeNodes.map(n => [n.id, n.data.kind === 'paper' ? `${paperMap.get(n.id)!.name.split(' · ')[0]} · ${paperMap.get(n.id)!.date}` : n.depth === 0 ? 'Real → Sim' : n.depth === 1 ? shortBranches[language][n.sector] : n.data.answer[language]])),
  }));
  useEffect(() => {
    let cancelled = false;
    let instance: TreeScene | undefined;
    import('./tree-scene').then(({ createTreeScene }) => {
      if (cancelled || !hostRef.current) return;
      instance = createTreeScene(hostRef.current, landscapeNodes, id => onPick(id), () => setStatus('error'));
      sceneRef.current = instance;
      instance.update(currentState());
      setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; instance?.dispose(); sceneRef.current = null; };
  }, [attempt]);
  useEffect(() => { sceneRef.current?.update(currentState()); }, [language, selectedPaper, query, familyId, branchId, decisionId]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') setExpanded(false);
      if (event.key === 'Tab') {
        const targets = [...(mapRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], canvas[tabindex]') ?? [])].filter(el => el.getClientRects().length > 0);
        const first = targets[0];
        const last = targets.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    window.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', escape); previousFocus?.focus(); };
  }, [expanded]);

  return <section className={`${styles.section} ${expanded ? styles.expanded : ''}`} id="families" aria-label={t.eyebrow}>
    <header className={styles.header}><div><p className="eyebrow">{t.eyebrow}</p><h2>{t.title}</h2><p>{t.intro}</p></div><div className={styles.stats}><strong>{papers.length} <span>{t.papers}</span></strong><strong>{landscapeNodes.filter(n => n.data.kind === 'decision').length} <span>{t.decisions}</span></strong></div></header>
    <nav className={styles.branches} aria-label={t.outputs}>
      <button type="button" aria-pressed={branchId === 'all'} onClick={() => { setBranchId('all'); setDecisionId(''); }}>{t.allBranches}</button>
      {researchTree.children.map((node, index) => node.kind === 'decision' && <button type="button" key={node.id} aria-pressed={branchId === node.id} style={{ '--branch': branchColors[index] } as React.CSSProperties} onClick={() => { setBranchId(node.id); setFamilyId('all'); setQuery(''); setDecisionId(node.id); }}><i />{node.answer[language]}</button>)}
    </nav>
    <div className={styles.filters}>
      <label><span>{t.family}</span><select value={familyId} onChange={event => { setFamilyId(event.target.value); setBranchId('all'); setDecisionId(''); }}><option value="all">{t.all}</option>{families.map(f => <option value={f.id} key={f.id}>{f.title}</option>)}<option value="grasping">{t.grasping}</option></select></label>
      <label><span>{t.search}</span><input type="search" value={query} placeholder={t.placeholder} onChange={event => setQuery(event.target.value)} /></label>
      <button type="button" onClick={clearFilters}>{t.clear}</button><span role="status">{visiblePapers.length} / 31 {t.papers}</span>
    </div>
    {activeFamily && <div className={styles.family}><strong>{activeFamily.title}</strong><p>{t.shared}: {activeFamily.spine.join(' → ')}</p><p>{activeFamily.takeaway}</p></div>}
    <div className={styles.workspace} ref={mapRef} role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined} aria-label={expanded ? t.eyebrow : undefined}>
      <div className={styles.mapColumn}>
        <div className={styles.mapToolbar}><span>{t.help}</span><div><button type="button" onClick={() => sceneRef.current?.zoom(.8)} disabled={status !== 'ready'} aria-label={t.zoomIn}>＋</button><button type="button" onClick={() => sceneRef.current?.zoom(1.25)} disabled={status !== 'ready'} aria-label={t.zoomOut}>−</button><button type="button" onClick={() => sceneRef.current?.reset()} disabled={status !== 'ready'}>{t.reset}</button><button type="button" aria-pressed={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? t.close : t.expand}</button></div></div>
        <div className={styles.stage}>
          <div className={styles.canvasHost} ref={hostRef} />
          {status !== 'ready' && <div className={styles.fallback} role="status"><p>{status === 'loading' ? t.loading : t.unavailable}</p>{status === 'error' && <><button type="button" onClick={() => { setStatus('loading'); setAttempt(n => n + 1); }}>{t.retry}</button><Link href={`/research-lineages/?format=tree&lang=${language}`}>{t.tree} →</Link></>}</div>}
          <div className={styles.mapCaption} aria-hidden="true">REAL / SIM<br /><span>RESEARCH LANDSCAPE</span></div>
        </div>
        <p className={styles.note}>{t.note}</p>
      </div>
      <aside className={styles.detail} aria-label={t.selected}>
        {selectedNode ? <>
          <p className="eyebrow">{selected ? t.selected : selectedNode.depth === 0 ? t.root : t.node}</p>
          <h3>{selected ? selected.name.split(' · ')[0] : selectedNode.data.answer[language]}</h3>
          {selected && <><time dateTime={selected.date}>{selected.date}</time><p className={styles.familyName}>{selectedFamily?.title ?? t.grasping}</p></>}
          <h4>{selected ? t.choice : t.node}</h4><p>{selectedNode.data.kind === 'decision' ? selectedNode.data.question[language] : selectedNode.data.answer[language]}</p>
          {selected && <><h4>{t.advance}</h4><p>{selected.advance}</p><div className={styles.links}><a href={`https://arxiv.org/abs/${selected.arxiv}`} target="_blank" rel="noreferrer">{copy[language].paper}</a><Link href={`/pipelines/?q=${encodeURIComponent(selected.atlasName ?? selected.name)}#catalog`}>{copy[language].atlas}</Link></div></>}
          <button className={styles.focus} type="button" onClick={() => sceneRef.current?.focus(selectedNode.id)} disabled={status !== 'ready'}>{t.focus} ↗</button>
          <h4>{t.path}</h4><ol className={styles.path}>{selectedPath.map((node, index) => <li key={node.id}><button type="button" onClick={() => node.data.kind === 'paper' ? choosePaper(node.id) : setDecisionId(node.id)}>{index === 0 ? t.root : node.data.kind === 'paper' ? selected?.name.split(' · ')[0] : node.data.answer[language]}</button></li>)}</ol>
          {alternatives.length > 0 && <><h4>{t.alternatives}</h4>{alternatives.map(node => node.kind === 'paper' && <button className={styles.alternative} key={node.paper} type="button" onClick={() => choosePaper(node.paper)}><strong>{paperMap.get(node.paper)!.name.split(' · ')[0]} <small>{paperMap.get(node.paper)!.date}</small></strong><span>{node.answer[language]}</span></button>)}</>}
          {selectedNode.data.kind === 'decision' && <div className={styles.decisionPapers}>{selectedNode.papers.filter(id => visibleIds.has(id)).map(id => <button type="button" key={id} onClick={() => choosePaper(id)}>{paperMap.get(id)!.name.split(' · ')[0]} <small>{paperMap.get(id)!.date}</small></button>)}</div>}
        </> : <div className={styles.prompt}><span aria-hidden="true">◎</span><h3>{t.choose}</h3><p>{t.chooseHint}</p></div>}
      </aside>
    </div>
    <div className={styles.index}><div><h3>{t.index}</h3><p>{t.indexHint}</p></div><div className={styles.paperGrid}>{visiblePapers.map(paper => <button type="button" key={paper.arxiv} aria-pressed={selectedId === paper.arxiv} onClick={() => { choosePaper(paper.arxiv); sceneRef.current?.focus(paper.arxiv); mapRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}><strong>{paper.name.split(' · ')[0]}</strong><time dateTime={paper.date}>{paper.date}</time></button>)}</div>{!visiblePapers.length && <p>{t.noResults}</p>}</div>
  </section>;
}
