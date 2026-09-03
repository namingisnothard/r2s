import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '../site-chrome';

export const metadata: Metadata = {
  title: 'Pipeline Breakdown — Real2Sim Frontier',
  description: 'A visual artifact-by-artifact breakdown of the intermediate stages shared by real-to-simulation and human-to-robot pipelines.',
};

type BreakdownStage = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  question: string;
  result: string;
  artifacts: Array<{ name: string; format: string; purpose: string }>;
  tools: string[];
  pipelines: Array<{ name: string; href: string }>;
  gate: string;
};

const toolId = (name: string) => `tool-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

const stages: BreakdownStage[] = [
  {
    id:'capture', number:'01', title:'Capture + calibration', subtitle:'Evidence becomes a synchronized measurement bundle.',
    question:'Which pixel, pose, joint sample, and tactile event describe the same instant—and in whose coordinate frame?',
    result:'Time-aligned sensor streams plus an explicit frame graph. This is the provenance layer every later estimate should be able to trace back to.',
    artifacts:[
      { name:'RGB / RGB-D / ego video', format:'.VRS · .MP4 · PNG/JPEG', purpose:'Raw visual evidence and timestamps' },
      { name:'Camera + sensor calibration', format:'.JSON · .YAML', purpose:'Intrinsics, distortion, extrinsics, gravity' },
      { name:'Robot / wearable state', format:'.MCAP · ROSBAG2 · .CSV', purpose:'Joints, IMU, gaze, force, tactile, events' },
    ],
    tools:['Project Aria Tools','Ropedia HOMIE / Xperience','EgoSuite-Open100K'],
    pipelines:[{name:'AINA',href:'https://aina-robot.github.io/'},{name:'EgoEngine',href:'https://egoengine.github.io/'},{name:'Ego2Robot',href:'https://www-ye.github.io/ego2robot_blog/'}],
    gate:'Check clock drift, dropped frames, scale, gravity, hand–eye calibration, and whether the recording can be replayed deterministically.',
  },
  {
    id:'geometry', number:'02', title:'Geometry + camera motion', subtitle:'Images become rays, depth, points, cameras, and surfaces.',
    question:'What metric 3D arrangement could have produced the views, including camera motion and occluded structure?',
    result:'A world-aligned geometric scaffold. It may be sparse or dense, but its scale, coordinates, visibility, and uncertainty must be explicit.',
    artifacts:[
      { name:'Depth / confidence', format:'.EXR · .TIFF · tensor', purpose:'Per-pixel range and reliability' },
      { name:'Cameras / trajectories', format:'COLMAP .BIN/.TXT · .JSON', purpose:'SE(3) poses, intrinsics, timestamps' },
      { name:'Point cloud / visual mesh', format:'.PLY · .OBJ · .GLB', purpose:'Scene shape for fusion and rendering' },
    ],
    tools:['FoundationStereo','VGGT','MoGe','VidMap','Depth Anything 3'],
    pipelines:[{name:'Agentic Real2Sim',href:'https://arxiv.org/abs/2607.19190'},{name:'RoboSnap',href:'https://robosnap.github.io/'},{name:'EgoEngine',href:'https://egoengine.github.io/'},{name:'EgoSim',href:'https://egosimulator.github.io/'}],
    gate:'Hold out views. Measure reprojection, depth, camera drift, metric scale, and downstream pose stability—not only novel-view beauty.',
  },
  {
    id:'scene-state', number:'03', title:'Entities + scene state', subtitle:'Geometry becomes objects, tracks, relations, and task state.',
    question:'Which surfaces belong together, which object persists through occlusion, and what relations or changes matter for the task?',
    result:'Instance masks, 6-DoF tracks, object evidence bundles, and—when useful—a scene graph binding identity to geometry, semantics, motion, and relations.',
    artifacts:[
      { name:'Masks / tracks', format:'.PNG · RLE/COCO .JSON', purpose:'Pixel ownership and persistent identity' },
      { name:'Object poses', format:'4×4 SE(3) · .NPY · .JSON', purpose:'World/object transforms through time' },
      { name:'Structured scene state', format:'.JSON · graph DB · USD prims', purpose:'Entities, parts, edges, affordances, change' },
    ],
    tools:['SAM 3','FoundationPose','ConceptGraphs','Lucida evidence graph','Khronos'],
    pipelines:[{name:'Lucida',href:'https://lucida-r2s.github.io/'},{name:'Agentic Real2Sim',href:'https://arxiv.org/abs/2607.19190'},{name:'RoboSnap',href:'https://robosnap.github.io/'},{name:'SimFoundry',href:'https://research.nvidia.com/labs/gear/simfoundry/'}],
    gate:'Audit identity switches, amodal extent, pose drift, relation consistency, and whether task-relevant parts—handles, lids, joints—are represented.',
  },
  {
    id:'assets', number:'04', title:'Appearance + asset completion', subtitle:'Partial evidence becomes renderable, editable digital assets.',
    question:'What should be reconstructed from evidence, and what may be plausibly completed by a generative prior?',
    result:'A hybrid scene: evidence-backed background appearance, completed object geometry, UV/PBR materials, and explicit provenance for generated regions.',
    artifacts:[
      { name:'Neural appearance', format:'3DGS .PLY/.SPLAT · NeRF checkpoint', purpose:'Photoreal view-dependent background' },
      { name:'Renderable object asset', format:'.GLB · .OBJ · .USD', purpose:'Editable mesh, hierarchy, visual topology' },
      { name:'Materials / textures', format:'PNG/EXR · KTX2 · MaterialX', purpose:'Albedo, roughness, metallic, normals' },
    ],
    tools:['GPT Image 2','SAM 3D','TRELLIS.2','Hunyuan3D 2.1','Material Anything','NVIDIA 3DGRUT'],
    pipelines:[{name:'Lucida',href:'https://lucida-r2s.github.io/'},{name:'RoboSnap',href:'https://robosnap.github.io/'},{name:'SimFoundry',href:'https://research.nvidia.com/labs/gear/simfoundry/'},{name:'WorldComposer',href:'https://stubborn111.github.io/WorldComposer/'}],
    gate:'Separate observed from generated content. Inspect topology, scale, texture bake, transparency, hidden surfaces, licenses, and editability.',
  },
  {
    id:'physics', number:'05', title:'Simulation compile + physics', subtitle:'Visual assets become bodies that can collide, move, reset, and be measured.',
    question:'Which representation is needed for contact, articulation, mass, friction, compliance, sensing, and stable time integration?',
    result:'A simulator-loadable scene with visual and collision geometry, body/joint trees, physical parameters, sensors, initial state, reset logic, and action interface.',
    artifacts:[
      { name:'Collision proxies', format:'.OBJ · .STL · convex hulls/SDF', purpose:'Stable, economical contact geometry' },
      { name:'Scene / robot description', format:'.USD · .URDF · MJCF .XML · .SDF', purpose:'Bodies, joints, materials, sensors, frames' },
      { name:'Dynamics + task config', format:'.YAML · .JSON · Python config', purpose:'Mass, friction, solver, reset, rewards' },
    ],
    tools:['PhysTwin','SuperDex Physics','Material Anything'],
    pipelines:[{name:'SimFoundry',href:'https://research.nvidia.com/labs/gear/simfoundry/'},{name:'RialTo',href:'https://real-to-sim-to-real.github.io/RialTo/'},{name:'GaussGym',href:'https://gauss-gym.com/'},{name:'World Labs R2S2R',href:'https://www.worldlabs.ai/blog/real-to-sim-to-real'}],
    gate:'Run drop, settle, grasp, articulation, penetration, and matched-action replay tests. A visual mesh is not a collision mesh; a stable replay is not yet reality alignment.',
  },
  {
    id:'retargeting', number:'06', title:'Retargeting + feasibility', subtitle:'Human or source motion becomes executable target-robot intent.',
    question:'Which task invariants—contact, end-effector path, object change, balance, style—should survive a different morphology?',
    result:'Target joint or task-space trajectories with contact goals, timing, feasibility flags, and a controller-compatible action convention.',
    artifacts:[
      { name:'Human / source motion', format:'SMPL(X) · MANO · BVH · SE(3)', purpose:'Body, hand, object, and contact reference' },
      { name:'Robot reference', format:'.NPY · .CSV · trajectory message', purpose:'Joint q/dq or end-effector targets' },
      { name:'Feasibility evidence', format:'rollout log · contact trace · mask', purpose:'Limits, collision, balance, trackability' },
    ],
    tools:['GMR','Mink','Pinocchio','SPIDER','H2O / OmniH2O'],
    pipelines:[{name:'H2O',href:'https://human2humanoid.com/'},{name:'EgoEngine',href:'https://egoengine.github.io/'},{name:'HumanX',href:'https://wyhuai.github.io/human-x/'},{name:'Qwen-RobotManip',href:'https://github.com/QwenLM/Qwen-RobotManip'}],
    gate:'Report IK/task error, joint-limit and collision violations, contact preservation, simulator trackability, success yield, and what rejected trajectories looked like.',
  },
  {
    id:'policy-loop', number:'07', title:'Rollout + policy + reality loop', subtitle:'Executable worlds and demonstrations become behavior—and evidence about the simulator.',
    question:'Does simulated experience improve physical behavior, preserve policy ranking, and reveal failure boundaries?',
    result:'Training episodes, learned policies/controllers, held-out evaluation, hardware rollouts, and residuals that can update the scene, dynamics, curriculum, or model.',
    artifacts:[
      { name:'Episode dataset', format:'LeRobot · RLDS · HDF5 · replay buffer', purpose:'Observations, actions, rewards, metadata' },
      { name:'Policy / controller', format:'.PT · .SAFETENSORS · .ONNX', purpose:'Deployable behavior and normalization' },
      { name:'Reality-alignment report', format:'.PARQUET · .JSON · dashboard', purpose:'Success, correlation, throughput, residuals' },
    ],
    tools:['Diffusion Policy','HPT','LeRobot','Qwen-RobotManip','GEN-1.5'],
    pipelines:[{name:'SimFoundry',href:'https://research.nvidia.com/labs/gear/simfoundry/'},{name:'EgoEngine',href:'https://egoengine.github.io/'},{name:'RLDX-1',href:'https://www.rlwrld.ai/ko/insight/blog/14'},{name:'World Labs R2S2R',href:'https://www.worldlabs.ai/blog/real-to-sim-to-real'}],
    gate:'Pair sim and real trials. Track success confidence intervals, policy-rank correlation, throughput, conversion yield, compute, interventions, and failure taxonomy.',
  },
];

function StageVisual({ stage }: { stage: string }) {
  if (stage === 'capture') return <div className="breakdown-visual capture-visual" role="img" aria-label="Three synchronized camera streams aligned to an IMU and joint-state timeline"><div className="capture-frames"><i /><i /><i /></div><div className="capture-track"><span /><span /><span /><span /><span /></div><b>SYNCED t</b></div>;
  if (stage === 'geometry') return <div className="breakdown-visual geometry-visual" role="img" aria-label="Camera frustums observing a colored depth point cloud"><i className="camera-one" /><i className="camera-two" /><div className="point-cloud">{Array.from({length:24},(_,i)=><span key={i} />)}</div><b>METRIC XYZ</b></div>;
  if (stage === 'scene-state') return <div className="breakdown-visual state-visual" role="img" aria-label="Segmented objects connected in a structured scene graph"><div className="mask-shape mask-a" /><div className="mask-shape mask-b" /><div className="graph-line line-a" /><div className="graph-line line-b" /><i>cup</i><i>table</i><i>hand</i><b>ON · NEAR · HOLDS</b></div>;
  if (stage === 'assets') return <div className="breakdown-visual asset-visual" role="img" aria-label="Partial pixels completed into a textured mesh and material layers"><div className="asset-input" /><span>→</span><div className="asset-object"><i /><i /><i /></div><div className="material-strips"><i /><i /><i /></div><b>VISUAL ASSET</b></div>;
  if (stage === 'physics') return <div className="breakdown-visual physics-visual" role="img" aria-label="Visual mesh paired with simplified collision geometry and contact forces"><div className="physics-object" /><div className="collision-hull" /><div className="floor-line" /><i className="force-one">↓</i><i className="force-two">↗</i><b>COLLISION + MASS + μ</b></div>;
  if (stage === 'retargeting') return <div className="breakdown-visual retarget-visual" role="img" aria-label="Human skeleton constraints mapped to a robot kinematic chain"><div className="human-rig"><i /><span /><span /><span /><span /></div><em>CONTACT<br />+ TASK</em><div className="robot-rig"><i /><span /><span /><span /><span /></div><b>q(t) · SE(3)</b></div>;
  return <div className="breakdown-visual policy-visual" role="img" aria-label="Parallel simulated rollouts feeding a policy and returning a reality residual"><div className="rollout-grid">{Array.from({length:9},(_,i)=><i key={i} />)}</div><span>π</span><div className="reality-bars"><i /><i /><i /></div><b>SIM → POLICY → REAL → Δ</b></div>;
}

const contracts = [
  { boundary:'Capture → geometry', must:'Timestamps, intrinsics, distortion, extrinsics, units, gravity, frame names', failure:'Ghost surfaces, scale error, drifting poses' },
  { boundary:'Geometry → scene state', must:'Per-frame cameras, depth confidence, instance evidence, world/object transforms', failure:'Identity switches, floating assets, wrong occlusion' },
  { boundary:'Scene state → assets', must:'Instance IDs, observed-region masks, partial points, scale, category and provenance', failure:'Hallucinated shape replaces measured evidence' },
  { boundary:'Assets → simulator', must:'Visual mesh, collision proxy, body/joint tree, materials, mass/inertia, initial state', failure:'Pretty but non-interactive or unstable worlds' },
  { boundary:'Motion → robot', must:'Source/target frames, joint convention, TCP, contacts, timing, limits, controller interface', failure:'Correct-looking motion that is unreachable or unsafe' },
  { boundary:'Simulator → learning', must:'Observation/action schema, reset, reward/success, randomization, seeds, provenance', failure:'Episodes that cannot be reproduced or compared' },
  { boundary:'Learning → reality', must:'Frozen evaluation, paired trials, confidence intervals, logs, residual update path', failure:'Demo success without transferable evidence' },
];

export default function BreakdownPage() {
  return (
    <main id="top">
      <SiteHeader active="breakdown" />
      <section className="subpage-hero breakdown-subpage-hero">
        <div><p className="eyebrow">PIPELINE BREAKDOWN · INTERMEDIATE ARTIFACTS</p><h1>What exists <em>between</em> video and policy?</h1></div>
        <div className="subpage-intro"><p>A visual anatomy of the intermediate results that different real2sim systems repeatedly produce. Each stage names its artifact contract, typical formats, reusable Capability Stack tools, and representative pipelines.</p><div><span>7 shared stages</span><span>21 artifact classes</span><span>Reality gates</span><span>Stack-linked</span></div><a className="button secondary" href="#spine">Trace the shared spine ↓</a></div>
      </section>

      <section className="breakdown-spine" id="spine">
        <div className="breakdown-heading"><div><p className="eyebrow">THE SHARED SPINE</p><h2>The hand-offs are the system.</h2></div><p>Papers package these boundaries differently, skip some entirely, or keep them latent. The diagram shows the most reusable explicit decomposition—not a claim that every pipeline must be linear.</p></div>
        <div className="spine-flow">{stages.map((stage, index)=><a href={`#${stage.id}`} key={stage.id}><small>{stage.number}</small><strong>{stage.title.split(' + ')[0]}</strong><span>{index < stages.length - 1 ? '→' : '↺'}</span></a>)}</div>
        <div className="spine-legend"><span><i />Measured evidence</span><span><i />Estimated state</span><span><i />Generated completion</span><span><i />Executable contract</span></div>
      </section>

      <section className="breakdown-stages" aria-label="Real2Sim intermediate stages">
        {stages.map((stage)=><article className="breakdown-stage" id={stage.id} key={stage.id}>
          <header><span>{stage.number}</span><div><small>{stage.subtitle}</small><h2>{stage.title}</h2><p>{stage.question}</p></div></header>
          <div className="breakdown-stage-body">
            <StageVisual stage={stage.id} />
            <div className="breakdown-result"><small>INTERMEDIATE RESULT</small><p>{stage.result}</p><strong>Reality gate</strong><p>{stage.gate}</p></div>
            <div className="artifact-stack"><small>COMMON ARTIFACTS / FORMATS</small>{stage.artifacts.map((artifact)=><div key={artifact.name}><strong>{artifact.name}</strong><code>{artifact.format}</code><p>{artifact.purpose}</p></div>)}</div>
          </div>
          <div className="breakdown-evidence">
            <div><small>CAPABILITY STACK · TOOLS / MODULES</small><nav>{stage.tools.map((tool)=><Link href={`/capabilities/?tool=${encodeURIComponent(tool)}#${toolId(tool)}`} key={tool}>{tool} ↗</Link>)}</nav></div>
            <div><small>REPRESENTATIVE PIPELINES USING THIS STAGE</small><nav>{stage.pipelines.map((pipeline)=><a href={pipeline.href} target="_blank" rel="noreferrer" key={pipeline.name}>{pipeline.name} ↗</a>)}</nav></div>
          </div>
        </article>)}
      </section>

      <section className="contract-section" id="contracts">
        <div className="breakdown-heading light"><div><p className="eyebrow">INTERFACE CONTRACTS</p><h2>What must survive each boundary.</h2></div><p>Most pipeline failures are not isolated model errors. They are lost units, frames, timestamps, identity, topology, action conventions, or evaluation provenance at module hand-off.</p></div>
        <div className="contract-table" role="table" aria-label="Real2Sim interface contracts">
          <div className="contract-row contract-head" role="row"><span role="columnheader">Boundary</span><span role="columnheader">Minimum explicit contract</span><span role="columnheader">Typical silent failure</span></div>
          {contracts.map((item)=><div className="contract-row" role="row" key={item.boundary}><strong role="cell">{item.boundary}</strong><p role="cell">{item.must}</p><p role="cell">{item.failure}</p></div>)}
        </div>
        <div className="contract-note"><strong>Reading rule</strong><p>A tool appearing in a stage means it can produce or transform that stage’s artifact—not that it supplies the entire contract. Follow the Stack link for availability, deployment mode, metrics, and verified downstream use.</p><Link className="button secondary" href="/capabilities/">Open Capability Stack ↗</Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}
