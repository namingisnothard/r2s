export type LineagePaper = {
  name: string;
  date: string;
  arxiv: string;
  advance: string;
  atlasName?: string;
};

export type ResearchLineage = {
  id: string;
  title: string;
  spine: string[];
  question: string;
  takeaway: string;
  papers: LineagePaper[];
};

export const researchLineages: ResearchLineage[] = [
  {
    id: 'neural-simulation', title: 'Neural rendering & policy simulation',
    spine: ['Reconstruct a scene', 'Render + simulate', 'Train or evaluate'],
    question: 'The architecture recurs; the objective shifts between visual transfer, learning, throughput, and evaluation.',
    takeaway: 'The meaningful changes are the learning loop, visual transfer, production efficiency, and evaluation validity; connecting 3DGS to a simulator is not sufficient evidence of progress by itself.',
    papers: [
      { name: 'RialTo', date: '2024-03', arxiv: '2403.03949', advance: 'Brings real demonstrations into digital twins through inverse distillation, then uses RL to improve robustness to disturbances.' },
      { name: 'SplatSim', date: '2024-09', arxiv: '2409.10161', advance: 'Reduces the RGB observation gap with Gaussian splatting and demonstrates zero-shot transfer of manipulation policies.' },
      { name: 'Re³Sim', date: '2025-02', arxiv: '2502.08645', advance: 'Connects reconstruction, cross-view rendering, and privileged-state expert demonstrations into a simulation data pipeline.' },
      { name: 'GaussGym', date: '2025-10', arxiv: '2510.15352', advance: 'Integrates photorealistic rendering into vectorized physics simulation to increase throughput for policies trained from pixels.' },
      { name: 'PolaRiS', date: '2025-12', arxiv: '2512.16881', advance: 'Uses paired simulation and real-world evaluations to test whether simulated performance predicts generalist policy performance.' },
    ],
  },
  {
    id: 'articulated-assets', title: 'Articulated & functional assets',
    spine: ['Recover parts', 'Infer joints', 'Export an interactive asset'],
    question: 'These systems recover parts and motion constraints, using either observed interaction or learned structural priors.',
    takeaway: 'Track structural complexity and relaxed capture requirements, while distinguishing a plausible generated joint from the correct joint of the observed object.',
    papers: [
      { name: 'Ditto', date: '2022-02', arxiv: '2202.08227', advance: 'Jointly recovers part geometry and articulation from observations before and after interaction.' },
      { name: 'Real2Code', date: '2024-06', arxiv: '2406.08474', advance: 'Expresses articulation as code generation, enabling reconstruction of more complex multi-part structures.' },
      { name: 'Articulate-Anything', date: '2024-10', arxiv: '2410.13882', advance: 'Combines a VLM, asset retrieval, and iterative proposal and critique to construct articulated objects automatically.' },
      { name: 'FunRec', atlasName: 'FunREC', date: '2026-04', arxiv: '2604.05621', advance: 'Recovers functional scenes from natural egocentric RGB-D interaction videos, reducing reliance on controlled capture and CAD priors.' },
    ],
  },
  {
    id: 'physical-identification', title: 'Physical identification & dynamics',
    spine: ['Observe or interact', 'Identify physical state', 'Predict a new response'],
    question: 'Explicit parameter identification, generative physical priors, and learned dynamics are distinct branches of this family.',
    takeaway: 'The strongest test is prediction under a new intervention: change the force, action, or contact sequence and check the response, beyond replaying an observed trajectory.',
    papers: [
      { name: 'PAC-NeRF', date: '2023-03', arxiv: '2303.05512', advance: 'Jointly estimates geometry and physical parameters, relaxing the known-geometry assumption in system identification.' },
      { name: 'PhysGaussian', date: '2023-11', arxiv: '2311.12198', advance: 'Uses Gaussian kernels for both rendering and continuum simulation, reducing geometry embedding steps; physical parameters still need to be supplied.' },
      { name: 'PhysDreamer', date: '2024-04', arxiv: '2404.13026', advance: 'Distills motion priors from a video generator into physical responses, with evidence centered on interaction plausibility.' },
      { name: 'Scalable Real2Sim', date: '2025-03', arxiv: '2503.00370', advance: 'Uses robotic interaction, joint torques, and a camera to acquire visual geometry, collision geometry, and inertial properties automatically.' },
      { name: 'SoMA', date: '2026-02', arxiv: '2602.02402', advance: 'Conditions soft-body neural dynamics on robot actions, enabling controllable responses beyond observed trajectories within the studied settings.' },
    ],
  },
  {
    id: 'motion-retargeting', title: 'Motion transfer & contact feasibility',
    spine: ['Recover human motion', 'Map between bodies', 'Enforce executable behavior'],
    question: 'Motion recovery and retargeting recur; the difficult boundary moves from pose matching to environment interaction and contact.',
    takeaway: 'The progression is pose similarity, executable motion, preserved interaction, and scalable contact-feasible data; interaction structure and dynamic feasibility remain complementary.',
    papers: [
      { name: 'DeepMimic', date: '2018-04', arxiv: '1804.02717', advance: 'Combines motion imitation and task rewards to learn control policies that respond to disturbances in physical simulation.' },
      { name: 'H2O · Human to Humanoid', atlasName: 'H2O', date: '2024-03', arxiv: '2403.04436', advance: 'Filters feasible motions with a privileged imitator and enables RGB-driven, whole-body teleoperation on a real humanoid.' },
      { name: 'VideoMimic', date: '2025-05', arxiv: '2505.03729', advance: 'Jointly reconstructs people and environments to learn contextual whole-body skills such as climbing stairs and sitting on chairs.' },
      { name: 'OmniRetarget', date: '2025-09', arxiv: '2509.26633', advance: 'Preserves spatial and contact relationships among the body, objects, and terrain through an interaction mesh.' },
      { name: 'SPIDER', date: '2025-11', arxiv: '2511.09484', advance: 'Uses physics-based sampling and a virtual-contact curriculum to turn kinematic demonstrations into dynamically feasible trajectories across embodiments.' },
    ],
  },
  {
    id: 'video-supervision', title: 'Video supervision & data scaling',
    spine: ['Recover video actions', 'Align or synthesize data', 'Pretrain a policy'],
    question: 'Hand recovery, camera compensation, action alignment, and curation recur; data sources, supervision needs, and scale differ.',
    takeaway: 'AINA reduces robot supervision, EgoScale studies scaling behavior, and Ego2Robot expands production and embodiment coverage; they do not measure the same axis of progress.',
    papers: [
      { name: 'ReBot', date: '2025-03', arxiv: '2503.14526', advance: 'Starts from existing robot trajectories and expands their training value through simulated object variation and real-background video synthesis.' },
      { name: 'VITRA', date: '2025-10', arxiv: '2510.21571', advance: 'Converts natural human activity videos into VLA pretraining data aligned in task granularity, language, and 3D actions.' },
      { name: 'AINA', date: '2025-11', arxiv: '2511.16661', advance: 'Uses smart-glasses 3D observations to learn multi-finger policies without robot training data or simulation on the evaluated tasks.' },
      { name: 'EgoScale', date: '2026-02', arxiv: '2602.16710', advance: 'Provides scaling evidence for human-action pretraining and transfers to dexterous hands through a small amount of aligned data.' },
      { name: 'Ego2Robot', date: '2026-08', arxiv: '2608.02580', advance: 'Scales action retargeting, robot visual synthesis, and multi-level quality curation into a large, multi-morphology training dataset.' },
    ],
  },
  {
    id: 'world-action-models', title: 'World models & action interfaces',
    spine: ['Condition a video model', 'Predict or update state', 'Plan or adapt a task'],
    question: 'A shared video-model foundation can support different abilities: persistent state, action control, or contextual task execution.',
    takeaway: 'State persistence, action controllability, and task conditioning are separate advances; their evidence does not yet establish a general, reliable physical simulator.',
    papers: [
      { name: 'EgoSim', date: '2026-04', arxiv: '2604.01001', advance: 'Updates explicit 3D scene state across interactions to reduce structural drift under viewpoint changes and multi-stage generation.' },
      { name: 'Masked Visual Actions', date: '2026-07', arxiv: '2607.19343', advance: 'Uses partially revealed pixel-space trajectories as an action interface, supporting forward prediction and inverse action inference in one model.' },
      { name: 'Zero-WAM', date: '2026-08', arxiv: '2608.26103', advance: 'Uses human video as an in-context task specification and trains against seen-task shortcuts to improve unseen-task execution.' },
    ],
  },
  {
    id: 'scene-production', title: 'Scene distributions & automated production',
    spine: ['Construct a twin', 'Vary or compile scenes', 'Validate usable outputs'],
    question: 'These systems compose existing capabilities to build training and evaluation environments; their value depends on end-to-end output.',
    takeaway: 'Measure human time per usable scene, conversion success, and downstream policy gains; runnable conversion and real-world policy improvement are different levels of evidence.',
    papers: [
      { name: 'ACDC · Automated Creation of Digital Cousins', atlasName: 'ACDC Digital Cousins', date: '2024-10', arxiv: '2410.07408', advance: 'Generates scene distributions that preserve geometric and semantic affordances, extending the objective beyond a single digital twin.' },
      { name: 'SimFoundry', date: '2026-06', arxiv: '2606.28276', advance: 'Connects video reconstruction and object, scene, and task editing, with evidence for real-world generalization and policy-evaluation correlation.' },
      { name: 'Agentic Real2Sim', date: '2026-07', arxiv: '2607.19190', advance: 'Automates tool use, coordinate alignment, and simulation assembly into runnable episodes across rigid, deformable, and humanoid scenes.' },
    ],
  },
];

export const composableGrasping: LineagePaper = {
  name: 'AdaRoboVLG', date: '2026-09', arxiv: '2609.04096',
  advance: 'Decouples task understanding from a physical grasping base policy, allowing spatial, cognitive, and temporal priors to guide cross-hand grasp synthesis without retraining that base policy.',
};

export const progressMilestones = [
  { date: '2018-04', title: 'Demonstrations become responsive control', papers: ['DeepMimic'], change: 'Example motion becomes a policy that responds to disturbances in physics.', axis: 'Control feasibility' },
  { date: '2022-02', title: 'Reconstruction becomes interactive', papers: ['Ditto'], change: 'The reconstructed object includes movable parts and joint structure.', axis: 'Functional structure' },
  { date: '2023-03', title: 'Geometry and physics are identified together', papers: ['PAC-NeRF'], change: 'Video-based physical identification relaxes the assumption that object geometry is already known.', axis: 'Assumption removed' },
  { date: '2024-03 → 09', title: 'Real-to-sim-to-real loops reach hardware', papers: ['RialTo', 'H2O · Human to Humanoid', 'SplatSim'], change: 'Different task settings connect real observations, simulation learning, and execution on real robots.', axis: 'Deployment evidence' },
  { date: '2024-10', title: 'A scene becomes a training distribution', papers: ['ACDC · Automated Creation of Digital Cousins'], change: 'Affordance-preserving scene variation becomes an explicit route to policy generalization.', axis: 'Distribution coverage' },
  { date: '2025-03', title: 'Robots acquire their own physical assets', papers: ['Scalable Real2Sim'], change: 'Active interaction and torque sensing reduce manual measurement during asset acquisition.', axis: 'Acquisition cost' },
  { date: '2025-05 → 11', title: 'Motion transfer accounts for interaction', papers: ['VideoMimic', 'OmniRetarget', 'SPIDER'], change: 'Environment context, interaction relationships, and contact feasibility become explicit parts of demonstration transfer.', axis: 'Contact feasibility' },
  { date: '2025-10 → 12', title: 'Simulation is judged by speed and usefulness', papers: ['GaussGym', 'PolaRiS'], change: 'Two independent fronts advance: training throughput and prediction of real-world policy performance.', axis: 'Efficiency + validity' },
  { date: '2026-02', title: 'Action-conditioned dynamics and human-data scaling', papers: ['SoMA', 'EgoScale'], change: 'Separate branches advance controllable soft-body prediction and large-scale human-to-robot transfer.', axis: 'Prediction + scale' },
  { date: '2026-04 → 08', title: 'World models gain state and action interfaces', papers: ['EgoSim', 'Masked Visual Actions', 'Zero-WAM'], change: 'Persistent state, unified action conditioning, and video-guided task generalization are tested as distinct capabilities.', axis: 'State + action grounding' },
  { date: '2026-06 → 09', title: 'Production and composition become research targets', papers: ['SimFoundry', 'Agentic Real2Sim', 'Ego2Robot', 'AdaRoboVLG'], change: 'Environment construction, data production, and modular capabilities scale; usable outputs and downstream validation determine their value.', axis: 'Production + composition' },
];
