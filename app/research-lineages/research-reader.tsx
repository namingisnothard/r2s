'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SiteFooter, SiteHeader } from '../site-chrome';
import { composableGrasping, researchLineages, type LineagePaper } from '../research-lineages-data';
import { copy, criteria, localizedResearch, type Language } from './translations';
import styles from './research-lineages.module.css';
import DecisionTree from './decision-tree';
import { researchTree } from './decision-tree-data';

const TreeLandscape = dynamic(() => import('./tree-landscape'), { ssr: false });

const allPapers = [...researchLineages.flatMap(family => family.papers), composableGrasping];
const paperByName = new Map(allPapers.map(paper => [paper.name, paper]));
const preferencesEvent = 'research-reader-preferences';
function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener(preferencesEvent, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(preferencesEvent, callback);
  };
}
const getSnapshot = () => window.location.search;
const getServerSnapshot = () => '';

function PaperLinks({ paper, language }: { paper: LineagePaper; language: Language }) {
  return <div className={styles.paperLinks}>
    <a href={`https://arxiv.org/abs/${paper.arxiv}`} target="_blank" rel="noreferrer">{copy[language].paper}</a>
    <Link href={`/pipelines/?q=${encodeURIComponent(paper.atlasName ?? paper.name)}#catalog`}>{copy[language].atlas}</Link>
  </div>;
}

function References({ names }: { names: string[] }) {
  return <div className={styles.references}>{names.map(name => {
    const paper = paperByName.get(name)!;
    return <a href={`https://arxiv.org/abs/${paper.arxiv}`} target="_blank" rel="noreferrer" key={name}>{name.split(' · ')[0]} ↗</a>;
  })}</div>;
}

export default function ResearchReader() {
  // A stable server snapshot preserves the default English static export.
  // Reading the URL as an external store also restores shared links and Back/Forward.
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const params = new URLSearchParams(search);
  const language: Language = params.get('lang') === 'zh' ? 'zh' : 'en';
  const format = params.get('format') === '3d' ? '3d' : params.get('format') === 'tree' ? 'tree' : params.get('format') === 'compact' ? 'compact' : 'editorial';
  const tree = format === 'tree';
  const landscape = format === '3d';
  const mapView = tree || landscape;
  const compact = format === 'compact';
  const t = copy[language];
  const { families, grasping, milestones } = localizedResearch(language);

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    const previousTitle = document.title;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = language === 'zh' ? '研究谱系与实质进展 — Real2Sim Frontier' : 'Research Lineages & Progress — Real2Sim Frontier';
    return () => {
      document.documentElement.lang = previousLanguage;
      document.title = previousTitle;
    };
  }, [language]);

  function updatePreference(key: 'lang' | 'format' | 'paper', value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    if (url.search === window.location.search) return;
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new Event(preferencesEvent));
  }

  return <main id="top" className={`${styles.page} ${compact ? styles.compact : ''} ${mapView ? styles.treeView : ''}`} lang={language === 'zh' ? 'zh-CN' : 'en'}>
    <SiteHeader active="research-lineages" language={language} contents={landscape ? [['Overview', '#top'], [t.landscape, '#families'], ['Progress chronology', '#chronology'], ['Open frontier', '#open-frontier']] : tree ? [
      ['Overview', '#top'], [t.tree, '#families'],
      ...researchTree.children.flatMap(node => node.kind === 'decision' ? [[node.answer[language], `#tree-${node.id}`] as [string, string]] : []),
      ['Progress chronology', '#chronology'], ['Open frontier', '#open-frontier'],
    ] : undefined} />
    <div className={styles.controls}>
      <div className={styles.controlGroup} role="group" aria-label={t.format}>
        <span>{t.format}</span>
        <button type="button" aria-pressed={format === 'editorial'} onClick={() => updatePreference('format', 'editorial')}>{t.editorial}</button>
        <button type="button" aria-pressed={compact} onClick={() => updatePreference('format', 'compact')}>{t.compact}</button>
        <button type="button" aria-pressed={tree} onClick={() => updatePreference('format', 'tree')}>{t.tree}</button>
        <button type="button" aria-pressed={landscape} onClick={() => updatePreference('format', '3d')}>{t.landscape}</button>
      </div>
      <div className={styles.controlGroup} role="group" aria-label={t.language}>
        <span>{t.language}</span>
        <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => updatePreference('lang', 'en')}>English</button>
        <button type="button" lang="zh-CN" aria-pressed={language === 'zh'} onClick={() => updatePreference('lang', 'zh')}>中文</button>
      </div>
      <p>{t.formatHint}</p>
    </div>
    <section className={`subpage-hero ${styles.hero}`}>
      <div><p className="eyebrow">{t.eyebrow}</p><h1>{t.title} <em>{t.titleEmphasis}</em></h1></div>
      <div className="subpage-intro">
        <p>{t.intro}</p>
        <div><span>{mapView ? researchTree.children.length : families.length} {mapView ? t.outputsCount : t.familiesCount}</span><span>{allPapers.length} {t.papersCount}</span><span>{t.dateBasis}</span></div>
        <nav className="foundation-hero-links" aria-label={t.explore}><a className="button primary" href="#families">{landscape ? t.exploreLandscape : tree ? t.exploreTree : t.compare}</a><a className="button secondary" href="#chronology">{t.readChronology}</a></nav>
      </div>
    </section>

    <section className={styles.section} id="reading-guide">
      <div className={styles.heading}><div><p className="eyebrow">{t.readingEyebrow}</p><h2>{t.readingTitle}</h2></div><p>{t.readingIntro}</p></div>
      <div className={styles.criteria}>{criteria[language].map(([title, detail], index) => <article key={index}><span>0{index + 1}</span><h3>{title}</h3><p>{detail}</p></article>)}</div>
      <div className={styles.method}><strong>{t.scopeTitle}</strong><p>{t.scope}</p></div>
    </section>

    {landscape ? <TreeLandscape language={language} selectedPaper={params.get('paper') ?? ''} onSelect={id => updatePreference('paper', id)} /> : tree ? <DecisionTree language={language} selectedPaper={params.get('paper') ?? ''} onSelect={id => updatePreference('paper', id)} /> : <section className={styles.section} id="families">
      <div className={styles.heading}><div><p className="eyebrow">{t.familiesEyebrow}</p><h2>{t.familiesTitle}{' '}<br />{t.familiesSubtitle}</h2></div><p>{t.familiesIntro}</p></div>
      <nav className={styles.familyNav} aria-label={t.familyNav}>{families.map((family, index) => <a href={`#${family.id}`} key={family.id}><span>0{index + 1}</span>{family.title}<b aria-hidden="true">↘</b></a>)}</nav>
      {families.map((family, index) => <article className={styles.family} id={family.id} key={family.id}>
        <header className={styles.familyHeading}><span className={styles.number}>0{index + 1}</span><div><h3>{family.title}</h3><p>{family.question}</p></div><small>{family.papers.length} {t.papers}</small></header>
        <ol className={styles.spine} aria-label={t.sharedPipeline}>{family.spine.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ol>
        {compact ? <div className={styles.tableScroll} role="region" aria-label={family.title} tabIndex={0}>
          <p className={styles.tableHint}>{t.tableHint}</p>
          <table className={styles.compactTable} aria-label={family.title}>
            <thead><tr><th scope="col">{t.firstPreprint}</th><th scope="col">{t.paperName}</th><th scope="col">{t.advance}</th></tr></thead>
            <tbody>{family.papers.map(paper => <tr key={paper.arxiv}>
              <td><time dateTime={paper.date}>{paper.date}</time></td>
              <th scope="row"><a href={`https://arxiv.org/abs/${paper.arxiv}`} target="_blank" rel="noreferrer">{paper.name}</a><Link className={styles.compactAtlas} href={`/pipelines/?q=${encodeURIComponent(paper.atlasName ?? paper.name)}#catalog`}>{t.atlas}</Link></th>
              <td>{paper.advance}</td>
            </tr>)}</tbody>
          </table>
        </div> : <div className={styles.paperTable}>
          <div className={styles.tableHeader} aria-hidden="true"><span>{t.firstPreprint}</span><span>{t.paperName}</span><span>{t.advance}</span></div>
          {family.papers.map(paper => <article className={styles.paperRow} key={paper.arxiv}>
            <time dateTime={paper.date}>{paper.date}</time>
            <div><h4>{paper.name}</h4><PaperLinks paper={paper} language={language} /></div>
            <p>{paper.advance}</p>
          </article>)}
        </div>}
        <div className={styles.takeaway}><span>{t.takeaway}</span><p>{family.takeaway}</p></div>
      </article>)}
    </section>}

    {!mapView && <section className={`${styles.section} ${styles.adjacent}`} id="composable-grasping">
      <div><p className="eyebrow">{t.adjacentEyebrow} · {grasping.date}</p><h2>{t.adjacentTitle}{' '}<br />{t.adjacentSubtitle}</h2><h3>AdaRoboVLG</h3><PaperLinks paper={grasping} language={language} /></div>
      <div><p>{grasping.advance}</p><blockquote>{t.adjacentNote}</blockquote></div>
    </section>}

    <section className={`${styles.section} ${styles.chronology}`} id="chronology">
      <div className={styles.heading}><div><p className="eyebrow">{t.chronologyEyebrow}</p><h2>{t.chronologyTitle}{' '}<br /><em>{t.chronologyEmphasis}</em></h2></div><p>{t.chronologyIntro}</p></div>
      {compact ? <div className={styles.tableScroll} role="region" aria-label={t.chronologyEyebrow} tabIndex={0}>
        <p className={styles.tableHint}>{t.tableHint}</p>
        <table className={`${styles.compactTable} ${styles.chronologyTable}`} aria-label={t.chronologyEyebrow}>
          <thead><tr><th scope="col">{t.period}</th><th scope="col">{t.representativePapers}</th><th scope="col">{t.change}</th></tr></thead>
          <tbody>{milestones.map(milestone => <tr key={milestone.date}><th scope="row">{milestone.date}</th><td><References names={milestone.papers} /></td><td><strong>{milestone.title}</strong><p>{milestone.change}</p><span className={styles.axis}>{milestone.axis}</span></td></tr>)}</tbody>
        </table>
      </div> : <ol className={styles.timeline}>{milestones.map(milestone => <li key={milestone.date}>
        <div className={styles.timelineDate}>{milestone.date}</div>
        <article><span className={styles.axis}>{milestone.axis}</span><h3>{milestone.title}</h3><p>{milestone.change}</p><References names={milestone.papers} /></article>
      </li>)}</ol>}
    </section>

    <section className={`${styles.section} ${styles.conclusion}`} id="open-frontier">
      <p className="eyebrow">{t.frontierEyebrow}</p><h2>{t.frontierTitle}{' '}<br />{t.frontierSubtitle}</h2>
      <p>{t.synthesis}</p><p>{t.remainingTest}</p>
      <nav className="foundation-hero-links" aria-label={t.continue}><Link className="button secondary" href="/pipelines/">{t.fullPipelines}</Link><Link className="button secondary" href="/evolution/">{t.history}</Link><Link className="button secondary" href="/breakdown/">{t.breakdown}</Link></nav>
    </section>
    <SiteFooter language={language} />
  </main>;
}
