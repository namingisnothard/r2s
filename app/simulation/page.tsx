import type { Metadata } from 'next';
import Link from 'next/link';
import { adjacentInfrastructure, efficiencyDimensions, efficiencyReports, generativeModes, overheadTransitions, realityAlignmentLevels, simulationDatasets, simulationOpenQuestions } from '../data';
import { SiteFooter, SiteHeader } from '../site-chrome';

export const metadata: Metadata = {
  title: 'Simulation Data & Economics — Real2Sim Frontier',
  description: 'Simulation datasets, engines, throughput, reality alignment, training and evaluation utility for real-to-sim robot learning.',
};

const reportedHours = [
  { name:'EgoSuite live', value:10000, kind:'Human capture' },
  { name:'InternData-A1', value:7433.9, kind:'Synthetic' },
  { name:'RoboCasa365', value:2200, kind:'Synthetic' },
  { name:'Nymeria', value:340.05, kind:'Human capture' },
  { name:'HOT3D', value:13.88, kind:'Human capture' },
];

const throughputSignals = [
  { name:'RoboSnap', value:417, unit:'trajectories / h', note:'≈10k/day on 8× RTX 4090' },
  { name:'Baton', value:400, unit:'demos / h', note:'human glove capture' },
  { name:'RLWRLD', value:200, unit:'demos / h', note:'company-reported human-derived' },
  { name:'VR teleop baseline', value:41, unit:'demos / h', note:'implied by Baton 9.85× comparison' },
];

export default function SimulationPage() {
  const roleCounts = simulationDatasets.reduce<Record<string, number>>((counts, item) => {
    counts[item.role] = (counts[item.role] ?? 0) + 1;
    return counts;
  }, {});
  const maxHours = Math.max(...reportedHours.map((item) => item.value));
  const maxThroughput = Math.max(...throughputSignals.map((item) => item.value));

  return <main id="top">
    <SiteHeader active="simulation" />
    <section className="subpage-hero simulation-subpage-hero">
      <div><p className="eyebrow">SIMULATION · DATA × ECONOMICS × VALIDATION</p><h1>Count useful experience, <em>not synthetic volume.</em></h1></div>
      <div className="subpage-intro"><p>A separate analytical view of engines, datasets, throughput, conversion yield, training value, evaluation coverage, and reality alignment.</p><div><span>{simulationDatasets.length} datasets</span><span>{efficiencyReports.length} system ledgers</span><span>{realityAlignmentLevels.length} validation levels</span></div><Link className="button secondary" href="/pipelines/">← Return to technical atlas</Link></div>
    </section>

    <section className="simulation-dashboard" id="dashboard" aria-label="Simulation data dashboard">
      <div className="simulation-chart-grid">
        <article className="sim-chart"><header><span>01 · REPORTED HOURS</span><h3>Hours with a disclosed clock</h3></header><div className="horizontal-bars">{reportedHours.map((item) => <div key={item.name}><label><b>{item.name}</b><span>{item.value.toLocaleString()} h · {item.kind}</span></label><i><b style={{width:`${Math.max(1.5, item.value / maxHours * 100)}%`}} /></i></div>)}</div><p>EgoSuite’s 100k-hour total is a plan; this chart uses the 10k hours reported live. Log scale is intentionally avoided, so small corpora remain visually small.</p></article>
        <article className="sim-chart"><header><span>02 · DATASET ORIENTATION</span><h3>Training versus evaluation intent</h3></header><div className="role-bars">{Object.entries(roleCounts).sort((a,b) => b[1] - a[1]).map(([role, count]) => <div key={role}><span>{role}</span><i style={{width:`${count / simulationDatasets.length * 100}%`}} /><b>{count}</b></div>)}</div><p>Role describes the project’s central protocol, not a prohibition: evaluation assets may train adapters, and training corpora can support new held-out splits.</p></article>
        <article className="sim-chart sim-chart-wide"><header><span>03 · THROUGHPUT SIGNALS</span><h3>Reported production rate—kept in context</h3></header><div className="throughput-bars">{throughputSignals.map((item) => <div key={item.name}><label><b>{item.name}</b><span>{item.value} {item.unit}</span></label><i><b style={{width:`${item.value / maxThroughput * 100}%`}} /></i><small>{item.note}</small></div>)}</div><p>Bar length compares numerical rate only. RoboSnap’s GPU-generated trajectories and Baton’s natural human demonstrations have different cost, diversity, acceptance, and downstream value.</p></article>
      </div>
      <div className="dashboard-verdict"><span>THE MISSING CHART</span><strong>Δ real success per operator-hour + GPU-hour + hardware trial</strong><p>No tracked system reports the complete cost-and-value denominator needed to plot this fairly.</p></div>
    </section>

    <section className="microduck-case" id="microduck">
      <div className="section-heading"><div><p className="eyebrow">CASE STUDY · POLLEN ROBOTICS MICRODUCK</p><h2>Sim2Real first; policy learning throughout.</h2></div><p>MicroDuck is a clean example of a modern compact-robot learning stack. It should not be described as full Real2Sim: its simulated body comes from CAD, while the reality gap is handled with engineered actuator models and randomized parameters.</p></div>
      <div className="microduck-verdicts">
        <article><span>REAL2SIM</span><strong>LOW · indirect</strong><p>No camera/scan-to-world reconstruction or automatic system identification. Real hardware knowledge enters through servo, backlash, latency, battery, and friction parameters.</p></article>
        <article className="primary"><span>SIM2REAL</span><strong>PRIMARY</strong><p>A MuJoCo-trained policy is exported to ONNX and executed at the same 50 Hz control rate on the onboard RK3566 computer.</p></article>
        <article className="primary"><span>POLICY LEARNING</span><strong>PRIMARY</strong><p>PPO trains whole-body behaviors over 4,096 parallel mjlab environments using 61-D observations and 14-D actions.</p></article>
      </div>
      <div className="microduck-flow" aria-label="MicroDuck sim-to-real pipeline">
        <div><small>01 · MODEL</small><b>Onshape CAD → MJCF</b><span>Robot morphology and joint structure</span></div><i>→</i>
        <div><small>02 · ALIGN</small><b>BAM + backlash + delay</b><span>XL330 voltage and friction behavior</span></div><i>→</i>
        <div><small>03 · ROBUSTIFY</small><b>Domain randomization</b><span>Battery sag · latency · friction</span></div><i>→</i>
        <div><small>04 · LEARN</small><b>mjlab / MuJoCo Warp + PPO</b><span>4,096 environments · 1–2 h gait</span></div><i>→</i>
        <div><small>05 · DEPLOY</small><b>ONNX policy at 50 Hz</b><span>Physical MicroDuck runtime</span></div>
      </div>
      <div className="microduck-ledger"><div><span>OBSERVATION</span><p>61 values: 48 proprioceptive features plus task commands.</p></div><div><span>ACTION</span><p>14 joint actions; the main runtime coordinates a 15-servo machine.</p></div><div><span>TRANSFER TOOLS</span><p>Voltage-aware BAM actuator model, ±1° backlash variants, delayed control, encoder-after-backlash state, and dynamics randomization.</p></div><div><span>EVIDENCE LIMIT</span><p>The repository reports a useful gait after 1–2 hours and demonstrates multiple skills, but gives no standardized aggregate hardware success rate or ablated Real2Sim calibration benchmark.</p></div></div>
      <nav className="microduck-links"><a href="https://github.com/pollen-robotics/microduck" target="_blank" rel="noreferrer">Robot runtime ↗</a><a href="https://github.com/pollen-robotics/microduck_rl" target="_blank" rel="noreferrer">RL stack ↗</a></nav>
    </section>

    <section className="sim-data-section" id="sim-data">
      <div className="section-heading"><div><p className="eyebrow">SIMULATION · STATIC × MOTION × DYNAMICS</p><h2>What exactly is being simulated?</h2></div><p>“Video simulator” now names several different contracts. Motion describes an observed change; dynamics predicts what will happen under a new action. The distinction matters whenever a rollout is used as evidence for control.</p></div>
      <details className="simulation-disclosure" open><summary><span>01 · SIMULATION TAXONOMY</span><strong>State, intervention, and prediction contract</strong><i>＋</i></summary><div>
      <div className="simulation-ladder" aria-label="Simulation readiness ladder"><div><span>01</span><b>Static scene</b><small>geometry + appearance</small></div><i>→</i><div><span>02</span><b>Temporal replay</b><small>what happened</small></div><i>→</i><div><span>03</span><b>Editable kinematics</b><small>motion constraints</small></div><i>→</i><div><span>04</span><b>Generative transition</b><small>action → observation</small></div><i>→</i><div><span>05</span><b>Identified dynamics</b><small>forces + contacts</small></div><i>→</i><div><span>06</span><b>Closed-loop validated</b><small>policy ↔ hardware</small></div></div>
      <div className="generative-heading"><div><p className="eyebrow">MODEL TAXONOMY</p><h2>Four things now called a simulator.</h2></div><p>The useful question is not whether a system generates video. It is what state persists, what intervention it accepts, and which downstream decision its prediction can support.</p></div>
      <div className="generative-grid">{generativeModes.map((item, index) => <article key={item.kind}><span>{String(index + 1).padStart(2,'0')} · {item.kind}</span><h3><a href={item.href} target="_blank" rel="noreferrer">{item.system} ↗</a></h3><dl><div><dt>State</dt><dd>{item.state}</dd></div><div><dt>Conditioned by</dt><dd>{item.conditioning}</dd></div><div><dt>Predicts</dt><dd>{item.predicts}</dd></div><div><dt>Useful for</dt><dd>{item.use}</dd></div></dl><p><b>Boundary</b>{item.boundary}</p></article>)}</div>
      </div></details>
      <details className="simulation-disclosure" id="efficiency"><summary><span>02 · ECONOMICS + EVIDENCE</span><strong>Throughput, datasets, alignment, and overhead</strong><i>＋</i></summary><div>
      <div className="efficiency-heading"><div><p className="eyebrow">SYSTEM ECONOMICS · THROUGHPUT × VALUE</p><h2>How much useful reality per unit cost?</h2></div><p>Scene minutes, accepted trajectories, GPU throughput, and policy success measure different stages. The ledger keeps them separate and records the reality-alignment evidence behind each efficiency claim.</p></div>
      <div className="efficiency-equation"><span>PROPOSED REAL2SIM ROI</span><strong>(policy improvement × validated reuse)</strong><i>÷</i><strong>(capture + operator + compute + validation cost)</strong><small>No tracked system reports this complete numerator and denominator yet.</small></div>
      <div className="efficiency-table-shell"><table className="efficiency-table"><thead><tr><th>System</th><th>Conversion throughput</th><th>Generation yield / throughput</th><th>Downstream data efficiency</th><th>Reality-alignment check</th><th>Accounting boundary</th></tr></thead><tbody>{efficiencyReports.map((item) => <tr key={item.name}><td><a href={item.href} target="_blank" rel="noreferrer">{item.name} ↗</a></td><td>{item.conversion}</td><td>{item.generation}</td><td>{item.downstream}</td><td className="alignment-cell">{item.alignment}</td><td className="boundary-cell">{item.boundary}</td></tr>)}</tbody></table></div>
      <p className="efficiency-note"><b>Do not rank systems by one column.</b> A low generation yield can still produce highly informative retained data; a fast generator can produce redundant trajectories; a photoreal scene can fail contact; and a successful replay on a small subset does not establish fleet-scale conversion reliability.</p>
      <div className="efficiency-subheading"><div><p className="eyebrow">MINIMUM REPORTING STANDARD</p><h3>Eight quantities needed for a fair comparison.</h3></div><p>Counts without cost, uniqueness, acceptance criteria, and held-out real outcomes are scale claims—not efficiency measurements.</p></div>
      <div className="efficiency-dimensions">{efficiencyDimensions.map((item) => <article key={item.number}><span>{item.number}</span><h4>{item.metric}</h4><p>{item.definition}</p><small>{item.unit}</small></article>)}</div>
      <div className="alignment-heading"><div><p className="eyebrow">REALITY ALIGNMENT</p><h3>A ladder, not one score.</h3></div><p>The validation target should rise with the downstream claim. Visual fidelity is sufficient for rendering research; policy training and evaluation require behavioral and hardware evidence.</p></div>
      <div className="alignment-ladder">{realityAlignmentLevels.map((item) => <article key={item.number}><span>{item.number} · {item.level}</span><h4>{item.check}</h4><b>{item.metrics}</b><p>{item.risk}</p></article>)}</div>
      <div className="sim-subheading dataset-heading"><div><p className="eyebrow">SIMULATION DATA · TRAINING × EVALUATION</p><h2>Data substrate, test instrument, or both?</h2></div><p>A dataset can be excellent for improving a learner and weak for measuring it—or the reverse. Claims stay attached to an engine, embodiment, protocol, and held-out distribution.</p></div>
      <div className="infrastructure-audit" aria-label="Adjacent real-to-sim infrastructure audit">{adjacentInfrastructure.map((item, index) => <a href={item.href} target="_blank" rel="noreferrer" key={item.name}><span>{String(index + 1).padStart(2,'0')} · ADJACENT INFRASTRUCTURE</span><h3>{item.name} ↗</h3><b>{item.classification}</b><dl><div><dt>Useful for</dt><dd>{item.usefulFor}</dd></div><div><dt>Not yet</dt><dd>{item.boundary}</dd></div></dl><small>{item.status}</small></a>)}</div>
      <div className="sim-table-shell"><table className="sim-data-table"><thead><tr><th>Dataset / role</th><th>Engine / embodiment</th><th>Scale</th><th>Training utility</th><th>Evaluation utility</th><th>What remains unresolved</th></tr></thead><tbody>{simulationDatasets.map((item) => <tr key={item.name}><td><span className={`dataset-role ${item.role === 'Evaluation-first' ? 'eval-first' : ''}`}>{item.role}</span><a href={item.href} target="_blank" rel="noreferrer">{item.name} ↗</a><small>{item.year}</small></td><td><strong>{item.engine}</strong><span>{item.embodiments}</span></td><td className="dataset-scale">{item.scale}</td><td>{item.training}</td><td>{item.evaluation}</td><td className="dataset-caution">{item.caution}</td></tr>)}</tbody></table></div>
      <p className="sim-table-note">Scale is reported by each project and is not normalized across action rate, episode length, generator success, or trajectory uniqueness. “Evaluation-first” describes the project’s central scientific use—not a prohibition on using released trajectories for training.</p>
      <div className="sim-subheading"><div><p className="eyebrow">OPEN QUESTIONS</p><h2>When is synthetic data actually useful?</h2></div><p>The scientific target is not maximum simulated hours. It is measurable information gain per unit of authoring, compute, and real-robot risk.</p></div>
      <div className="sim-question-grid">{simulationOpenQuestions.map((item) => <article key={item.number}><span>{item.number} · {item.title}</span><h3>{item.question}</h3><p>{item.body}</p></article>)}</div>
      <div className="overhead-panel"><header><div><p className="eyebrow">THE OVERHEAD THESIS</p><h2>Real-to-sim does not delete simulation work. It moves it.</h2></div><p>From manual asset and scenario authoring toward capture, reconstruction, calibration, verification, and reusable failure replay.</p></header><div className="overhead-flow"><span>TRADITIONAL COST</span><b>REAL-TO-SIM LEVER</b><i>RESIDUAL BOTTLENECK</i></div>{overheadTransitions.map((item) => <article key={item.legacy}><strong>{item.legacy}</strong><b>→ {item.lever}</b><p>{item.residual}</p></article>)}<aside><div><span>ENGINE + COMPANY CASE</span><h3>Genesis World / Genesis AI</h3></div><p>Genesis World combines multi-physics, rendering, sensors, and accelerated execution. Genesis AI’s simulation work connects that engine layer to workload infrastructure, asset generation, real-to-sim, policy training, and evaluation.</p><nav><a href="https://github.com/Genesis-Embodied-AI/Genesis" target="_blank" rel="noreferrer">Open engine ↗</a><a href="https://www.genesis.ai/blog/the-role-of-simulation-in-scalable-robotics-genesis-world-10-and-the-path-forward" target="_blank" rel="noreferrer">Company view ↗</a></nav></aside><aside className="superdex-case"><div><span>ENGINE WATCH · OPEN PLATFORM</span><h3>SuperDex</h3></div><p>SuperDex couples contact-first multiphysics with constraint-aware IK, tactile / tendon / soft-body models, authoring, and Gymnasium / Ray / RLlib interfaces. It is relevant infrastructure, not itself a real2sim paper.</p><nav><a href="https://projectsuperdex.com/" target="_blank" rel="noreferrer">Project ↗</a><a href="https://github.com/facebookresearch/project_superdex" target="_blank" rel="noreferrer">Source ↗</a></nav></aside></div>
      </div></details>
    </section>
    <SiteFooter />
  </main>;
}
