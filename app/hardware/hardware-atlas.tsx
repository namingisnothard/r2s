'use client';
/* eslint-disable @next/next/no-img-element -- static export uses self-hosted, credited product imagery */

import { useMemo, useState } from 'react';
import { frontierHardwareEvidence, gloveEvidence, hardwarePlatforms } from '../data';

export function HardwareAtlas() {
  const [hardwareGrouping, setHardwareGrouping] = useState<'Category' | 'Company' | 'Country'>('Category');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const groupedHardware = useMemo(() => hardwarePlatforms.reduce<Record<string, typeof hardwarePlatforms>>((groups, item) => {
    const key = hardwareGrouping === 'Category' ? item.group : hardwareGrouping === 'Company' ? item.company : item.country;
    (groups[key] ??= []).push(item);
    return groups;
  }, {}), [hardwareGrouping]);
  const sortedGloves = useMemo(() => [...gloveEvidence].sort((a, b) => b.usedBy.length - a.usedBy.length || b.year - a.year || a.name.localeCompare(b.name)), []);

  return (
    <section className="hardware-section" id="atlas">
      <div className="section-heading"><div><p className="eyebrow">EMBODIMENT / HARDWARE ATLAS</p><h2>The body defines the interface.</h2></div><p>Joint count is only the first constraint. Cameras, grippers, torque sensing, control mode, morphology files, and simulator adapters decide whether a pipeline can actually cross embodiments.</p></div>
      <div className="hardware-toolbar">
        <div role="tablist" aria-label="Group hardware platforms"><span>GROUP BY</span>{(['Category','Company','Country'] as const).map((item) => <button key={item} role="tab" aria-selected={hardwareGrouping === item} onClick={() => setHardwareGrouping(item)}>{item}</button>)}</div>
        <div className="support-legend"><b>ORDER · VERIFIED USE ↓</b><span><i className="support-official" /> Official asset</span><span><i className="support-project" /> Project integration</span><span><i className="support-learned" /> Learned interface</span></div>
      </div>
      <div className="embodiment-interface-map" aria-label="Human-to-robot retargeting interfaces">
        <article><span>ARM CHAIN</span><h3>Wrist / object path → Cartesian targets → IK → joint motion</h3><p>Preserve reach, tool pose, collision clearance, and manipulability.</p></article>
        <article><span>DEXTEROUS HAND</span><h3>Human landmarks / contacts → correspondence → multi-joint pose</h3><p>Preserve fingertip relations, opposition, grasp shape, or object contact—not raw human angles.</p></article>
        <article><span>PARALLEL JAW</span><h3>Human grasp → TCP frame + aperture event</h3><p>Compress a high-dimensional hand into approach pose, width, close timing, and task effect.</p></article>
        <article><span>WHOLE BODY</span><h3>Body motion → contacts + base / CoM tasks → WBIK or control</h3><p>Balance, support, torque, and collision constraints extend beyond end-effector IK.</p></article>
      </div>
      <div className="glove-heading" id="gloves"><div><p className="eyebrow">GLOVE / WEARABLE CAPTURE</p><h2>The glove is an interface, not the retargeter.</h2></div><p>Wearables can recover occlusion-resistant finger motion, return robot contact to an operator, record human touch, or scale distributed collection. Those are different roles—and each leaves a different gap for the pipeline to solve.</p></div>
      <div className="glove-role-map" aria-label="Roles of gloves in human-to-robot learning">
        <article><span>HUMAN → DATA</span><h3>Kinematic capture</h3><p>Joint state or fingertip pose labels natural human demonstrations.</p></article>
        <article><span>ROBOT → HUMAN</span><h3>Haptic feedback</h3><p>Contact, pressure, or vibration improves operator awareness and demonstration quality.</p></article>
        <article><span>CONTACT → POLICY</span><h3>Tactile supervision</h3><p>Recorded normal / shear signals expose forces that video cannot identify.</p></article>
        <article><span>HOMES → FLEET</span><h3>Data operations</h3><p>Portable capture trades robot-time scarcity for calibration, QA, and embodiment-transfer work.</p></article>
      </div>
      <div className="glove-grid">{sortedGloves.map((item) => <article className="glove-card" key={item.name}>
        <header><div><span>{item.year} · {item.mode}</span><h3><a href={item.href} target="_blank" rel="noreferrer">{item.name} ↗</a></h3></div><b>{item.usedBy.length} verified {item.usedBy.length === 1 ? 'use' : 'uses'}</b></header>
        <dl><div><dt>Sensing</dt><dd>{item.sensing}</dd></div><div><dt>Transfer</dt><dd>{item.transfer}</dd></div><div><dt>Evidence</dt><dd>{item.evidence}</dd></div><div><dt>Access</dt><dd>{item.access}</dd></div></dl>
        <div className="glove-used"><small>USED BY / DIRECT EVIDENCE</small><nav>{item.usedBy.map((work) => <a href={work.href} target="_blank" rel="noreferrer" key={work.name}>{work.name} ↗</a>)}</nav></div>
        <p><b>Boundary:</b> {item.boundary}</p>
      </article>)}</div>
      <div className="glove-verdict"><span>WHEN DOES A GLOVE HELP?</span><p><strong>Prefer it</strong> when finger occlusion, capture throughput, or contact sensing dominates. <strong>Combine it with cameras / depth</strong> when object and scene state matter. <strong>Do not copy human joint angles blindly:</strong> retarget fingertips, hand-relative vectors, contacts, or task effects, then enforce the target hand’s joint and collision constraints.</p></div>
      <div className="frontier-hardware-heading"><div><p className="eyebrow">FRONTIER LAB HARDWARE DISCLOSURE</p><h2>Track the interface; do not invent the SKU.</h2></div><p>Physical Intelligence and Generalist publish useful embodiment and action-interface evidence, but often omit the exact commercial gripper or hand model. The distinction prevents a product photo from becoming a false attribution.</p></div>
      <div className="frontier-hardware-table-shell"><table className="frontier-hardware-table"><thead><tr><th>Lab / system</th><th>Disclosed embodiments</th><th>Hand / gripper interface</th><th>Disclosure boundary</th></tr></thead><tbody>{frontierHardwareEvidence.map((item) => <tr key={`${item.lab}-${item.system}`}><td><a href={item.href} target="_blank" rel="noreferrer">{item.lab}<strong>{item.system} ↗</strong></a></td><td>{item.embodiments}</td><td>{item.interface}</td><td>{item.disclosureBoundary}</td></tr>)}</tbody></table></div>
      {Object.entries(groupedHardware).sort(([nameA, platformsA], [nameB, platformsB]) => {
        const usageA = platformsA.reduce((total, item) => total + item.usedBy.length, 0);
        const usageB = platformsB.reduce((total, item) => total + item.usedBy.length, 0);
        return usageB - usageA || nameA.localeCompare(nameB);
      }).map(([group, platforms]) => {
        const groupUsage = platforms.reduce((total, item) => total + item.usedBy.length, 0);
        const sortedPlatforms = [...platforms].sort((a, b) => b.usedBy.length - a.usedBy.length || a.name.localeCompare(b.name));
        const expanded = expandedGroups.includes(group);
        const visiblePlatforms = expanded ? sortedPlatforms : sortedPlatforms.slice(0, 3);
        return <div className="hardware-group" key={group}>
          <header><span>{group}</span><small>{platforms.length} {platforms.length === 1 ? 'entry' : 'entries'} · {groupUsage} verified uses</small></header>
          <div className="hardware-grid">{visiblePlatforms.map((item) => <article className="hardware-card" key={item.name}>
            <a className="hardware-visual" href={item.imageSource} target="_blank" rel="noreferrer"><img src={`../${item.image}`} alt={item.imageAlt} loading="lazy" /><span>{item.imageLabel ?? 'Manufacturer product image'} ↗</span></a>
            <div className="hardware-body"><div className="hardware-identity"><div><span>{item.group}{item.style ? ` · ${item.style}` : ''}</span><h3><a href={item.href} target="_blank" rel="noreferrer">{item.name} ↗</a></h3></div><div><b>{item.company}</b><small>{item.country}</small></div></div>
              <dl className="hardware-specs"><div><dt>Joints / body</dt><dd>{item.joints}</dd></div><div><dt>End effector</dt><dd>{item.endEffector}</dd></div><div><dt>Sensing / control</dt><dd>{item.sensingControl}</dd></div></dl>
              <div className="hardware-sim"><small>SIMULATOR SUPPORT</small><div>{item.simulators.map((sim) => <span className={`support-${sim.status.split(' ')[0].toLowerCase()}`} key={`${sim.name}-${sim.status}`}><i />{sim.name}<b>{sim.status}</b></span>)}</div></div>
              <div className="hardware-used"><small>USED BY / EVIDENCE · {item.usedBy.length}</small><div>{item.usedBy.map((work) => <a href={work.href} target="_blank" rel="noreferrer" key={work.name}>{work.name} ↗</a>)}</div></div>
              <p className="hardware-note"><b>Read carefully:</b> {item.note}</p>
            </div>
          </article>)}</div>
          {sortedPlatforms.length > 3 && <button type="button" className="collection-reveal" onClick={() => setExpandedGroups((current) => expanded ? current.filter((item) => item !== group) : [...current, group])}><span>{expanded ? 'COLLAPSE GROUP' : `SHOW ALL ${group}`}</span><b>{expanded ? 'FIRST 3 ↑' : `${sortedPlatforms.length - 3} MORE ↓`}</b></button>}
        </div>;
      })}
    </section>
  );
}
