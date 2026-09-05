'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { copy, localizedResearch, type Language } from './translations';
import { descendantPapers, paperPath, researchTree, type DecisionNode, type PaperLeaf, type ResearchNode } from './decision-tree-data';
import styles from './decision-tree.module.css';

const labels = {
  en: {
    eyebrow: 'A decision tree of research objectives', title: 'Follow the question. Find the paper.',
    intro: 'Start with the output you need, then follow the technical choices. Every paper is a terminal node; each edge states the distinction that places it there.',
    note: 'An editorial reading map, not a claim of ancestry or exclusive capabilities. A paper appears once under its primary contribution; related work may span other branches.',
    search: 'Find a paper or technical distinction', placeholder: 'SPIDER, contact, video, 2026…', results: 'papers',
    expand: 'Expand all', collapse: 'Collapse all', clear: 'Clear search', noResults: 'No papers match this search.',
    roots: 'Choose an output', split: 'Decision', leaf: 'Paper', inspect: 'Inspect paper',
    detail: 'Paper in context', choose: 'Choose a paper leaf', chooseHint: 'Its decision path, technical contribution, and closest alternatives will appear here.',
    path: 'Why this paper is here', contribution: 'What moves forward', alternatives: 'Nearest alternatives',
    alternativesHint: 'Same decision point; different technical choices. This is a comparison of contributions, not a performance ranking.',
    family: 'Original research family', adjacent: 'Composable grasping', paperCount: 'papers',
    focus: 'Focus on this path', all: 'Show the full tree', pathOnly: 'Showing the selected path', full: 'Full research tree',
    map: 'Research decision tree', comparison: 'Distinctive choice',
    familyFilter: 'Read one research family', allFamilies: 'All families', familyHint: 'Families share a recurring pipeline; the tree separates their technical objectives. A family can span several output branches.',
    shared: 'Shared pipeline', boundary: 'What separates the contributions', takeaways: 'Show paper takeaways', filtered: 'Family tree', reset: 'Clear filters',
  },
  zh: {
    eyebrow: '按研究目标组织的决策树', title: '沿着问题，找到论文。',
    intro: '从所需产出开始，逐层比较技术选择。每篇论文都是叶子节点，每条分支都说明它被放在这里的理由。',
    note: '这是一张阅读判断图，不表示直接继承或能力互斥。每篇论文按主要贡献出现一次；相关工作也可能涉及其他分支。',
    search: '查找论文或技术区别', placeholder: 'SPIDER、接触、视频、2026…', results: '篇论文',
    expand: '展开全部', collapse: '折叠全部', clear: '清除搜索', noResults: '没有匹配的论文。',
    roots: '选择所需产出', split: '判断节点', leaf: '论文', inspect: '查看论文',
    detail: '论文定位', choose: '选择一个论文叶子节点', chooseHint: '这里会展示完整判断路径、技术贡献，以及最接近的替代工作。',
    path: '为什么这篇论文在这里', contribution: '具体推进了什么', alternatives: '最接近的替代工作',
    alternativesHint: '同一个判断点，不同的技术选择。这是在比较贡献，并非性能排名。',
    family: '原研究家族', adjacent: '可组合抓取', paperCount: '篇论文',
    focus: '只看这条路径', all: '查看完整树', pathOnly: '当前展示所选路径', full: '完整研究树',
    map: '研究决策树', comparison: '关键区别',
    familyFilter: '按研究家族阅读', allFamilies: '全部家族', familyHint: '家族归纳共同流程，决策树区分技术目标；同一家族可以跨越多个产出分支。',
    shared: '共同流程', boundary: '区分贡献的技术边界', takeaways: '显示论文 takeaway', filtered: '家族决策树', reset: '清除筛选',
  },
};
const everyLeaf = descendantPapers(researchTree);
const collectDecisions = (node: DecisionNode): string[] => [node.id, ...node.children.flatMap(child => child.kind === 'decision' ? collectDecisions(child) : [])];
const decisionIds = collectDecisions(researchTree);

export default function DecisionTree({ language, selectedPaper, onSelect }: { language: Language; selectedPaper: string; onSelect: (paper: string) => void }) {
  const t = labels[language];
  const { families, grasping } = localizedResearch(language);
  const papers = new Map([...families.flatMap(f => f.papers), grasping].map(p => [p.arxiv, p]));
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState(false);
  const [familyId, setFamilyId] = useState('all');
  const [showTakeaways, setShowTakeaways] = useState(true);
  const activeFamily = families.find(f => f.id === familyId);
  const familyPaperIds = new Set(activeFamily?.papers.map(p => p.arxiv) ?? (familyId === 'grasping' ? [grasping.arxiv] : [...papers.keys()]));
  const panelRef = useRef<HTMLElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const selected = familyPaperIds.has(selectedPaper) ? papers.get(selectedPaper) : undefined;
  const selectedLeaf = everyLeaf.find(leaf => leaf.paper === selectedPaper);
  const path = selected ? paperPath(selected.arxiv) : [];
  const pathIds = new Set(path.map(node => node.id));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = new Set(everyLeaf.filter(leaf => {
    const paper = papers.get(leaf.paper)!;
    return familyPaperIds.has(leaf.paper) && `${paper.name} ${paper.date} ${paper.advance} ${leaf.answer[language]}`.toLocaleLowerCase().includes(normalizedQuery);
  }).map(leaf => leaf.paper));
  const shown = (node: ResearchNode): boolean => {
    if (focus && selected) return node.kind === 'paper' ? node.paper === selected.arxiv : pathIds.has(node.id);
    return descendantPapers(node).some(leaf => matches.has(leaf.paper));
  };
  const shownCount = focus && selected ? 1 : matches.size;
  const nearest = path.at(-1)?.children.flatMap(descendantPapers).filter(leaf => leaf.paper !== selectedPaper) ?? [];
  const family = families.find(f => f.papers.some(p => p.arxiv === selectedPaper));

  function selectPaper(id: string) {
    setQuery('');
    if (!familyPaperIds.has(id)) setFamilyId('all');
    const ids = new Set(paperPath(id).map(node => node.id));
    setCollapsed(current => new Set([...current].filter(node => !ids.has(node))));
    onSelect(id);
    if (window.matchMedia('(max-width: 1000px)').matches) panelRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  function selectFamily(id: string) {
    setFamilyId(id);
    setFocus(false);
    setQuery('');
    setCollapsed(new Set());
  }
  function toggle(id: string) {
    setCollapsed(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function renderLeaf(leaf: PaperLeaf) {
    const paper = papers.get(leaf.paper)!;
    return <li className={styles.leaf} key={leaf.paper}>
      <button type="button" className={styles.paperButton} aria-pressed={selectedPaper === leaf.paper} onClick={() => selectPaper(leaf.paper)}>
        <span className={styles.paperIdentity}><strong>{paper.name.split(' · ')[0]}</strong><time dateTime={paper.date}>{paper.date}</time><span aria-hidden="true">→</span></span>
        <span className={styles.leafAnswer}>{leaf.answer[language]}</span>
        {showTakeaways && <span className={styles.leafContribution}>{paper.advance}</span>}
      </button>
    </li>;
  }
  function renderDecision(node: DecisionNode, root = false) {
    return <li className={`${styles.branch} ${root ? styles.rootBranch : ''}`} key={node.id} id={`tree-${node.id}`}>
      <details open={Boolean(normalizedQuery) || Boolean(focus && selected) || !collapsed.has(node.id)}>
        <summary className={`${styles.gate} ${pathIds.has(node.id) ? styles.onPath : ''}`} onClick={event => { event.preventDefault(); if (!normalizedQuery && !focus) toggle(node.id); }}>
          <span className={styles.chevron} aria-hidden="true">›</span><span><span className={styles.answer}>{node.answer[language]}</span><strong>{node.question[language]}</strong></span><small>{focus && selected ? 1 : descendantPapers(node).filter(leaf => matches.has(leaf.paper)).length}</small>
        </summary>
        <ul className={styles.children}>{node.children.filter(shown).map(child => child.kind === 'paper' ? renderLeaf(child) : renderDecision(child))}</ul>
      </details>
    </li>;
  }

  return <section id="families" className={styles.section} aria-label={t.map}>
    <div className={styles.heading}><p className="eyebrow">{t.eyebrow}</p><h2>{t.title}</h2><p>{t.intro}</p></div>
    <div className={styles.root}><span>{language === 'zh' ? '根节点 / 00' : 'ROOT / 00'}</span><h3>{researchTree.question[language]}</h3><small>{everyLeaf.length} {t.paperCount} · {researchTree.children.length} {language === 'zh' ? '类产出' : 'outputs'}</small></div>
    <nav className={styles.rootNav} aria-label={t.roots}>{researchTree.children.map((node, index) => node.kind === 'decision' && <a href={`#tree-${node.id}`} key={node.id} onClick={() => { setFocus(false); setFamilyId('all'); setQuery(''); setCollapsed(current => new Set([...current].filter(id => id !== node.id))); }}><span>0{index + 1}</span><strong>{node.answer[language]}</strong><small>{descendantPapers(node).length} {t.paperCount}</small></a>)}</nav>
    <p className={styles.note}>{t.note}</p>
    <div className={styles.familyPicker}>
      <p>{t.familyFilter}</p>
      <div role="group" aria-label={t.familyFilter} className={styles.familyChoices}>
        <button type="button" aria-pressed={familyId === 'all'} onClick={() => selectFamily('all')}>{t.allFamilies}<small>{everyLeaf.length}</small></button>
        {families.map(f => <button type="button" key={f.id} aria-pressed={familyId === f.id} onClick={() => selectFamily(f.id)}>{f.title}<small>{f.papers.length}</small></button>)}
        <button type="button" aria-pressed={familyId === 'grasping'} onClick={() => selectFamily('grasping')}>{t.adjacent}<small>1</small></button>
      </div>
      <p className={styles.familyHint}>{t.familyHint}</p>
      {activeFamily && <div className={styles.familyContext}>
        <div><h3>{activeFamily.title}</h3><p>{activeFamily.question}</p><h4>{t.shared}</h4><ol>{activeFamily.spine.map(step => <li key={step}>{step}</li>)}</ol></div>
        <div><h4>{t.boundary}</h4><p>{activeFamily.takeaway}</p></div>
      </div>}
      {familyId === 'grasping' && <div className={styles.familyContext}><div><h3>{t.adjacent}</h3><p>{copy[language].adjacentNote}</p></div></div>}
    </div>
    <div className={styles.toolbar}>
      <label><span>{t.search}</span><input type="search" value={query} placeholder={t.placeholder} onChange={event => { setQuery(event.target.value); setFocus(false); }} /></label>
      <div>{query && <button type="button" onClick={() => setQuery('')}>{t.clear}</button>}<button type="button" onClick={() => { setCollapsed(new Set()); setFocus(false); }} disabled={Boolean(normalizedQuery)}>{t.expand}</button><button type="button" onClick={() => { setCollapsed(new Set(decisionIds)); setFocus(false); }} disabled={Boolean(normalizedQuery)}>{t.collapse}</button></div>
      <span role="status" aria-live="polite">{shownCount} / {everyLeaf.length} {t.results}</span>
    </div>
    <div className={styles.workspace}>
      <div className={styles.tree} ref={treeRef}>
        <div className={styles.legend}><span><i />{t.split}</span><span><i />{t.leaf}</span><label className={styles.takeawayToggle}><input type="checkbox" checked={showTakeaways} onChange={event => setShowTakeaways(event.target.checked)} />{t.takeaways}</label><b>{focus && selected ? t.pathOnly : familyId !== 'all' ? t.filtered : t.full}</b></div>
        {shownCount ? <ul className={styles.roots}>{researchTree.children.filter(shown).map(node => node.kind === 'decision' ? renderDecision(node, true) : renderLeaf(node))}</ul> : <div className={styles.empty}><p>{t.noResults}</p><button type="button" onClick={() => selectFamily('all')}>{t.reset}</button></div>}
      </div>
      <aside className={styles.panel} ref={panelRef} aria-label={t.detail}>
        {selected && selectedLeaf ? <>
          <div className={styles.panelHeader}><p className="eyebrow">{t.detail}</p><h3>{selected.name.split(' · ')[0]}</h3><time dateTime={selected.date}>{selected.date}</time><p>{t.family}: {family?.title ?? t.adjacent}</p></div>
          <div className={styles.panelBody}>
            <h4>{t.comparison}</h4><p className={styles.distinction}>{selectedLeaf.answer[language]}</p>
            <h4>{t.contribution}</h4><p>{selected.advance}</p>
            <div className={styles.links}><a href={`https://arxiv.org/abs/${selected.arxiv}`} target="_blank" rel="noreferrer">{copy[language].paper}</a><Link href={`/pipelines/?q=${encodeURIComponent(selected.atlasName ?? selected.name)}#catalog`}>{copy[language].atlas}</Link></div>
            <h4>{t.path}</h4><ol className={styles.path}>{path.map((node, index) => <li key={node.id}><span>{node.question[language]}</span><strong>{(path[index + 1]?.answer ?? selectedLeaf.answer)[language]}</strong></li>)}</ol>
            <button className={styles.focusButton} type="button" aria-pressed={focus} onClick={() => { setFocus(current => !current); setFamilyId('all'); setQuery(''); treeRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}>{focus ? t.all : t.focus}</button>
            <h4>{t.alternatives}</h4><p className={styles.alternativesHint}>{t.alternativesHint}</p>
            <ul className={styles.alternatives}>{nearest.map(leaf => <li key={leaf.paper}><button type="button" onClick={() => selectPaper(leaf.paper)}><strong>{papers.get(leaf.paper)!.name.split(' · ')[0]} <small>{papers.get(leaf.paper)!.date}</small></strong><span>{leaf.answer[language]}</span></button></li>)}</ul>
          </div>
        </> : <div className={styles.prompt}><p className="eyebrow">{t.detail}</p><h3>{t.choose}</h3><p>{t.chooseHint}</p><span aria-hidden="true">↙</span></div>}
      </aside>
    </div>
  </section>;
}
