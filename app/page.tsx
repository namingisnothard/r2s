'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { capabilities, capabilityEvidence, capabilityStages, pipelines, pipelineSceneReports, type Domain, type Stage } from './data';
import { pipelineModules, type PipelineModule } from './pipeline-modules';
import { institutionFor } from './pipeline-institutions';
import { datasetProfileFor } from './pipeline-datasets';
import { publicationVenues } from './publication-venues';
import { capabilityDetailFor } from './capability-details';
import { SiteFooter, SiteHeader } from './site-chrome';

const stages: Stage[] = ['Geometry', 'Appearance', 'Physics', 'Retargeting', 'Policy'];
const stageColors = ['#0d6b5c', '#f26a3d', '#d8ff63', '#e6a9a0', '#78978b'];
type HardwareFacet = 'Arm / manipulator' | 'Bimanual' | 'Humanoid' | 'Dexterous hand' | 'Parallel gripper' | 'Quadruped' | 'Mobile / navigation' | 'Other robot' | 'NA';
const hardwareFacets: HardwareFacet[] = ['Arm / manipulator', 'Bimanual', 'Humanoid', 'Dexterous hand', 'Parallel gripper', 'Quadruped', 'Mobile / navigation', 'Other robot', 'NA'];
type TaskFacet = 'Manipulation' | 'Navigation';
const taskFacets: TaskFacet[] = ['Manipulation', 'Navigation'];
type LocomotionFacet = 'No locomotion modeled' | 'Wheeled / mobile base' | 'Legged' | 'Humanoid whole-body' | 'Learned locomotion' | 'Assumed / built-in control';
const locomotionFacets: LocomotionFacet[] = ['No locomotion modeled', 'Wheeled / mobile base', 'Legged', 'Humanoid whole-body', 'Learned locomotion', 'Assumed / built-in control'];
type BodyScope = 'Upper body / arms+' | 'Whole body';
const bodyScopes: BodyScope[] = ['Upper body / arms+', 'Whole body'];
const collisionMeshSystems = [
  { name:'Agentic Real2Sim', suffix:'.OBJ + .USD' },
  { name:'RoboSnap', suffix:'.OBJ + .PLY' },
  { name:'WorldComposer', suffix:'.USD' },
  { name:'GaussGym', suffix:'.OBJ + .PLY' },
  { name:'Scalable Real2Sim', suffix:'.OBJ' },
  { name:'Re³Sim', suffix:'.OBJ + .PLY' },
  { name:'PolaRiS', suffix:'MESH · SUFFIX N/R' },
  { name:'D-REX', suffix:'MESH · SUFFIX N/R' },
  { name:'Vid2Sim · Urban Navigation', suffix:'MESH · SUFFIX N/R' },
];
const pieGradient = (items: { count:number }[], colors: string[]) => {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return items.map((item, index) => {
    const start = items.slice(0, index).reduce((sum, prior) => sum + prior.count, 0) / total * 100;
    const end = start + item.count / total * 100;
    return `${colors[index]} ${start}% ${end}%`;
  }).join(', ');
};
const stageNotes: Record<Stage, string> = {
  Geometry: 'Recover cameras, depth, metric structure, meshes, and collision surfaces.',
  Appearance: 'Preserve scene-specific light, texture, reflections, and sensor appearance.',
  Physics: 'Assign or estimate mass, contact, articulation, and deformable material behavior.',
  Retargeting: 'Map human or source-robot motion onto a target embodiment and its constraints.',
  Policy: 'Generate demonstrations, train visuomotor policies, and evaluate transfer.',
};

const toolId = (name: string) => `tool-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
const verifiedUsageCount = (name: string) => (capabilityEvidence[name] ?? []).filter((item) => item.relation !== 'cites').length;
const monthRank: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const pipelineReleaseMonth = (date: string) => monthRank[date.split(' ')[0]] ?? 0;
const real2simRelevance = (item: (typeof pipelines)[number]) => {
  const components = stages.map((candidate) => ({ label:candidate, covered:item.stages.includes(candidate) }));
  const score = components.filter((component) => component.covered).length;
  return { components, score, band:score >= 4 ? 'HIGH' : score >= 2 ? 'MEDIUM' : 'LOW' };
};

const stageModulePatterns: Record<Stage, RegExp> = {
  Geometry:/calibr|segment|mask|depth|pose|track|geometry|recon|recover|mesh|point cloud|scene graph|slam|sfm|3d|4d/i,
  Appearance:/appearance|render|image|video|texture|inpaint|gaussian|splat|diffusion|generate|compose|novel.view|visual/i,
  Physics:/physics|simulat|dynamic|contact|collision|force|material|mass|friction|system.id|identify|randomization|rollout|world.model/i,
  Retargeting:/retarget|kinematic|\bik\b|mapping|correspond|align|transfer|robot.motion|action.interface|optimization|teleop/i,
  Policy:/policy|learn|train|\brl\b|reinforcement|imitation|behavior|deploy|planner|planning|control|vla|ppo|adapt/i,
};

const capabilityCategory = new Map(capabilities.map((capability) => [capability.name, capability.stage]));
const capabilityStageDefaults: Record<string, Stage[]> = {
  'Image generation':['Appearance'],
  '3D generation':['Geometry'],
  Geometry:['Geometry'],
  Appearance:['Appearance'],
  Segmentation:['Geometry'],
  'Hand recon':['Geometry'],
  'Body recon':['Geometry'],
  Pose:['Geometry'],
  'Scene graph / structured world state':['Geometry'],
  'Kinematics / IK':['Retargeting'],
  Physics:['Physics'],
  Retargeting:['Retargeting'],
  'Policy learning':['Policy'],
};

// Exact contextual exceptions for stack tools whose fine-grained category can
// contribute to more than one of the five pipeline stages.
const capabilityStageOverrides: Record<string, Stage[]> = {
  'Agentic Real2Sim::SAM 3D Objects':['Geometry', 'Appearance'],
  'Agentic Real2Sim::Humanoid BFM adapter':['Retargeting'],
  'Ego2Robot::Ego corpus / raw video':['Retargeting'],
  'RLDX-1::Bare-hand + object capture':['Geometry', 'Retargeting'],
  'World Labs Atlas::Omni diffusion transformer':['Geometry', 'Appearance', 'Physics'],
  'World Labs R2S2R::Controllable world variants':['Appearance', 'Physics'],
  'Masked Visual Actions::Masked entity motion':['Appearance', 'Retargeting'],
  'EgoSim::Wan2.1-Fun-14B-InP':['Appearance', 'Physics'],
  'Zero-WAM::Wan2.2-TI2V-5B':['Appearance', 'Policy'],
  'TraceGen::3D trace-space world model':['Policy'],
  'μ₀::3D trace world model':['Policy'],
  'HumanEgo::Aria egocentric demonstrations':['Geometry'],
  'AINA::Aria Gen 2 demonstrations':['Geometry'],
};

const stagesForCapabilityModule = (pipelineName:string, module:PipelineModule):Stage[] => {
  if (module.contributesTo) return module.contributesTo;
  const override = capabilityStageOverrides[`${pipelineName}::${module.name}`];
  if (override) return override;
  if (!module.capability) return [];
  const category = capabilityCategory.get(module.capability);
  const defaults = category ? capabilityStageDefaults[category] ?? [] : [];
  if (category === '3D generation' && /texture|pbr|appearance|renderable|visual/i.test(module.role)) return [...defaults, 'Appearance'];
  if (category === 'Video generation / world models') {
    const inferred = new Set<Stage>();
    if (/image|video|visual|render|inpaint|appearance|pixel/i.test(`${module.phase} ${module.role}`)) inferred.add('Appearance');
    if (/action.condition|dynamics|transition|physics|rollout|simulat|world model|forecast/i.test(`${module.phase} ${module.role}`)) inferred.add('Physics');
    return [...inferred];
  }
  if (category === 'Capture / data / annotation') {
    const inferred = new Set<Stage>();
    if (/3d|depth|pose|slam|reconstruct|geometry|hand/i.test(module.role)) inferred.add('Geometry');
    if (/action|retarget|robot motion|trajectory/i.test(module.role)) inferred.add('Retargeting');
    return [...inferred];
  }
  return defaults;
};

const stageEvidenceFor = (item:(typeof pipelines)[number], modules:PipelineModule[], stage:Stage) => {
  const matches = modules.map((module, index) => ({ module, index })).filter(({ module }) => !/capture|input|data|observe/i.test(module.phase) && stageModulePatterns[stage].test(`${module.phase} ${module.name} ${module.role}`));
  const implementation = matches.slice(0, 2).map(({ module }) => module.name).join(' + ');
  const fallback:Record<Stage, string> = { Geometry:item.representation, Appearance:item.representation, Physics:item.simulator, Retargeting:item.representation, Policy:item.output };
  const method = implementation || fallback[stage];
  const stackTools = [...new Set(modules.filter((module) => module.capability && stagesForCapabilityModule(item.name, module).includes(stage)).map((module) => module.capability as string))];
  const contracts:Record<Stage, { description:string; notation:string; inputEq:string; inputDetail:string; stepEq:string; stepDetail:string; outputEq:string; outputDetail:string }> = {
    Geometry:{
      description:'Estimates scene structure and spatial registration from sensor observations.',
      notation:'I: image · D: depth · Tᶜ_w: camera pose · P: points · Ĝ: estimated geometry',
      inputEq:'𝒪 = {Iₜ, Dₜ, Tᶜ_w, Pₜ}', inputDetail:item.input,
      stepEq:'Ĝ = fθ(𝒪)', stepDetail:method,
      outputEq:'Ĝ = {𝒳, T, 𝓜}', outputDetail:'Geometry · poses · masks',
    },
    Appearance:{
      description:'Models radiance or generates observations conditioned on geometry and viewpoint.',
      notation:'Ĝ: geometry · c: camera · ρ: density · α: opacity · z: latent · Î: rendered view',
      inputEq:'xₜ = (Ĝ, cₜ, Iₜ)', inputDetail:item.input,
      stepEq:'Îₜ = Rψ(Ĝ, cₜ)', stepDetail:method,
      outputEq:'Â = {ρ, c, α, z},  Î₁:ₜ', outputDetail:'Renderable appearance · image or video sequence',
    },
    Physics:{
      description:'Identifies physical parameters or predicts action-conditioned state transitions.',
      notation:'s: state · a: action · φ: physical parameters · Fφ: transition map · y: observation',
      inputEq:'xₜ = (ŝₜ, aₜ; φ)', inputDetail:item.representation,
      stepEq:'(ŝₜ₊₁, ŷₜ) = Fφ(ŝₜ, aₜ)', stepDetail:method,
      outputEq:'(φ̂phys, ŝ₁:ₜ)', outputDetail:item.simulator,
    },
    Retargeting:{
      description:'Maps human motion or task constraints into a robot-feasible action space.',
      notation:'qᴴ/qᴿ: human/robot configuration · 𝒦ᴿ: robot kinematics · 𝒞: constraints · Tκ: transfer map',
      inputEq:'x = (qᴴ₁:ₜ, 𝒦ᴿ, 𝒞)', inputDetail:item.input,
      stepEq:'(qᴿ, aᴿ) = Tκ(qᴴ, 𝒦ᴿ, 𝒞)', stepDetail:method,
      outputEq:'(qᴿ₁:ₜ, aᴿ₁:ₜ) ∈ 𝒬feasible', outputDetail:'Robot trajectory · executable action labels',
    },
    Policy:{
      description:'Fits an action distribution from demonstrations, rewards, or simulated rollouts.',
      notation:'𝒟: trajectories · o: observation · a: action · r: reward · ℓ: instruction · πθ: policy',
      inputEq:'𝒟 = {(oₜ, aₜ, rₜ)}ₜ₌₁ᵀ', inputDetail:item.representation,
      stepEq:'πθ ← BC(𝒟)  or  RL(Fφ, r)', stepDetail:method,
      outputEq:'aₜ ∼ πθ(· | o≤ₜ, ℓ)', outputDetail:item.output,
    },
  };
  return { ...contracts[stage], stackTools };
};

const publicationStatus = (item: (typeof pipelines)[number]) => publicationVenues[item.name] ?? { label:'Archival venue not verified', verified:false };
const outputFormatFor = (item: (typeof pipelines)[number]) => {
  const collision = collisionMeshSystems.find((system) => system.name === item.name);
  if (collision) return { category:'COLLISION MESH', suffix:collision.suffix, strict:true };
  const text = `${item.representation} ${item.output}`;
  if (item.name === 'MicroDuck') return { category:'POLICY', suffix:'.ONNX', strict:false };
  if (/URDF.*USD|USD.*URDF/i.test(text)) return { category:'ARTICULATED ASSET', suffix:'.URDF + .USD', strict:false };
  if (/\bUSD\b/i.test(text)) return { category:'SCENE ASSET', suffix:'.USD', strict:false };
  if (/MJCF/i.test(text)) return { category:'ROBOT MODEL', suffix:'.XML / MJCF', strict:false };
  if (/3DGS|Gaussian/i.test(text)) return { category:'GAUSSIAN SCENE', suffix:'.PLY / SPLAT', strict:false };
  if (/mesh/i.test(text)) return { category:'VISUAL / STATE MESH', suffix:'SUFFIX N/R', strict:false };
  if (/video/i.test(text)) return { category:'VIDEO / ROLLOUT', suffix:'.MP4 / TENSOR', strict:false };
  if (/policy|controller/i.test(item.output)) return { category:'POLICY', suffix:'CHECKPOINT N/R', strict:false };
  if (/trajectory|motion|joint/i.test(text)) return { category:'MOTION / TRAJECTORY', suffix:'ARRAY N/R', strict:false };
  if (/scene state|scene graph|world state/i.test(text)) return { category:'STRUCTURED STATE', suffix:'.JSON / GRAPH', strict:false };
  return { category:'METHOD OUTPUT', suffix:'SUFFIX N/R', strict:false };
};
const compactPublicationLabel = (item: (typeof pipelines)[number], publication: ReturnType<typeof publicationStatus>) => {
  const label = publication.label;
  const year = label.match(/(?:19|20)\d{2}/g)?.at(-1) ?? String(item.year);
  if (!publication.verified) {
    if (/arXiv/i.test(label)) return `ARXIV ${year}`;
    if (/workshop/i.test(label)) return `WORKSHOP ${year}`;
    if (/company|product/i.test(label)) return `COMPANY ${year}`;
    if (/software|project release/i.test(label)) return `SOFTWARE ${year}`;
    return `UNVERIFIED ${year}`;
  }
  if (/SIGGRAPH Asia/i.test(label)) return `SIGGRAPH ASIA ${year}`;
  if (/SIGGRAPH/i.test(label)) return `SIGGRAPH ${year}`;
  if (/CVPR/i.test(label)) return `CVPR ${year}`;
  if (/ICRA/i.test(label)) return `ICRA ${year}`;
  if (/IROS/i.test(label)) return `IROS ${year}`;
  if (/CoRL/i.test(label)) return `CoRL ${year}`;
  if (/ICLR/i.test(label)) return `ICLR ${year}`;
  if (/Robotics: Science and Systems|\bRSS\b/i.test(label)) return `RSS ${year}`;
  if (/Robotics and Automation Letters|RA-L/i.test(label)) return `RA-L ${year}`;
  if (/Transactions on Graphics/i.test(label)) return `TOG ${year}`;
  if (/Trends in Cognitive Sciences/i.test(label)) return `TICS ${year}`;
  if (/Visualization and Computer Animation/i.test(label)) return `JVCA ${year}`;
  if (/Robotics and Autonomous Systems/i.test(label)) return `RAS ${year}`;
  return `PEER REVIEWED ${year}`;
};
const hardwareProfileFor = (item: (typeof pipelines)[number]) => {
  const setup = item.embodiments.trim();
  const explicitlyNotApplied = /^(no |camera only|virtual |digital |human body only|simulated humanoid|cross-robot survey|humanoid robotics agenda)/i.test(setup)
    || /no (?:downstream |end-to-end |real )?robot/i.test(setup)
    || /no physical/i.test(setup);
  const hardwareSignal = /(robot|arm|manipulat|franka|ur\d|xarm|flexiv|kinova|widowx|sawyer|aloha|unitree|humanoid|quadruped|minitaur|laikago|spot|microduck|hoap|thormang|coman|theo|hrp|allex|rb-y1|rizon|droid|agibot|galaxea|trossen|arx|genie|r5a|gripper|dexterous)/i.test(setup);
  if (explicitlyNotApplied || !hardwareSignal) return { label:'NA', facets:['NA'] as HardwareFacet[], applied:false };
  const facets: HardwareFacet[] = [];
  if (/(arm|manipulat|franka|ur\d|xarm|flexiv|kinova|widowx|sawyer|aloha|rizon|droid|agibot|galaxea|trossen|arx|genie|r5a|abb|sarcos)/i.test(setup)) facets.push('Arm / manipulator');
  if (/(bimanual|dual-arm|two arms|2 × 6-dof arms|aloha)/i.test(setup)) facets.push('Bimanual');
  if (/(humanoid|unitree [ght]\d?|allex|hoap|thormang|coman|theo|hrp|rb-y1|booster t1|high torque hi)/i.test(setup)) facets.push('Humanoid');
  if (/(allegro|leap|xhands?|inspire|sharpa|dex3|tri-finger|ability hand|five-finger|dexterous hand)/i.test(setup)) facets.push('Dexterous hand');
  if (/(parallel[- ]jaw|two-finger|gripper|droid)/i.test(setup)) facets.push('Parallel gripper');
  if (/(quadruped|unitree a1|unitree go2|minitaur|laikago|spot)/i.test(setup)) facets.push('Quadruped');
  if (/(mobile|wheeled|navigation|coco delivery|husky|turtlebot|jackrabbot|spot)/i.test(setup)) facets.push('Mobile / navigation');
  if (!facets.length) facets.push('Other robot');
  return { label:setup, facets, applied:true };
};
const taskProfileFor = (item: (typeof pipelines)[number]) => {
  const text = `${item.name} ${item.input} ${item.output} ${item.summary} ${item.embodiments} ${item.caveat}`;
  const facets: TaskFacet[] = [];
  if (/(manipulat|pick(?:ing|s)?\b|grasp|push(?:ing)?\b|pull(?:ing)?\b|drawer|cabinet|door opening|insertion|cutting|pour|wipe|cloth|rope|handover|object interaction|dexterous|hand vla)/i.test(text)) facets.push('Manipulation');
  if (/(navigation|navigate|goal[- ]?reach|waypoint|driving|urban mobility|obstacle avoidance)/i.test(text)) facets.push('Navigation');
  return facets;
};
const locomotionProfileFor = (item: (typeof pipelines)[number]) => {
  const text = `${item.name} ${item.input} ${item.output} ${item.representation} ${item.simulator} ${item.embodiments} ${item.summary} ${item.metric} ${item.caveat}`;
  const facets: LocomotionFacet[] = [];
  const wheeled = /(wheeled|mobile[- ]base|mobile robot|mobile navigation|delivery robot|husky|turtlebot|jackrabbot|urban mobility|autonomous driving|vehicle navigation|rb-y1|mobile aloha)/i.test(text);
  const legged = /(legged|quadruped|biped|walking|walks|gait|footstep|stair|parkour|locomotion|unitree a1|unitree go2|minitaur|laikago|spot robot|microduck)/i.test(text);
  const humanoid = /(humanoid|unitree g1|unitree h1|unitree h2|booster t1|hrp[- ]|hoap|thormang|coman|allex|theo robot|29[- ]dof|48[- ]dof)/i.test(text);
  const wholeBodyMotion = /(whole[- ]body|full[- ]body|loco[- ]?manip|locomotion|walking|walks|gait|balance|recovery|footstep|stair|parkour|agile motion|dance transfer)/i.test(text);
  const learned = (legged || (humanoid && wholeBodyMotion)) && /(learned locomotion|reinforcement learning|\bppo\b|physics[- ]based rl|tracking policy|whole[- ]body polic|motion policy|controller policy)/i.test(text);
  const assumedControl = (wheeled || legged || (humanoid && wholeBodyMotion)) && !learned && /(low[- ]level locomotion control|built[- ]in|pretrained controller|velocity command|kinematic|hybrid[- ]a\*|planner|navigation policy|controller|motion conversion|stability check)/i.test(text);
  if (wheeled) facets.push('Wheeled / mobile base');
  if (legged) facets.push('Legged');
  if (humanoid && wholeBodyMotion) facets.push('Humanoid whole-body');
  if (learned) facets.push('Learned locomotion');
  if (assumedControl) facets.push('Assumed / built-in control');
  if (!wheeled && !legged && !(humanoid && wholeBodyMotion)) facets.push('No locomotion modeled');
  return facets;
};
const bodyScopeFor = (item: (typeof pipelines)[number]) => {
  const text = `${item.name} ${item.input} ${item.output} ${item.summary} ${item.embodiments} ${item.caveat}`;
  const tasks = taskProfileFor(item);
  const scopes: BodyScope[] = [];
  const wholeBody = /(whole[- ]body|locomanipulation|mobile manipulation|locomotion|walking|walks|stair|gait|balance control|quadruped|agile motion|full[- ]body|29[- ]DoF|48[- ]DoF)/i.test(text);
  const upperBody = tasks.includes('Manipulation') && /(arm|manipulator|bimanual|hand|gripper|wrist|end[- ]effector|franka|xarm|kinova|flexiv|sawyer|widowx|aloha|realman|rm75|allegro|leap|xhand|inspire|sharpa|dex3)/i.test(text);
  if (upperBody && !wholeBody) scopes.push('Upper body / arms+');
  if (wholeBody) scopes.push('Whole body');
  return scopes;
};
type PhysicsKind = 'RIGID / ARTICULATED' | 'DEFORMABLE / CONTINUUM' | 'HYBRID RIGID + DEFORMABLE' | 'SYSTEM-IDENTIFIED' | 'LEARNED / IMPLICIT' | 'KINEMATIC / SCRIPTED' | 'TYPE NOT DISCLOSED' | 'NA';
const physicsKindNotes: Array<{ kind:PhysicsKind; note:string }> = [
  { kind:'RIGID / ARTICULATED', note:'Bodies, joints, colliders, inertia, constraints and contact impulses are stepped explicitly.' },
  { kind:'DEFORMABLE / CONTINUUM', note:'FEM, MPM, particles, meshes or fields represent strain, constitutive behavior and topology change.' },
  { kind:'HYBRID RIGID + DEFORMABLE', note:'Rigid robot/contact state is coupled to cloth, rope, soft body, fluid or topology-changing matter.' },
  { kind:'SYSTEM-IDENTIFIED', note:'Real interaction fits mass, friction, actuator, contact or residual dynamics inside an explicit simulator.' },
  { kind:'LEARNED / IMPLICIT', note:'A neural transition predicts future pixels, Gaussians or latent state; forces may not be inspectable.' },
  { kind:'KINEMATIC / SCRIPTED', note:'Poses or trajectories advance without a general force/contact transition model.' },
  { kind:'TYPE NOT DISCLOSED', note:'The work claims physics-enabled simulation but does not expose enough representation detail.' },
  { kind:'NA', note:'No physical transition model is applied in the reported pipeline.' },
];
const physicsProfileFor = (item: (typeof pipelines)[number]) => {
  if (!item.stages.includes('Physics')) return { kind:'NA' as PhysicsKind, representation:'No physical transition state', scope:'NOT APPLIED' };
  const text = `${item.name} ${item.representation} ${item.simulator} ${item.summary}`;
  const hasRigid = /(rigid|mujoco|mjx|isaac|bullet|pyphysx|raisim|sapien|robosuite|unity|omnigibson|genesis|physx|gazebo|lcp)/i.test(text);
  const hasDeformable = /(deform|soft[- ]?body|cloth|rope|cable|elastic|plastic|granular|fluid|cutting|topology|fem|finite element|mpm|material point|projective dynamics|simplicits|tactile)/i.test(text);
  const hasLearnedTransition = /(world model|video generator|video diffusion|neural simulator|learned force|learned dynamics|action-conditioned.*(?:video|rgb|gaussian)|space-time simulation)/i.test(text);
  const hasSystemId = /(system ident|differentiably identified|identified mass|calibrated rigid|calibrated.*(?:actuator|dynamics|contact|simulator)|delta action|dynamics alignment|real.*residual)/i.test(text);
  const hasKinematic = /(kinematic human motion|scripted|no contact-physics|trajectory playback|animation engine)/i.test(text);
  let kind: PhysicsKind;
  if (hasRigid && hasDeformable) kind = 'HYBRID RIGID + DEFORMABLE';
  else if (hasDeformable) kind = 'DEFORMABLE / CONTINUUM';
  else if (hasLearnedTransition) kind = 'LEARNED / IMPLICIT';
  else if (hasKinematic) kind = 'KINEMATIC / SCRIPTED';
  else if (hasSystemId) kind = 'SYSTEM-IDENTIFIED';
  else if (hasRigid) kind = 'RIGID / ARTICULATED';
  else kind = 'TYPE NOT DISCLOSED';

  let representation = 'Simulator state; exact physical representation not reported';
  if (kind === 'HYBRID RIGID + DEFORMABLE') representation = /mpm|material point/i.test(text) ? 'Rigid bodies + particle/grid continuum state (MPM)' : 'Rigid-body state coupled to deformable mesh / particle constraints';
  else if (kind === 'DEFORMABLE / CONTINUUM') {
    if (/gaussian/i.test(text) && /mpm|material point/i.test(text)) representation = '3D Gaussians as render primitives and MPM particles';
    else if (/gaussian/i.test(text) && hasLearnedTransition) representation = 'Dynamic 3D Gaussians + learned force / transition graph';
    else if (/fem|finite element/i.test(text)) representation = 'Finite-element mesh + constitutive / contact parameters';
    else if (/mpm|material point/i.test(text)) representation = 'Lagrangian particles transferred through an Eulerian grid';
    else representation = 'Deformable mesh / particles + material field or constraints';
  } else if (kind === 'SYSTEM-IDENTIFIED') {
    if (/delta action|residual/i.test(text)) representation = 'Simulator state + learned residual / delta dynamics';
    else if (/mass|friction|contact/i.test(text)) representation = 'Rigid bodies + identified mass / friction / contact parameters';
    else representation = 'Rigid-body state + calibrated actuator / dynamics parameters';
  } else if (kind === 'LEARNED / IMPLICIT') {
    if (/gaussian/i.test(text)) representation = 'Dynamic Gaussian state + learned force / transition graph';
    else if (/video|rgb|pixel/i.test(text)) representation = 'Action-conditioned pixels or video latents; contact remains implicit';
    else representation = 'Learned latent world state and neural transition';
  } else if (kind === 'KINEMATIC / SCRIPTED') representation = 'Time-indexed poses / trajectories with scripted state transitions';
  else if (kind === 'RIGID / ARTICULATED') {
    if (/collision mesh|collider/i.test(text)) representation = 'Collision meshes + rigid / articulated bodies + contact state';
    else if (/urdf|mjcf|usd/i.test(text)) representation = 'Links, joints, colliders, inertials and generalized state';
    else representation = 'Generalized coordinates q, q̇ + bodies, contacts and constraints';
  }
  const scopes = [
    /(contact|collision|grasp|push|manipulat)/i.test(text) && 'contact',
    /(articulat|joint|drawer|door|link)/i.test(text) && 'articulation',
    hasDeformable && 'deformation',
    /(locomot|balance|humanoid|quadruped|gait)/i.test(text) && 'whole-body',
    /(tactile|gelsight)/i.test(text) && 'tactile',
    /(navigation|vehicle|driving|terrain)/i.test(text) && 'navigation',
    hasSystemId && 'identified / calibrated',
  ].filter((value): value is string => Boolean(value));
  return { kind, representation, scope:scopes.length ? scopes.join(' · ') : 'forward dynamics' };
};

type TrackerView = 'home' | 'pipelines' | 'capabilities';

export function TrackerPage({ view = 'home' }: { view?: TrackerView }) {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<'All' | Domain>('All');
  const [selectedStages, setSelectedStages] = useState<Stage[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<HardwareFacet[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskFacet[]>([]);
  const [selectedLocomotion, setSelectedLocomotion] = useState<LocomotionFacet[]>([]);
  const [selectedBodyScopes, setSelectedBodyScopes] = useState<BodyScope[]>([]);
  const [selectedPhysicsKinds, setSelectedPhysicsKinds] = useState<PhysicsKind[]>([]);
  const [filtersPinned, setFiltersPinned] = useState(false);
  const [showAllPipelines, setShowAllPipelines] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [rating, setRating] = useState<'All' | 'HIGH' | 'MEDIUM' | 'LOW'>('All');
  const [toolStage, setToolStage] = useState('All');
  const [highlightedTool, setHighlightedTool] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const restoreFilters = (search = window.location.search) => {
      const params = new URLSearchParams(search);
      const q = params.get('q');
      const d = params.get('domain') as Domain | null;
      const restoredStages = params.getAll('stage').flatMap((value) => value.split(',')).filter((value): value is Stage => stages.includes(value as Stage));
      const restoredHardware = params.getAll('hardware').flatMap((value) => value.split(',')).filter((value): value is HardwareFacet => hardwareFacets.includes(value as HardwareFacet));
      const restoredTasks = params.getAll('task').flatMap((value) => value.split(',')).filter((value): value is TaskFacet => taskFacets.includes(value as TaskFacet));
      const restoredLocomotion = params.getAll('mobility').flatMap((value) => value.split(',')).filter((value): value is LocomotionFacet => locomotionFacets.includes(value as LocomotionFacet));
      const restoredBodyScopes = params.getAll('body').flatMap((value) => value.split(',')).filter((value): value is BodyScope => bodyScopes.includes(value as BodyScope));
      const restoredPhysicsKinds = params.getAll('physics').flatMap((value) => value.split(',')).filter((value): value is PhysicsKind => physicsKindNotes.some((item) => item.kind === value));
      const restoredTool = params.get('tool');
      setQuery(q ?? '');
      setDomain(d && ['Graphics', 'Robotics', 'Cross-domain'].includes(d) ? d : 'All');
      setSelectedStages([...new Set(restoredStages)]);
      setSelectedHardware([...new Set(restoredHardware)]);
      setSelectedTasks([...new Set(restoredTasks)]);
      setSelectedLocomotion([...new Set(restoredLocomotion)]);
      setSelectedBodyScopes([...new Set(restoredBodyScopes)]);
      setSelectedPhysicsKinds([...new Set(restoredPhysicsKinds)]);
      if (restoredTool) {
        setToolStage('All');
        setShowAllTools(true);
        setHighlightedTool(restoredTool);
        window.setTimeout(() => document.getElementById(toolId(restoredTool))?.scrollIntoView({ behavior:'smooth', block:'center' }), 0);
      }
    };
    const initialSearch = window.location.search;
    const timer = window.setTimeout(() => restoreFilters(initialSearch), 0);
    const onPopState = () => restoreFilters();
    window.addEventListener('popstate', onPopState);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (domain !== 'All') params.set('domain', domain);
    selectedStages.forEach((stage) => params.append('stage', stage));
    selectedHardware.forEach((hardware) => params.append('hardware', hardware));
    selectedTasks.forEach((task) => params.append('task', task));
    selectedLocomotion.forEach((locomotion) => params.append('mobility', locomotion));
    selectedBodyScopes.forEach((scope) => params.append('body', scope));
    selectedPhysicsKinds.forEach((kind) => params.append('physics', kind));
    window.history.replaceState({}, '', `${window.location.pathname}${params.size ? `?${params}` : ''}${window.location.hash}`);
  }, [query, domain, selectedBodyScopes, selectedHardware, selectedLocomotion, selectedPhysicsKinds, selectedStages, selectedTasks]);

  const toggleStage = (candidate: Stage) => setSelectedStages((current) => current.includes(candidate)
    ? current.filter((stage) => stage !== candidate)
    : stages.filter((stage) => current.includes(stage) || stage === candidate));
  const toggleHardware = (candidate: HardwareFacet) => setSelectedHardware((current) => current.includes(candidate)
    ? current.filter((hardware) => hardware !== candidate)
    : hardwareFacets.filter((hardware) => current.includes(hardware) || hardware === candidate));
  const toggleTask = (candidate: TaskFacet) => setSelectedTasks((current) => current.includes(candidate)
    ? current.filter((task) => task !== candidate)
    : taskFacets.filter((task) => current.includes(task) || task === candidate));
  const toggleLocomotion = (candidate: LocomotionFacet) => setSelectedLocomotion((current) => current.includes(candidate)
    ? current.filter((locomotion) => locomotion !== candidate)
    : locomotionFacets.filter((locomotion) => current.includes(locomotion) || locomotion === candidate));
  const toggleBodyScope = (candidate: BodyScope) => setSelectedBodyScopes((current) => current.includes(candidate)
    ? current.filter((scope) => scope !== candidate)
    : bodyScopes.filter((scope) => current.includes(scope) || scope === candidate));
  const togglePhysicsKind = (candidate: PhysicsKind) => setSelectedPhysicsKinds((current) => current.includes(candidate)
    ? current.filter((kind) => kind !== candidate)
    : physicsKindNotes.map((item) => item.kind).filter((kind) => current.includes(kind) || kind === candidate));

  const filtered = useMemo(() => [...pipelines].filter((item) => {
    const hardware = hardwareProfileFor(item);
    const tasks = taskProfileFor(item);
    const locomotion = locomotionProfileFor(item);
    const bodyScope = bodyScopeFor(item);
    const physics = physicsProfileFor(item);
    const institution = institutionFor(item.name);
    const haystack = `${item.name} ${institution.label} ${item.summary} ${item.input} ${item.output} ${item.representation} ${item.simulator} ${hardware.label} ${hardware.facets.join(' ')} ${tasks.join(' ')} ${locomotion.join(' ')} ${bodyScope.join(' ')}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (domain === 'All' || item.domain === domain) && selectedStages.every((stage) => item.stages.includes(stage)) && selectedHardware.every((facet) => hardware.facets.includes(facet)) && (!selectedTasks.length || selectedTasks.some((facet) => tasks.includes(facet))) && (!selectedLocomotion.length || selectedLocomotion.some((facet) => locomotion.includes(facet))) && (!selectedBodyScopes.length || selectedBodyScopes.some((scope) => bodyScope.includes(scope))) && (!selectedPhysicsKinds.length || selectedPhysicsKinds.includes(physics.kind)) && (rating === 'All' || real2simRelevance(item).band === rating);
  }).sort((a, b) => b.year - a.year || pipelineReleaseMonth(b.date) - pipelineReleaseMonth(a.date) || a.name.localeCompare(b.name)), [query, domain, rating, selectedBodyScopes, selectedHardware, selectedLocomotion, selectedPhysicsKinds, selectedStages, selectedTasks]);

  const filteredTools = [...(toolStage === 'All' ? capabilities : capabilities.filter((tool) => tool.stage === toolStage))].sort((a, b) => {
    const usageDifference = verifiedUsageCount(b.name) - verifiedUsageCount(a.name);
    return usageDifference || capabilityDetailFor(b).date.localeCompare(capabilityDetailFor(a).date) || a.name.localeCompare(b.name);
  });
  const openCount = pipelines.filter((item) => item.open === 'Open').length;
  const physicsCount = pipelines.filter((item) => item.stages.includes('Physics')).length;
  const stageDistribution = stages.map((item) => ({ stage:item, count:pipelines.filter((pipeline) => pipeline.stages.includes(item)).length }));
  const stageAssignmentTotal = stageDistribution.reduce((sum, item) => sum + item.count, 0);
  const stagePieStops = pieGradient(stageDistribution, stageColors);
  const ratingDistribution = (['HIGH', 'MEDIUM', 'LOW'] as const).map((band) => ({ band, count:pipelines.filter((pipeline) => real2simRelevance(pipeline).band === band).length }));
  const ratingColors = ['#d8ff63', '#e6a9a0', '#78978b'];
  const domainDistribution = (['Robotics', 'Cross-domain', 'Graphics'] as Domain[]).map((item) => ({ domain:item, count:pipelines.filter((pipeline) => pipeline.domain === item).length }));
  const domainColors = ['#d8ff63', '#f26a3d', '#0d6b5c'];
  const hardwareDistribution = hardwareFacets.map((facet) => ({ facet, count:pipelines.filter((pipeline) => hardwareProfileFor(pipeline).facets.includes(facet)).length }));
  const taskDistribution = taskFacets.map((facet) => ({ facet, count:pipelines.filter((pipeline) => taskProfileFor(pipeline).includes(facet)).length }));
  const locomotionDistribution = locomotionFacets.map((facet) => ({ facet, count:pipelines.filter((pipeline) => locomotionProfileFor(pipeline).includes(facet)).length }));
  const bodyScopeDistribution = bodyScopes.map((scope) => ({ scope, count:pipelines.filter((pipeline) => bodyScopeFor(pipeline).includes(scope)).length }));
  const physicsDistribution = physicsKindNotes.map((item) => ({ ...item, count:pipelines.filter((pipeline) => physicsProfileFor(pipeline).kind === item.kind).length }));
  const activeFilterCount = selectedStages.length + selectedHardware.length + selectedTasks.length + selectedLocomotion.length + selectedBodyScopes.length + selectedPhysicsKinds.length + (query ? 1 : 0) + (domain !== 'All' ? 1 : 0) + (rating !== 'All' ? 1 : 0);
  const displayedPipelines = showAllPipelines ? filtered : filtered.slice(0, 18);
  const displayedTools = showAllTools ? filteredTools : filteredTools.slice(0, 18);

  return (
    <main id="top" className={view === 'capabilities' ? 'capabilities-page' : view === 'pipelines' ? 'pipelines-page' : undefined}>
      <SiteHeader active={view === 'pipelines' || view === 'capabilities' ? view : undefined} />

      {view === 'home' && <>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> Living research index · verified Sep 2026</p>
          <h1>Track how reality becomes a <em>trainable world.</em></h1>
          <p className="hero-intro">An open map of real-to-simulation across neural graphics and robot learning—from decades of human-to-robot transfer to today’s geometry, physics, retargeting, and policy data engines.</p>
          <div className="hero-actions"><Link className="button primary" href="/evolution/">Trace the evolution ↗</Link><Link className="button secondary" href="/pipelines/">Explore current systems</Link></div>
        </div>
        <div className="pipeline-diagram" aria-label="Real-to-simulation pipeline overview">
          <div className="diagram-stage stage-capture"><small>01 · CAPTURE</small><strong>REAL</strong><span>RGB · depth · video</span></div><span className="diagram-arrow">→</span>
          <div className="diagram-stage stage-reconstruct"><small>02 · RECONSTRUCT</small><strong>3D</strong><span>Gaussians · mesh · USD</span></div><span className="diagram-arrow">→</span>
          <div className="diagram-stage stage-sim"><small>03 · SIMULATE</small><strong>SIM</strong><span>Physics · control · data</span></div>
        </div>
      </section>

      <section className="stats" aria-label="Tracker summary">
        <div><strong>{String(pipelines.length).padStart(2, '0')}</strong><span>pipelines</span></div><div><strong>{String(openCount).padStart(2, '0')}</strong><span>open implementations</span></div><div><strong>{String(physicsCount).padStart(2, '0')}</strong><span>physics-enabled</span></div><div><strong>{capabilities.length}</strong><span>foundation tools</span></div>
      </section>

      <section className="workflow-lens" aria-labelledby="workflow-title">
        <div className="section-kicker"><p className="eyebrow">WORKFLOW LENS</p><span>Click a stage to filter the pipeline atlas</span></div>
        <h2 id="workflow-title">Reality → policy, one layer at a time.</h2>
        <div className="stage-grid">
          {stages.map((item, index) => <Link key={item} className="stage-card" href={`/pipelines/?stage=${encodeURIComponent(item)}`}><span>0{index + 1}</span><strong>{item}</strong><p>{stageNotes[item]}</p><b>{pipelines.filter((pipeline) => pipeline.stages.includes(item)).length} pipelines →</b></Link>)}
        </div>
      </section>
      </>}

      {view === 'pipelines' && <section className="subpage-hero pipelines-subpage-hero" id="top">
        <div><p className="eyebrow">FULL SYSTEMS · CONNECTED MODULES</p><h1>Pipeline <em>atlas.</em></h1></div>
        <div className="subpage-intro"><p>Compare end-to-end and adjacent real2sim systems by stage coverage, physical representation, outputs, tested hardware, publication status, and reported conversion scale.</p><div><span>{pipelines.length} tracked systems</span><span>{collisionMeshSystems.length} strict collision-mesh outputs</span><span>Newest first</span></div><Link className="button secondary" href="/capabilities/">Open capability stack ↗</Link></div>
      </section>}

      {view === 'capabilities' && <section className="subpage-hero capability-subpage-hero" id="top">
        <div><p className="eyebrow">TOOLS · MODELS · MODULES</p><h1>Capability <em>stack.</em></h1></div>
        <div className="subpage-intro"><p>Foundation models and reusable components organized by pipeline stage, deployment mode, reported performance, and verified downstream use.</p><div><span>{capabilities.length} tracked tools</span><span>{capabilityStages.length} capability groups</span><span>Usage-first ordering</span></div><Link className="button secondary" href="/pipelines/">Open full pipelines ↗</Link></div>
      </section>}

      {view === 'pipelines' &&
      <section className="catalog-section" id="catalog">
        <div className="section-heading"><div><p className="eyebrow">PIPELINE ATLAS</p><h2>Compare full systems.</h2></div><p>Current real2sim systems, a static-scene reconstruction branch, and every method in the Historical Lineage are expanded into connected modules. Scene counts preserve the source unit; N/A means the method does not convert scenes. “Latest” is not inherently better.</p></div>
        <details className="physics-profile-guide">
          <summary><span>PHYSICS READING GUIDE</span><strong>Physics type ≠ physics representation</strong><i>＋</i></summary>
          <div><p><b>Type</b> names the transition family the pipeline provides: rigid contact, continuum deformation, calibrated dynamics, implicit neural prediction, or kinematic replay. <b>Representation</b> names the state actually stepped—bodies and joints, particles/grid, finite-element mesh, Gaussians, video latents, or pose trajectories.</p><section>{physicsDistribution.map((item) => <article key={item.kind}><header><strong>{item.kind}</strong><b>{item.count}</b></header><p>{item.note}</p></article>)}</section><small>Classification follows the reported pipeline and simulator description. “NA” means no physical transition model; “type not disclosed” means physics is claimed but the public representation is underspecified.</small></div>
        </details>
        <div className="pipeline-distribution" aria-label="Pipeline coverage distribution across five stages">
          <header><span>THREE FILTER VIEWS</span><strong>Stage and hardware selections combine with AND logic; relevance and domain remain single-choice filters.</strong></header>
          <div className="filter-pie-grid">
            <article><header><span>01 · MULTI-SELECT</span><b>STAGE ASSIGNMENTS</b></header><div className="filter-pie-body"><div className="pipeline-pie" style={{background:`conic-gradient(${stagePieStops})`}}><span><b>{stageAssignmentTotal}</b><small>stage tags</small></span></div><nav className="pipeline-pie-legend">{stageDistribution.map((item, index) => <button key={item.stage} aria-pressed={selectedStages.includes(item.stage)} onClick={() => toggleStage(item.stage)} className={selectedStages.includes(item.stage) ? 'active' : ''}><i style={{background:stageColors[index]}} /><b>{item.stage}</b><strong>{item.count}</strong><em>{Math.round(item.count / stageAssignmentTotal * 100)}%</em></button>)}</nav></div></article>
            <article><header><span>02</span><b>R2S RELEVANCE</b></header><div className="filter-pie-body"><div className="pipeline-pie" style={{background:`conic-gradient(${pieGradient(ratingDistribution, ratingColors)})`}}><span><b>{pipelines.length}</b><small>systems</small></span></div><nav className="pipeline-pie-legend">{ratingDistribution.map((item, index) => <button key={item.band} onClick={() => setRating(rating === item.band ? 'All' : item.band)} className={rating === item.band ? 'active' : ''}><i style={{background:ratingColors[index]}} /><b>{item.band}</b><strong>{item.count}</strong><em>{Math.round(item.count / pipelines.length * 100)}%</em></button>)}</nav></div></article>
            <article><header><span>03</span><b>DOMAIN</b></header><div className="filter-pie-body"><div className="pipeline-pie" style={{background:`conic-gradient(${pieGradient(domainDistribution, domainColors)})`}}><span><b>{pipelines.length}</b><small>systems</small></span></div><nav className="pipeline-pie-legend">{domainDistribution.map((item, index) => <button key={item.domain} onClick={() => setDomain(domain === item.domain ? 'All' : item.domain)} className={domain === item.domain ? 'active' : ''}><i style={{background:domainColors[index]}} /><b>{item.domain}</b><strong>{item.count}</strong><em>{Math.round(item.count / pipelines.length * 100)}%</em></button>)}</nav></div></article>
          </div>
        </div>
        <div className={`filter-bar${filtersPinned ? ' filter-open' : ''}`} aria-label="Pipeline filters">
          <button type="button" className="filter-tray-heading" aria-expanded={filtersPinned} onClick={() => setFiltersPinned((current) => !current)}><span>FILTER PIPELINES</span><b>{activeFilterCount ? `${activeFilterCount} ACTIVE CONSTRAINT${activeFilterCount === 1 ? '' : 'S'}` : 'HOVER, FOCUS, OR TAP TO EXPAND'}</b><i>＋</i></button>
          <label className="search-field"><span>⌕</span><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search model, representation, simulator…" aria-label="Search pipelines" /><kbd>/</kbd></label>
          <select value={domain} onChange={(event) => setDomain(event.target.value as 'All' | Domain)} aria-label="Filter by domain"><option>All</option><option>Graphics</option><option>Robotics</option><option>Cross-domain</option></select>
          <select value={rating} onChange={(event) => setRating(event.target.value as typeof rating)} aria-label="Filter by five-stage pipeline coverage rating"><option>All</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
          {(query || domain !== 'All' || selectedStages.length > 0 || selectedHardware.length > 0 || selectedTasks.length > 0 || selectedLocomotion.length > 0 || selectedBodyScopes.length > 0 || selectedPhysicsKinds.length > 0 || rating !== 'All') && <button className="clear-button" onClick={() => { setQuery(''); setDomain('All'); setSelectedStages([]); setSelectedHardware([]); setSelectedTasks([]); setSelectedLocomotion([]); setSelectedBodyScopes([]); setSelectedPhysicsKinds([]); setRating('All'); }}>Clear all</button>}
          <div className="stage-multi-filter" aria-label="Filter by all selected pipeline stages"><span>STAGES · MATCH ALL {selectedStages.length ? `· ${selectedStages.length} SELECTED` : ''}</span>{stages.map((item, index) => <button type="button" key={item} aria-pressed={selectedStages.includes(item)} className={selectedStages.includes(item) ? 'active' : ''} onClick={() => toggleStage(item)}><i style={{background:stageColors[index]}} />{item}</button>)}{selectedStages.length > 0 && <button type="button" className="clear-stages" onClick={() => setSelectedStages([])}>Clear stages</button>}</div>
          <div className="task-multi-filter" aria-label="Filter by manipulation or navigation task objective"><span>TASK OBJECTIVE · MATCH ANY {selectedTasks.length ? `· ${selectedTasks.length} SELECTED` : ''}</span>{taskDistribution.map((item) => <button type="button" key={item.facet} aria-pressed={selectedTasks.includes(item.facet)} className={selectedTasks.includes(item.facet) ? 'active' : ''} onClick={() => toggleTask(item.facet)}><i />{item.facet}<b>{item.count}</b></button>)}{selectedTasks.length > 0 && <button type="button" className="clear-tasks" onClick={() => setSelectedTasks([])}>Clear tasks</button>}</div>
          <div className="locomotion-multi-filter" aria-label="Filter by independently modeled locomotion or mobility"><span>MOBILITY / LOCOMOTION · MATCH ANY {selectedLocomotion.length ? `· ${selectedLocomotion.length} SELECTED` : ''}</span>{locomotionDistribution.map((item) => <button type="button" key={item.facet} aria-pressed={selectedLocomotion.includes(item.facet)} className={selectedLocomotion.includes(item.facet) ? 'active' : ''} onClick={() => toggleLocomotion(item.facet)}><i />{item.facet}<b>{item.count}</b></button>)}{selectedLocomotion.length > 0 && <button type="button" className="clear-locomotion" onClick={() => setSelectedLocomotion([])}>Clear locomotion</button>}</div>
          <div className="body-scope-filter" aria-label="Filter by upper-body or whole-body control scope"><span>BODY SCOPE · MATCH ANY {selectedBodyScopes.length ? `· ${selectedBodyScopes.length} SELECTED` : ''}</span>{bodyScopeDistribution.map((item) => <button type="button" key={item.scope} aria-pressed={selectedBodyScopes.includes(item.scope)} className={selectedBodyScopes.includes(item.scope) ? 'active' : ''} onClick={() => toggleBodyScope(item.scope)}><i />{item.scope}<b>{item.count}</b></button>)}{selectedBodyScopes.length > 0 && <button type="button" className="clear-body-scopes" onClick={() => setSelectedBodyScopes([])}>Clear body scope</button>}</div>
          <div className="hardware-multi-filter physics-kind-filter" aria-label="Filter by physics offered"><span>PHYSICS OFFERED · MATCH ANY {selectedPhysicsKinds.length ? `· ${selectedPhysicsKinds.length} SELECTED` : ''}</span>{physicsDistribution.map((item) => <button type="button" key={item.kind} aria-pressed={selectedPhysicsKinds.includes(item.kind)} className={selectedPhysicsKinds.includes(item.kind) ? 'active' : ''} onClick={() => togglePhysicsKind(item.kind)}><i />{item.kind}<b>{item.count}</b></button>)}{selectedPhysicsKinds.length > 0 && <button type="button" className="clear-hardware" onClick={() => setSelectedPhysicsKinds([])}>Clear physics</button>}</div>
          <div className="hardware-multi-filter" aria-label="Filter by all selected tested hardware categories"><span>TESTED HARDWARE · MATCH ALL {selectedHardware.length ? `· ${selectedHardware.length} SELECTED` : ''}</span>{hardwareDistribution.map((item) => <button type="button" key={item.facet} aria-pressed={selectedHardware.includes(item.facet)} className={selectedHardware.includes(item.facet) ? 'active' : ''} onClick={() => toggleHardware(item.facet)}><i />{item.facet}<b>{item.count}</b></button>)}{selectedHardware.length > 0 && <button type="button" className="clear-hardware" onClick={() => setSelectedHardware([])}>Clear hardware</button>}</div>
        </div>
        <div className="results-meta"><span>{filtered.length} of {pipelines.length} pipelines · {collisionMeshSystems.length} strict collision-mesh outputs</span><span>{selectedStages.length || selectedHardware.length || selectedTasks.length || selectedLocomotion.length || selectedBodyScopes.length || selectedPhysicsKinds.length ? `${selectedTasks.length ? `TASK · ${selectedTasks.join(' / ')} · ` : ''}${selectedLocomotion.length ? `LOCOMOTION · ${selectedLocomotion.join(' / ')} · ` : ''}${selectedBodyScopes.length ? `BODY · ${selectedBodyScopes.join(' / ')} · ` : ''}${selectedPhysicsKinds.length ? `PHYSICS · ${selectedPhysicsKinds.join(' / ')} · ` : ''}CONSTRAINTS · ${[...selectedStages, ...selectedHardware].join(' + ') || 'none'}` : 'Sorted by year + release month ↓'}</span></div>
        <div className="pipeline-list">
          {displayedPipelines.map((item, index) => {
            const modules = pipelineModules[item.name] ?? [];
            const sceneReport = pipelineSceneReports[item.name];
            const stackModuleCount = modules.filter((module) => module.capability).length;
            const relevance = real2simRelevance(item);
            const publication = publicationStatus(item);
            const publicationLabel = compactPublicationLabel(item, publication);
            const outputFormat = outputFormatFor(item);
            const hardware = hardwareProfileFor(item);
            const physics = physicsProfileFor(item);
            const institution = institutionFor(item.name);
            const datasets = datasetProfileFor(item);
            return <details className="pipeline-row" key={item.name}>
            <summary>
              <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="row-name"><strong>{item.name}</strong><small>{item.date} · {item.domain}</small><span className={`row-institution ${institution.verified ? 'institution-verified' : ''}`}>INSTITUTE · {institution.label}</span>{sceneReport && <span className={`row-scene-count scene-${sceneReport.status}`}>SCENES · {sceneReport.amount}</span>}</span>
              <span className="row-flow"><i>{item.input}</i><b>→</b><i>{item.representation}</i><b>→</b><i>{item.output}</i></span>
              <span className={`output-format-cell ${outputFormat.strict ? 'format-collision' : ''}`}><small>OUTPUT FORMAT</small><strong>{outputFormat.category}</strong><b>{outputFormat.suffix}</b></span>
              <span className={`physics-profile-cell physics-${physics.kind === 'NA' ? 'na' : 'active'}`}><small>PHYSICS</small><strong>{physics.kind}</strong><b>{physics.representation}</b></span>
              <span className={`hardware-cell ${hardware.applied ? '' : 'hardware-na'}`}><small>TESTED HARDWARE</small><strong>{hardware.label}</strong><b>{hardware.applied ? hardware.facets.join(' · ') : 'NOT APPLIED'}</b></span>
              <a className={`venue-cell ${publication.verified ? 'venue-verified' : 'venue-release'}`} href={publication.href ?? item.paper} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><small>PUBLICATION</small><strong>{publicationLabel}</strong>{publication.verified && <b>✓ VERIFIED</b>}</a>
              <span className={`rating-cell relevance-${relevance.band.toLowerCase()}`}><small>R2S COVERAGE</small><strong>{relevance.band}</strong><b>{relevance.score}/5</b></span>
              <span className={`access ${item.open.toLowerCase().replace(' ', '-')}`}>{item.open}</span>
              <span className="expand">＋</span>
            </summary>
            <div className="row-detail">
              <div className="detail-lead"><p>{item.summary}</p><small className="coverage-label">RATING EVIDENCE · EXACTLY {relevance.score} OF 5 STAGES</small><div className="relevance-components">{relevance.components.map((component) => { const evidence = component.covered ? stageEvidenceFor(item, modules, component.label) : undefined; return <article key={component.label} className={`rating-stage ${component.covered ? 'covered' : 'uncovered'}`}><span>{component.covered ? '●' : '○'} {component.label}</span>{evidence && <><p className="rating-stage-description">{evidence.description}</p><p className="rating-stage-notation"><b>NOTATION</b>{evidence.notation}</p><nav className="rating-stage-tools"><b>STACK PICKS</b>{evidence.stackTools.length ? evidence.stackTools.map((tool) => <Link key={tool} href={`/capabilities/?tool=${encodeURIComponent(tool)}#${toolId(tool)}`}>{tool} ↗</Link>) : <span>No separately named Stack tool reported</span>}</nav><dl><div><dt>IN</dt><dd><code>{evidence.inputEq}</code><small>{evidence.inputDetail}</small></dd></div><div><dt>MAP</dt><dd><code>{evidence.stepEq}</code><small>{evidence.stepDetail}</small></dd></div><div><dt>OUT</dt><dd><code>{evidence.outputEq}</code><small>{evidence.outputDetail}</small></dd></div></dl></>}</article>; })}</div></div>
              <dl><div className="dataset-profile"><dt>Datasets / splits</dt><dd><section className="dataset-corpus"><header><b>{datasets.fitLabel}</b>{datasets.fitCount && <strong>{datasets.fitCount}</strong>}</header><h4>{datasets.fitName}</h4><span>{datasets.fit}</span></section><section className="dataset-corpus"><header><b>{datasets.evalLabel}</b>{datasets.evalCount && <strong>{datasets.evalCount}</strong>}</header><h4>{datasets.evalName}</h4><span>{datasets.evaluation}</span></section><aside><small className={`dataset-split split-${datasets.split.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-')}`}>{datasets.split}</small><small>{datasets.note}</small></aside></dd></div><div><dt>Reported signal</dt><dd>{item.metric}</dd></div>{sceneReport && <div><dt>Converted scenes</dt><dd><a className="evidence-inline" href={sceneReport.href} target="_blank" rel="noreferrer"><strong>{sceneReport.amount}</strong> · {sceneReport.detail} ↗</a></dd></div>}<div><dt>Institute / affiliation</dt><dd><a className="evidence-inline" href={item.project} target="_blank" rel="noreferrer"><strong>{institution.label}</strong> · {institution.verified ? 'reported by project or paper' : 'not independently verified'} ↗</a></dd></div><div><dt>Publication / venue</dt><dd><a className="evidence-inline" href={publication.href ?? item.paper} target="_blank" rel="noreferrer"><strong>{publication.verified ? 'Peer reviewed · verified' : 'Release status'}</strong> · {publication.label} ↗</a></dd></div><div><dt>Physics offered</dt><dd><strong>{physics.kind}</strong> · {physics.scope}</dd></div><div><dt>Physics representation</dt><dd>{physics.representation}</dd></div><div><dt>Simulation engine</dt><dd><a className="evidence-inline" href={item.paper} target="_blank" rel="noreferrer">{item.simulator} ↗</a></dd></div><div><dt>Test embodiment</dt><dd><a className="evidence-inline" href={item.paper} target="_blank" rel="noreferrer">{item.embodiments} ↗</a></dd></div><div><dt>Watch for</dt><dd>{item.caveat}</dd></div></dl>
              <div className="resource-links"><a href={item.project} target="_blank" rel="noreferrer">Project ↗</a><a href={item.paper} target="_blank" rel="noreferrer">Primary source ↗</a>{item.code && <a href={item.code} target="_blank" rel="noreferrer">Code ↗</a>}</div>
              <div className="system-graph">
                <header><div><span>CONNECTED PIPELINE GRAPH</span><strong>{modules.length} traced modules · {stackModuleCount} linked to Capability Stack</strong></div><p>Solid modules jump to their stack entry. Dashed modules are project-native, engine-level, or not yet represented by a reusable foundation tool.</p></header>
                <div className="system-graph-flow">
                  <div className="graph-terminal"><small>INPUT</small><b>{item.input}</b></div>
                  {modules.map((module, moduleIndex) => <div className="graph-step" key={`${module.name}-${moduleIndex}`}>
                    <i aria-hidden="true">→</i>
                    {module.capability ? <Link href={`/capabilities/?tool=${encodeURIComponent(module.capability ?? '')}#${toolId(module.capability ?? '')}`}><small>{module.phase} · STACK</small><b>{module.name}</b><span>{module.role}</span></Link> : <a href={module.href} target="_blank" rel="noreferrer"><small>{module.phase} · NATIVE</small><b>{module.name}</b><span>{module.role}</span></a>}
                  </div>)}
                  <div className="graph-step"><i aria-hidden="true">→</i><div className="graph-terminal graph-output"><small>OUTPUT</small><b>{item.output}</b></div></div>
                </div>
              </div>
            </div>
          </details>;})}
          {filtered.length > displayedPipelines.length && <button type="button" className="collection-reveal" onClick={() => setShowAllPipelines(true)}><span>SHOW ALL PIPELINES</span><b>{filtered.length - displayedPipelines.length} MORE ↓</b></button>}
          {showAllPipelines && filtered.length > 18 && <button type="button" className="collection-reveal collection-collapse" onClick={() => setShowAllPipelines(false)}><span>COLLAPSE PIPELINE LIST</span><b>SHOW FIRST 18 ↑</b></button>}
          {!filtered.length && <div className="empty-state"><strong>No pipelines match.</strong><p>Clear a filter or search for a broader capability.</p></div>}
        </div>
      </section>}

      {view === 'capabilities' &&
      <section className="stack-section" id="stack">
        <div className="section-heading light"><div><p className="eyebrow">CAPABILITY STACK</p><h2>Build the pipeline.</h2></div><p>Foundation models and practical tools by stage. The evidence column separates direct use, adaptation, and comparison from contextual citation; only the first three count toward usage ordering.</p></div>
        <div className="scene-graph-scope-map">
          <header><span>NEW CROSS-CUTTING CAPABILITY</span><h3>Scene graph / structured world state</h3><p>A graph is the explicit contract between perception evidence and a world that downstream systems can edit, simulate, query, or plan over.</p></header>
          <div><small>01 · EVIDENCE</small><b>Masks · tracks · depth · boxes · language</b></div><i>→</i><div><small>02 · ENTITIES</small><b>Persistent objects, parts, agents, places</b></div><i>→</i><div className="scene-graph-core"><small>03 · TYPED RELATIONS</small><b>Support · containment · contact · change · affordance</b></div><i>→</i><div><small>04 · CONSUMERS</small><b>Asset generation · simulation · planning · policy</b></div>
          <p><b>Inclusion rule:</b> a method belongs here only when it emits persistent entities plus explicit typed relations consumed downstream. Masks, captions, meshes, or unstructured VLM descriptions alone do not qualify.</p>
        </div>
        <div className="tool-tabs" id="tools" role="tablist" aria-label="Filter tools by capability stage">
          {['All', ...capabilityStages].map((item) => <button role="tab" aria-selected={toolStage === item} key={item} onClick={() => setToolStage(item)}>{item}<span>{item === 'All' ? capabilities.length : capabilities.filter((tool) => tool.stage === item).length}</span></button>)}
        </div>
        <p className="usage-sort-note">ORDER · VERIFIED DOWNSTREAM USE ↓ <span>Latest verified year–month, then name, breaks ties.</span></p>
        <div className="table-shell">
          <table className="capability-table">
            <thead><tr><th>Stage / tool</th><th>Date</th><th>Technical interface</th><th>Cost / throughput</th><th>Open source</th><th>API / interface</th><th>Deploy / compute</th><th>Used by / evidence</th></tr></thead>
            <tbody>{displayedTools.map((tool) => {
              const evidence = capabilityEvidence[tool.name] ?? [];
              const detail = capabilityDetailFor(tool);
              return <tr id={toolId(tool.name)} className={highlightedTool === tool.name ? 'tool-highlighted' : ''} key={`${tool.stage}-${tool.name}`}><td><span className="table-stage">{tool.stage}</span><a href={tool.href} target="_blank" rel="noreferrer">{tool.name} ↗</a></td><td className="mono capability-date">{detail.date}</td><td><p className="capability-summary">{tool.capability}</p><dl className="capability-interface"><div><dt>IN</dt><dd>{detail.input}</dd></div><div><dt>ARCH</dt><dd>{detail.architecture}</dd></div><div><dt>OUT</dt><dd>{detail.output}</dd></div></dl></td><td className="metric"><strong>{tool.metric}</strong><dl className="capability-cost"><div><dt>TRAIN</dt><dd>{detail.trainCost}</dd></div><div><dt>INFER</dt><dd>{detail.inferCost}</dd></div></dl></td><td>{tool.open}</td><td>{tool.api}</td><td><span>{tool.local}</span><dl className="capability-compute"><div><dt>COMPUTE</dt><dd>{detail.compute}</dd></div></dl></td><td className="usage-cell">{evidence.length ? evidence.map((item) => <a className={`evidence-${item.relation}`} href={item.href} target="_blank" rel="noreferrer" key={`${item.work}-${item.relation}`}><small>{item.relation}</small>{item.work} ↗</a>) : <span>Not yet traced to a verified downstream implementation</span>}</td></tr>;
            })}</tbody>
          </table>
        </div>
        {filteredTools.length > displayedTools.length && <button type="button" className="collection-reveal collection-reveal-dark" onClick={() => setShowAllTools(true)}><span>SHOW ALL STACK TOOLS</span><b>{filteredTools.length - displayedTools.length} MORE ↓</b></button>}
        {showAllTools && filteredTools.length > 18 && <button type="button" className="collection-reveal collection-reveal-dark collection-collapse" onClick={() => setShowAllTools(false)}><span>COLLAPSE CAPABILITY STACK</span><b>SHOW FIRST 18 ↑</b></button>}
        <p className="table-note">Evidence labels distinguish a direct dependency (“uses”), a modified or inherited component (“adapts”), an evaluation baseline (“compares”), and a contextual reference (“cites”). A citation is displayed but does not count as implementation use. Blank evidence is stated explicitly rather than inferred. ¹ Hardware-specific throughput; see the linked source. ² Fine-tuned mean across six real setups. Licenses shown are shorthand—review model, dataset, and dependency terms before commercial use.</p>
      </section>}

      <SiteFooter />
    </main>
  );
}

export default function Home() {
  return <TrackerPage />;
}
