import type { Capability } from './data';

export type CapabilityDetail = {
  date: string;
  input: string;
  output: string;
  architecture: string;
  trainCost: string;
  inferCost: string;
  compute: string;
};

type DetailOverride = Partial<CapabilityDetail>;

const stageInterfaces: Record<string, Pick<CapabilityDetail, 'input' | 'output'>> = {
  'Capture / data / annotation': { input:'Sensor streams, demonstrations, or untrimmed video', output:'Time-aligned observations, labels, poses, or robot-ready episodes' },
  'Video generation / world models': { input:'Visual context with camera, action, text, or trajectory conditioning', output:'Conditioned future frames, views, depth, or latent world state' },
  'Image generation': { input:'Text, image, mask, depth, or layout conditioning', output:'Generated or edited RGB image' },
  '3D generation': { input:'Image, text, or partial geometric evidence', output:'Mesh, radiance field, Gaussian splats, or textured 3D asset' },
  Geometry: { input:'Calibrated or uncalibrated RGB/RGB-D observations', output:'Cameras, depth, point maps, mesh, radiance field, or 3D/4D state' },
  Appearance: { input:'Images, masks, geometry, and view/time coordinates', output:'View-consistent RGB, texture, material, or completed appearance' },
  Segmentation: { input:'Image/video plus prompt, seed mask, or category query', output:'Pixel masks, tracks, instances, or functional regions' },
  'Hand recon': { input:'Hand crops, monocular video, or egocentric frames', output:'MANO parameters, 3D joints, meshes, and hand trajectories' },
  'Body recon': { input:'Human image/video and optional camera evidence', output:'SMPL-family body state, global pose, mesh, or motion trajectory' },
  Pose: { input:'RGB/RGB-D frames and optional object or camera priors', output:'Camera/object pose, calibration, trajectory, depth, or point map' },
  'Task reasoning / grounding': { input:'Visual observations, instructions, and task knowledge', output:'Grounded targets, functional regions, and task constraints' },
  'Scene graph / structured world state': { input:'Posed sensor evidence, geometry, masks, tracks, and semantics', output:'Persistent entities with typed spatial, temporal, or functional relations' },
  'Kinematics / IK': { input:'Robot model, target poses, constraints, and current configuration', output:'Feasible joint configuration, velocity, or trajectory' },
  Physics: { input:'Geometry/state, actions, contacts, and physical parameters or observations', output:'Next state, forces, material estimates, or executable physics scene' },
  Retargeting: { input:'Source motion or interaction plus target embodiment model', output:'Target joint/EEF trajectory satisfying task and feasibility constraints' },
  'Policy learning': { input:'Observations, goals, and demonstrations or rewards', output:'Action distribution, action chunk, controller, or policy checkpoint' },
};

const detailOverrides: Record<string, DetailOverride> = {
  DINOv3: {
    date:'2025-08', input:'RGB images; calibrated RGB-D supplied separately for 3D lifting', output:'Dense patch descriptors; downstream modules infer semantics or correspondence', architecture:'Self-supervised ViT / ConvNeXt backbones with distilled model variants', trainCost:'Pretrained models released; AdaRoboVLG freezes the feature extractor', inferCost:'Backbone-dependent; AdaRoboVLG whole-system 5 Hz is not encoder-only latency', compute:'Local PyTorch GPU; memory depends on backbone and image resolution',
  },
  'Seed-1.8': {
    date:'2025-12', input:'Text, images/video, and optional retrieved grasp-taxonomy context', output:'Reasoned task specification and visual grounding boxes', architecture:'Proprietary multimodal model; AdaRoboVLG adds retrieval and structured reasoning prompts', trainCost:'Hosted pretrained model; AdaRoboVLG does not report model fine-tuning', inferCost:'API latency and per-grasp cost not reported', compute:'Volcano Engine API; cookbook code does not include local model weights',
  },
  'Contact-GraspNet': {
    date:'2021-03', input:'Scene point cloud; AdaRoboVLG additionally supplies lifted semantic features', output:'Contact locations, approach/closing directions, widths, and contact scores', architecture:'PointNet++ contact-grasp predictor; GraspClutter6D PyTorch implementation', trainCost:'AdaRoboVLG trains proposals on GraspClutter6D; GPU-hours not reported', inferCost:'Module-specific latency not reported in AdaRoboVLG', compute:'Local GPU / PyTorch; public baseline checkpoints are separate from AdaRoboVLG weights',
  },
  'AdaRoboVLG base grasp policy': {
    date:'2026-09', input:'Object geometry, contact primitives, grasp types, and hand specification', output:'Ranked hand poses with joint configurations and predicted stability', architecture:'Explicit kinematic mapping → local hand–object interaction encoding → shared binary stability classifier', trainCost:'4.4M simulated trials; 30 epochs, batch 512; server with 4×RTX 4090; duration not reported', inferCost:'Base-policy latency N/R; dynamic 5 Hz updates transform an initial grasp without rerunning the policy', compute:'PyTorch research stack; full-system code/weights release not verified',
  },
  AINA: { date:'2025-11' },
  HumanEgo: { date:'2026-05' },
  HumanX: { date:'2026-02' },
  OmniRetarget: { date:'2025-09' },
  REACT3D: { date:'2025-10' },
  'SoMA neural GS simulator': { date:'2026-02' },
  'μ₀': { date:'2026-06' },
  HDMI: { date:'2025-09' },
  HumanPlus: { date:'2024-06' },
  AnyTeleop: { date:'2023-07' },
  DeepMimic: { date:'2018-04' },
  SceneFun3D: {
    date:'2024-06', input:'3D scene point cloud plus optional language task', output:'Functional-element masks, affordance labels, and motion parameters', architecture:'Dataset and benchmark with adapted baselines; not one learned model', trainCost:'N/A for dataset; baseline-dependent', inferCost:'N/A for dataset; baseline-dependent', compute:'Dataset download; baseline-dependent',
  },
  'RLWRLD human-data engine': {
    date:'2026-05', input:'Bare-hand/object demonstrations plus captured workspace', output:'Five-finger robot trajectories and simulation-rolled VLA demonstrations', architecture:'Hand/object tracking → 3DGS workspace → hand retargeting → simulator rollout', trainCost:'Converter: N/A; downstream VLA training is separate', inferCost:'200+ converted demonstrations / hour', compute:'Managed converter; simulator and hardware not disclosed',
  },
  'Ego2Robot conversion engine': {
    date:'2026-08', input:'Annotated egocentric datasets or raw in-the-wild video', output:'Robot-composited RGB, camera-relative EEF actions, camera parameters, and instruction', architecture:'Hand/subtask recovery → keypoint-to-TCP map → MuJoCo base/IK search → rendering → multilevel QA', trainCost:'Converter N/R; downstream VLA: 8×A100, 200k pretrain + 50k fine-tune steps', inferCost:'Conversion runtime not reported', compute:'Converter not released; downstream training used 8×A100',
  },
  'EgoSuite-Open100K': {
    date:'2026-08', input:'Head-mounted egocentric video; optional wrist view', output:'LeRobot v3 / MCAP episodes with hand pose, body subset, and semantic events', architecture:'Capture → pose/event annotation → robotics-format packaging; not one learned architecture', trainCost:'N/A · dataset product; annotation compute not reported', inferCost:'N/A · processing rate not reported', compute:'Gated local download after approval',
  },
  'Ropedia HOMIE / Xperience': {
    date:'2026-03', input:'Synchronized ego RGB, depth, IMU, audio, and optional multiview streams', output:'Raw streams plus SLAM, pose, MANO, language, mesh, and 3DGS layers', architecture:'HOMIE capture → proprietary spatial processing engine → dataset / DaaS delivery', trainCost:'N/A for capture; processing/training cost not reported', inferCost:'Processing rate not reported', compute:'Managed processing; datasets downloadable for local use',
  },
  'Vidur action labeling': {
    date:'2026-07', input:'Untrimmed ego, teleoperation, robot-head, or external video', output:'Gap-aware atomic-action intervals with timestamps and language labels', architecture:'Video understanding → temporal segmentation → semantic labeling → deterministic QA', trainCost:'Training cost not reported; >20k h processed internally', inferCost:'Exact video-hours/hour and price not reported', compute:'Managed early-access service; no local deployment',
  },
  'World Labs Atlas': {
    date:'2026-09', input:'Text, images/video, camera poses, depth, or explicit 3D context', output:'Camera-controlled RGB/depth, point clouds, 3DGS, and space-time variations', architecture:'Multimodal autoregressive rectified-flow transformer over shared spatial VAE latents', trainCost:'Parameters, data volume, and training compute not reported', inferCost:'Generation latency and price not reported', compute:'Managed partner early access; no local weights',
  },
  'World Labs R2S2R': {
    date:'2026-07', input:'Physical robot, sensors, scene, objects, task, and interaction evidence', output:'Task-aligned simulation, varied rollouts, policy scores, and failure maps', architecture:'Proprietary generative world model + iterative real→sim→policy→real validation loop', trainCost:'System construction and policy-training cost not reported', inferCost:'2,000 sim trials / checkpoint reported; elapsed time not reported', compute:'Closed preview; no public API or local deployment',
  },
  'Masked Visual Actions': {
    date:'2026-07', input:'Reference frame plus partially revealed robot- or object-motion video', output:'Completed interaction video; optional action estimate through inverse-dynamics model', architecture:'Wan-Fun-Control 2.2 14B + shared VAE + spatial conditioning; rank-256 LoRA', trainCost:'8×H200 × 4 days × ≈10k steps (≈768 GPU-hours inferred)', inferCost:'Wall-clock inference not reported', compute:'Local 14B GPU stack; code and weights released',
  },
  TraceGen: {
    date:'2025-11', input:'Human/robot video, language, and five target warm-up videos', output:'32-step semantic 3D keypoint traces plus adapted robot behavior', architecture:'DINO + SigLIP + depth encoders → D=768 tokens → CogVideoX-derived 3D flow transformer', trainCost:'123k videos / 1.8M triplets; GPU-hours not reported', inferCost:'50–600× pixel-video models; 3.8× trace baselines on RTX A5000', compute:'0.67B parameters; local NVIDIA GPU; code/weights/data released',
  },
  'GPT Image 2': {
    date:'2026-04', input:'Text plus optional reference images', output:'Generated or edited raster image at selectable size and quality', architecture:'Architecture and training recipe not publicly reported', trainCost:'Closed pretrained service; training compute not reported', inferCost:'Token-metered API; exact image price depends on size and quality', compute:'API only; no client-side accelerator or local weights',
  },
  'Qwen-Image 2.0': {
    date:'2026-02', input:'Instruction up to ≈1k tokens plus optional images', output:'Unified generated/edited image up to native 2K', architecture:'Frozen Qwen3-VL + f16c64 VAE + MMDiT with MSRoPE; DMD-distilled student', trainCost:'700k pretrain + 250k continual + 10k SFT steps; GPU-hours not reported', inferCost:'40-step teacher or 4-NFE distilled student; wall time not reported', compute:'Hosted demo/API; 2.0 local weights not verified',
  },
  'Wan2.1-Fun-14B-InP': {
    date:'2025-04', input:'Text plus start/end/reference images and inpaint/control video', output:'Variable-resolution, duration, and FPS generated/inpainted video', architecture:'14B diffusion transformer + VAE + flow sampler; LoRA or full tuning', trainCost:'FSDP/DeepSpeed recipe released; reference GPU-hours not reported', inferCost:'Default 50 steps; wall time not reported', compute:'≈47 GB weights; large NVIDIA GPU, offload, or multi-GPU',
  },
  'Wan2.2-TI2V-5B': {
    date:'2025-07', input:'Text and optional conditioning image', output:'5-second 720p video at 24 fps', architecture:'Dense 5B diffusion transformer + high-compression 4×16×16 VAE', trainCost:'Training compute not reported', inferCost:'<9 min for 5 s / 720p on one consumer GPU', compute:'≥24 GB VRAM with offload; ≥80 GB avoids offload',
  },
  ProPainter: {
    date:'2023-09', input:'Video frames plus per-frame masks', output:'Temporally completed / inpainted video', architecture:'RAFT flow + recurrent flow completion + dual-domain propagation + sparse video transformer', trainCost:'YouTube-VOS 3,471 videos; GPU-hours not reported', inferCost:'Wall time not reported; 720p×50 frames uses 19 GB in fp16', compute:'Local CUDA/PyTorch; ≈2–19 GB VRAM by resolution',
  },
  'Project Aria Tools': {
    date:'2023-10', input:'Aria VRS recordings, calibration, and synchronized sensor streams', output:'Decoded synchronized data, transforms, calibration, MPS products, and exports', architecture:'C++/Python data-provider toolkit; not a learned model', trainCost:'N/A', inferCost:'Dataset-dependent; no canonical throughput reported', compute:'Local CPU on Linux/macOS; cloud MPS is separate',
  },
  'Aria MPS Hand Tracking': {
    date:'2024-03', input:'Uploaded Aria recording and calibration', output:'Timestamped 3D wrist, palm, and finger landmarks with confidence', architecture:'Proprietary cloud MPS hand-tracking model; architecture not reported', trainCost:'Training compute not reported', inferCost:'Cloud turnaround N/R; Aria Gen 2 on-device tracker outputs 30 Hz', compute:'Cloud MPS + local reader; Gen 2 also supports on-device tracking',
  },
  'LiteReality-Agent': {
    date:'2026-08', input:'LiDAR iOS capture, RoomPlan USDZ, posed RGB-D, calibration, and point cloud', output:'Programmable Room.py / Blender scene with articulated PBR assets', architecture:'Deterministic initialization → Articraft/TRELLIS branch → edit–render–compare agent loop → QA', trainCost:'Uses pretrained dependencies; system training N/A', inferCost:'Runtime not reported; ≤100 tool calls per iteration described', compute:'iOS LiDAR + Blender workstation; exact GPU/API cost not reported',
  },
  LiteReality: {
    date:'2025-07', input:'Indoor RGB-D scan', output:'Editable artistic meshes with PBR materials, articulation, and basic physics', architecture:'Perception → scene graph → asset clustering/retrieval → MLLM materials → procedural assembly', trainCost:'Training-free retrieval; component pretraining/API cost not reported', inferCost:'End-to-end runtime not reported', compute:'Local GPU + renderer/model dependencies',
  },
  TRELLIS: {
    date:'2024-12',
    input:'Text or one/multiple reference images',
    output:'Radiance field, 3D Gaussians, or textured mesh (.glb / .ply)',
    architecture:'SLAT sparse structured latent + rectified-flow transformer; 1.2B image model, up to 2B',
    trainCost:'A100 multi-node recipe released; total GPU-hours not reported',
    inferCost:'Runtime not standardized in the release',
    compute:'NVIDIA GPU ≥16 GB; verified on A100 / A6000',
  },
  'TRELLIS.2': {
    date:'2025-12',
    input:'Single reference image; optional shape-conditioned PBR texturing',
    output:'PBR textured mesh at 512³–1536³ (.glb; preview .mp4)',
    architecture:'4B O-Voxel model: sparse 3D VAE + separate shape/material diffusion transformers',
    trainCost:'Training code exposed; total pretraining GPU-hours not reported',
    inferCost:'H100: ≈3 s at 512³; ≈17 s at 1024³; ≈60 s at 1536³',
    compute:'NVIDIA GPU ≥24 GB; CUDA 12.4; verified on A100 / H100',
  },
  Meshy: {
    date:'2026-??', input:'Text, image, multi-image set, or conversational edit', output:'Mesh asset (.glb / .fbx / .obj / .usdz / .stl)', architecture:'Proprietary generation, remesh, topology, and texturing stack; architecture not reported', trainCost:'Closed pretrained service; training compute not reported', inferCost:'Meshy 7 advertises <1 min; Smart Topology ≈10 s', compute:'Hosted service / API; no local weights',
  },
  'Tripo v3.1': {
    date:'2026-??', input:'Reference image', output:'UV-mapped PBR mesh (.glb)', architecture:'Proprietary image-to-3D model; architecture not reported', trainCost:'Closed pretrained service; training compute not reported', inferCost:'Runtime and per-job compute not reported', compute:'Hosted REST API; no v3.1 local weights',
  },
  'Hyper3D Rodin (Deemos)': {
    date:'2026-??', input:'Text or 1–5 reference images', output:'Raw/quad PBR mesh (.glb / .usdz / .fbx / .obj / .stl)', architecture:'Proprietary Rodin Gen-2.5 model; architecture not reported', trainCost:'Closed pretrained service; training compute not reported', inferCost:'Runtime and per-job compute not reported', compute:'Hosted API; open clients, no local model weights',
  },
  'SAM 3D Objects': {
    date:'2025-11', input:'Image plus object mask', output:'Object pose/layout plus textured Gaussian-splat asset (.ply)', architecture:'Progressive multi-stage generative model with synthetic pretraining and feedback alignment', trainCost:'Dataset scale disclosed; GPU-hours not reported', inferCost:'Runtime and VRAM not reported', compute:'Local GPU/Python; exact memory floor not reported',
  },
  'Hunyuan3D 2.1': {
    date:'2025-06', input:'Single reference image', output:'Shape mesh plus PBR texture maps', architecture:'3.3B flow-matching Shape DiT + 2B Paint model', trainCost:'Training GPU-hours not reported', inferCost:'End-to-end runtime not reported', compute:'10 GB shape; 21 GB texture; 29 GB combined',
  },
  'World from Motion': {
    date:'2026-07', input:'Monocular dynamic video', output:'Persistent dynamic 3DGS with novel views and motion', architecture:'Pixel-aligned appearance/geometry/motion conditioning → video prior → distillation into dynamic Gaussians', trainCost:'Aligned multiview-video / dynamic-3DGS data; GPU-hours not reported', inferCost:'Runtime not reported', compute:'Hardware requirement not reported',
  },
  Immediate3DGS: {
    date:'2026-07', input:'Unordered image collection', output:'Camera graph/poses plus hierarchical global 3DGS', architecture:'Place/covisibility graph → matching/local GS optimization → loop closure → progressive hierarchy', trainCost:'No custom pretraining; per-scene optimization', inferCost:'Scene runtime not reported', compute:'GPU; PyTorch 2.7.1 and CUDA 11.8/12.8 or ROCm',
  },
  AnyRecon: {
    date:'2026-04', input:'Arbitrary unordered sparse views', output:'Generated views plus persistent geometry memory and reconstruction', architecture:'Capture cache + geometry memory → view selection → contextual video diffusion → four-step distillation', trainCost:'Training compute not reported', inferCost:'Runtime not reported', compute:'GPU-heavy; exact memory requirement not reported',
  },
  'M³': {
    date:'2026-03', input:'Uncalibrated monocular video', output:'Intrinsics, camera poses, and static-scene 3DGS', architecture:'Pi3X + dense matching → factor-graph optimization → dynamic suppression → ARTDECO Gaussian mapper', trainCost:'Training compute not reported', inferCost:'Runtime not reported', compute:'GPU; exact VRAM not reported',
  },
  'On-the-fly NVS': {
    date:'2025-06', input:'Ordered unposed images/video with strong consecutive overlap', output:'Camera poses plus clustered scalable 3DGS', architecture:'Fast pose initialization + GPU mini-BA + primitive sampling → joint fitting → cluster/merge/offload', trainCost:'No custom pretraining; per-scene fitting', inferCost:'Scene-dependent; no single comparable runtime', compute:'CUDA GPU; PyTorch 2.7; Linux/Windows',
  },
  FoundationStereo: {
    date:'2025-01', input:'Rectified stereo images plus calibration and baseline', output:'Disparity, metric depth, and point cloud', architecture:'Side-tuned DINOv2/monocular priors + cost volume + long-range filtering/refinement', trainCost:'1M curated synthetic stereo pairs; GPU-hours not reported', inferCost:'TensorRT FP16 ≈6× PyTorch on RTX 3090; absolute latency N/R', compute:'Tested on 3090/4090/A100/V100/Jetson Orin',
  },
  VGGT: {
    date:'2025-03', input:'One or more images', output:'Cameras, depth, point maps, and tracks', architecture:'1B transformer aggregator with camera/depth/point/track prediction heads', trainCost:'Training compute not reported', inferCost:'Typical scene reconstruction <1 s; visualization can take tens of seconds', compute:'GPU/BF16; memory scales with frame count',
  },
  MASt3R: {
    date:'2024-06', input:'Image pairs or sets', output:'Dense point maps/confidence, descriptors, matches, and optional global alignment', architecture:'Asymmetric CroCo/DUSt3R ViT-L encoder–decoder + CatMLP/DPT heads', trainCost:'Official training command uses 8 GPUs; duration not reported', inferCost:'Runtime not reported', compute:'CUDA recommended; CPU possible but slow',
  },
  'Depth Anything V2': {
    date:'2024-06', input:'Single RGB image', output:'Relative depth or checkpoint-specific indoor/outdoor metric depth', architecture:'DINOv2 ViT-S/B/L/G encoder + DPT decoder; teacher/student synthetic-label training', trainCost:'Training compute not reported', inferCost:'Official repository reports no canonical latency', compute:'24.8M–1.3B variants; edge/GPU requirement depends on model',
  },
  'Depth Anything 3': {
    date:'2025-11', input:'One or more images with optional camera poses', output:'Consistent depth/confidence, cameras, and optional 3DGS/GLB', architecture:'Plain DINO transformer + unified depth-ray target / DualDPT; teacher–student training', trainCost:'Public academic datasets; GPU-hours not reported', inferCost:'Runtime not reported; streaming mode documents <12 GB VRAM', compute:'GPU; 80M–1.4B variants',
  },
  MetricAnything: {
    date:'2026-01', input:'Released students: RGB+focal or RGB only', output:'Metric depth or metric point map with inferred intrinsics', architecture:'Sparse-prompt teacher over 20M pairs distilled to prompt-free 876.66M/326M students', trainCost:'Training compute not reported', inferCost:'Runtime not reported', compute:'Depth student CPU/GPU; point-map example uses CUDA',
  },
  GenRec: {
    date:'2026-08', input:'Sparse posed visual observations', output:'Evidence-backed reconstruction plus plausible completed views/scene coordinates', architecture:'Observation masks + scene-coordinate prediction + multiview flow matching', trainCost:'Training compute not reported', inferCost:'Runtime not reported', compute:'Code and model not released',
  },
  '3D Gaussian Splatting': {
    date:'2023-08', input:'COLMAP-calibrated photographs', output:'Scene-specific anisotropic 3D Gaussians plus differentiable renderer', architecture:'Gaussian parameter optimization + adaptive density control + visibility-aware tile rasterizer', trainCost:'Per-scene optimization; duration is dataset-dependent', inferCost:'Canonical result ≥30 FPS at 1080p', compute:'CUDA GPU; high VRAM recommended for paper-quality fitting',
  },
  'HUGS animatable human Gaussians': {
    date:'2023-11', input:'Monocular human video plus SMPL/camera initialization', output:'Scene Gaussians plus animatable human Gaussian field', architecture:'Canonical human Gaussians + triplane/MLP pose-conditioned attributes + jointly optimized background 3DGS', trainCost:'Per-video fitting; cost not reported', inferCost:'Runtime not reported', compute:'Ubuntu + CUDA GPU',
  },
  gsplat: {
    date:'2025-??', input:'Camera and 3D-Gaussian tensors', output:'Differentiable RGB/depth/feature rasterization', architecture:'CUDA rasterization library with PyTorch bindings and multiple projection strategies', trainCost:'Library N/A; reference fit uses up to 4× less memory', inferCost:'Scene/configuration dependent; no canonical latency', compute:'CUDA; Nerfstudio Splatfacto ≈6 GB default / ≈12 GB big',
  },
  'NVIDIA 3DGRUT': {
    date:'2025-03', input:'Posed images or COLMAP reconstruction', output:'Optimized Gaussian scene and RGB / USD / PLY / NuRec export', architecture:'3DGRT volumetric ray tracing + 3DGUT unscented projection + hybrid raster/traced rays', trainCost:'Per-scene fit: ≈331–556 s on current RTX 5090 examples', inferCost:'RTX 5090 examples: ≈299–465 FPS, scene-specific', compute:'CUDA; RT cores recommended for ray tracing',
  },
  'SAM 2.1': {
    date:'2024-09', input:'Image/video plus point, box, or mask prompt', output:'Masks/masklets with tracked object identities', architecture:'Hiera encoder + prompt/mask decoder + streaming-memory transformer; 38.9M–224.4M', trainCost:'Training code released; pretraining compute not reported', inferCost:'A100 compiled: 91.2→39.5 FPS from tiny→large', compute:'PyTorch ≥2.5.1 + CUDA GPU/custom kernel',
  },
  'SAM 3': {
    date:'2025-11', input:'Image/video plus text, exemplar, point, box, or mask', output:'Masks, boxes, scores, and tracks', architecture:'848M shared encoder + conditioned DETR detector + SAM2-derived tracker', trainCost:'4M+ concepts annotated; compute not reported', inferCost:'30 FPS requires 2–8×H200 depending on tracked-object count', compute:'CUDA ≥12.6; PyTorch ≥2.7; optional FlashAttention3',
  },
  'Grounding DINO': {
    date:'2023-03', input:'Image plus open-vocabulary text query', output:'Boxes, phrase labels, and confidence scores', architecture:'Image/text backbones + feature enhancer + language-guided queries + cross-modal DINO decoder', trainCost:'Training compute not reported', inferCost:'Runtime not reported', compute:'CUDA/PyTorch',
  },
  XMem: {
    date:'2022-07', input:'Video plus initial/reference object masks', output:'Propagated per-frame object masks', architecture:'Sensory, working, and compressed long-term memory with memory reading', trainCost:'Training compute not reported', inferCost:'≈20 FPS, hardware-dependent; bounded memory over >10k frames', compute:'GPU/PyTorch',
  },
  HaMeR: {
    date:'2023-12', input:'Hand crop or full image', output:'MANO pose/shape, 3D joints, mesh, and camera', architecture:'Pretrained ViT encoder + transformer decoder/regression token', trainCost:'Scaled mixed hand data; GPU-hours not reported', inferCost:'Runtime not reported', compute:'CUDA 11.7/PyTorch + licensed MANO model',
  },
  WiLoR: {
    date:'2024-09', input:'Full image containing one or more hands', output:'Hand detections plus MANO reconstructions', architecture:'Fully convolutional localizer + high-fidelity transformer reconstructor', trainCost:'>2M in-the-wild hand images; GPU-hours not reported', inferCost:'Fast mode up to 1.6×; absolute latency not reported', compute:'PyTorch 2.0/CUDA 11.7 + MANO',
  },
  HaWoR: {
    date:'2025-01', input:'Egocentric monocular video', output:'World-space MANO state, root trajectories, and camera trajectory', architecture:'WiLoR features + temporal image/pose attention + masked DROID-SLAM + transformer infiller', trainCost:'HOT3D/DexYCB-derived data; compute not reported', inferCost:'Runtime not reported', compute:'CUDA/Python plus multiple upstream models',
  },
  EmbodMocap: {
    date:'2026-02', input:'Static RGB-D scan plus synchronized dual-iPhone RGB-D video', output:'Metric scene mesh, calibrated cameras, and world-aligned SMPL motion', architecture:'SpectacularAI/COLMAP alignment + pose/depth/mask priors + multiview optimization', trainCost:'Capture/reconstruction fitting cost not reported', inferCost:'End-to-end runtime not reported', compute:'Two iPhones + GPU; exact VRAM not reported',
  },
  SMPL: {
    date:'2015-11', input:'Body-shape coefficients and joint pose', output:'Posed 6,890-vertex human mesh and joints', architecture:'Learned template/blend shapes/joint regressor + linear blend skinning', trainCost:'Fit once from registered body scans; compute not reported', inferCost:'Analytic forward pass; runtime not reported', compute:'CPU/GPU ecosystem; licensed model files',
  },
  GVHMR: {
    date:'2024-09', input:'Monocular human video plus optional camera rotation/visual odometry', output:'Camera/world SMPL motion, root velocity/trajectory, and gravity alignment', architecture:'Gravity-View representation + sequence transformer predicting a 151-D SMPL latent', trainCost:'2×RTX 4090 for 420 epochs; elapsed time not reported', inferCost:'Runtime not reported', compute:'CUDA/Python; optional visual odometry',
  },
  VidMap: {
    date:'2026-07', input:'Arbitrary long uncalibrated video', output:'Metric camera intrinsics/poses plus sparse COLMAP map', architecture:'Temporal tracks + loop closure + dense matching + global COLMAP optimization with metric-depth priors', trainCost:'Uses pretrained components; custom training N/A', inferCost:'End-to-end runtime not reported', compute:'Linux x86-64 + NVIDIA GPU; ≈9 GB checkpoints',
  },
  FoundationPose: {
    date:'2023-12', input:'RGB-D plus CAD mesh, or RGB-D plus reference images', output:'Unseen-object 6-DoF registration and tracked pose', architecture:'Unified scorer/refiner transformer; model-free branch builds neural implicit object state', trainCost:'Large synthetic corpus; GPU-hours not reported', inferCost:'Canonical latency not reported; TensorRT via Isaac ROS', compute:'NVIDIA GPU + PyTorch3D/nvdiffrast',
  },
  MegaSaM: {
    date:'2024-12', input:'Casual dynamic monocular video', output:'Camera intrinsics/trajectory plus temporally consistent dense depth', architecture:'Deep visual SLAM + differentiable bundle adjustment + joint camera/depth/global optimization', trainCost:'Training compute not reported', inferCost:'No single comparable runtime reported', compute:'CUDA 11.8 GPU',
  },
  GeoCalib: {
    date:'2024-09', input:'Single image or batch/rig plus optional priors', output:'Focal/intrinsic parameters, distortion, and gravity/up fields', architecture:'CNN perspective-field predictor + differentiable geometric optimizer', trainCost:'OpenPano training; GPU-hours not reported', inferCost:'Runtime not reported', compute:'CPU or CUDA GPU; PyTorch',
  },
  MoGe: {
    date:'2024-10', input:'Single image with optional known field of view', output:'Affine-invariant point map, depth, mask, and field of view', architecture:'DINOv2 ViT encoder + DPT-style geometry head', trainCost:'Official example uses 8 GPUs; duration not reported', inferCost:'ViT-L FP16: ≈60 ms/image on A100 or RTX 3090', compute:'GPU recommended; v1 is 314M parameters',
  },
  FunREC: {
    date:'2026-04', input:'Single egocentric RGB-D interaction video', output:'Canonical meshes, articulated parts/joints/states, contacts, and URDF/USD', architecture:'Part discovery → kinematic/pose estimation → canonical reconstruction → functional graph', trainCost:'Custom training and fitting compute not reported', inferCost:'End-to-end runtime not reported', compute:'Azure Kinect capture + GPU; exact VRAM not reported',
  },
  EgoTrack3D: {
    date:'2026-08', input:'Egocentric RGB with optional depth, boxes, and masks', output:'Persistent static/dynamic object tracks in global 3D', architecture:'Mask lifting + point-motion score + voxel merging + interaction-guided association', trainCost:'Modular pipeline; custom pretraining N/A', inferCost:'Runtime not reported', compute:'Implementation not released',
  },
  'Spark-DSG': {
    date:'2022-06', input:'Typed entities, attributes, mesh references, and edges', output:'Serialized layered dynamic scene graph', architecture:'C++ graph data structure with Python/ROS bindings; not a learned model', trainCost:'N/A', inferCost:'Library-operation benchmark not reported', compute:'CPU/C++/Python; ROS optional',
  },
  Hydra: {
    date:'2022-01', input:'RGB-D or visual-inertial data plus semantics', output:'Online layered DSG with mesh, objects, places, rooms, and corrected poses', architecture:'Local ESDF/topology + room clustering + hierarchical loop closure + deformation-graph correction', trainCost:'System N/A; semantic models external', inferCost:'Online/real-time; hardware-normalized latency not reported', compute:'Ubuntu/ROS 2; optional GPU semantic front end',
  },
  ConceptGraphs: {
    date:'2023-09', input:'Posed RGB-D frames', output:'Open-vocabulary 3D object nodes, descriptors, captions, and semantic/spatial edges', architecture:'2D instances + CLIP → lift/associate/fuse → LLaVA captions + LLM relations', trainCost:'No task-specific training', inferCost:'Runtime not reported', compute:'CUDA 11.8; Grounded-SAM, LLaVA-7B, and LLM dependency',
  },
  Khronos: {
    date:'2024-07', input:'RGB-D, robot trajectory, and semantic masks', output:'4D metric-semantic map with object histories and long-term changes', architecture:'Online background/object-motion front end + factor/scene-graph identity backend', trainCost:'System N/A; optional external segmenter', inferCost:'Real-time; normalized latency not reported', compute:'Ubuntu 24.04 + ROS 2 Jazzy; optional TensorRT/CUDA',
  },
  Clio: {
    date:'2024-04', input:'Sensor/semantic primitives plus natural-language task list', output:'Task-granularity open-set hierarchical dynamic scene graph', architecture:'CLIP/SAM semantics + incremental Information-Bottleneck clustering on Hydra/Khronos', trainCost:'Clustering N/A; upstream models pretrained', inferCost:'Real-time on onboard compute; exact latency not reported', compute:'ROS onboard compute; optional TensorRT; CPU batch mode',
  },
  OpenFunGraph: {
    date:'2025-03', input:'Posed RGB-D or scene point clouds', output:'Object/part nodes plus open-vocabulary functional-relation triplets', architecture:'Grounded-SAM → multiview 3D fusion → LLaVA descriptions → GPT relation construction', trainCost:'No end-to-end training; pretrained upstream models', inferCost:'Runtime not reported; local VLM + hosted LLM work', compute:'CUDA + LLaVA-7B-v1.6 + OpenAI API',
  },
  'Lucida evidence graph': {
    date:'2026-08', input:'Multiview masks, partial point clouds, boxes, and descriptions', output:'Per-instance evidence nodes plus support/containment/adjacency edges', architecture:'System-internal evidence aggregation feeding asset generation and GizmoAct placement', trainCost:'Standalone training not reported', inferCost:'Runtime not reported', compute:'Paper/project only; component not released',
  },
  Mink: {
    date:'2026-02', input:'MuJoCo q, weighted task targets, Δt, and joint/velocity/collision constraints', output:'Generalized velocity v for configuration integration', architecture:'Weighted least-squares differential-IK QP over task Jacobians', trainCost:'N/A · numerical solver', inferCost:'v1.2 ≈3.3× ALOHA / 1.3× G1 on M1 Max; absolute latency N/R', compute:'CPU + MuJoCo/Python/QP solver',
  },
  Pink: {
    date:'2022-02', input:'Pinocchio model, q, task residuals/targets, Δt, and limits', output:'Tangent-space joint velocity v or integrated q', architecture:'First-order differential-IK QP minimizing weighted task residuals', trainCost:'N/A · numerical solver', inferCost:'Runtime not reported', compute:'CPU + Python/Pinocchio + selectable QP solver',
  },
  Pinocchio: {
    date:'2019-??', input:'Articulated model plus q/v/a, forces, and constraints', output:'FK/Jacobians, forward/inverse dynamics, centroidal quantities, and derivatives', architecture:'Cache-friendly C++ Featherstone RNEA/ABA with analytical derivatives', trainCost:'N/A · rigid-body algorithms', inferCost:'Model/hardware dependent; no single latency', compute:'CPU C++/Python/ROS; optional AD/code generation',
  },
  cuRoboV2: {
    date:'2026-03', input:'Robot state/model + pose goal + optional depth/scene/ESDF and dynamics constraints', output:'Batched IK, collision-free trajectory, or MPC action', architecture:'GPU-parallel kinematics/collision + B-spline trajectory optimization + geometric planning', trainCost:'N/A · optimizer/planner', inferCost:'Depth→ESDF ≈1 ms; full-plan latency not standardized', compute:'NVIDIA CUDA GPU; PyTorch/CUDA/Warp',
  },
  'Drake IK': {
    date:'2019-??', input:'MultibodyPlant/context, initial q, and geometric constraints', output:'Numerically optimized feasible configuration q', architecture:'AutoDiff nonlinear MathematicalProgram dispatched to a numerical solver', trainCost:'N/A · numerical solver', inferCost:'Problem/solver-dependent; runtime not reported', compute:'CPU + Drake-supported solver',
  },
  'TRAC-IK': {
    date:'2015-??', input:'URDF/KDL chain, seed q, Cartesian target, bounds, and timeout', output:'IK joint solution', architecture:'Concurrent improved KDL Newton solver and SQP quasi-Newton optimizer', trainCost:'N/A · numerical solver', inferCost:'0.18–0.57 ms mean at 5 ms timeout; Panda 0.37 ms / 99.88%', compute:'CPU C++/ROS/Python',
  },
  IKFast: {
    date:'2010-??', input:'Kinematic chain/Collada model, free joints, and target transform', output:'Robot-specific C++ analytic solver and per-query solution set', architecture:'Symbolic analytic equation solving and code generation', trainCost:'N/A · code generator', inferCost:'Described as fast; comparable numeric benchmark not reported', compute:'CPU for generation and compiled C++ queries',
  },
  'SuperDex IK': {
    date:'2026-??', input:'Robot model, current state, and pose/contact constraints', output:'Joint configuration or trajectory', architecture:'Product-described constraint-aware nonlinear optimizer shared with dynamics', trainCost:'N/A · solver', inferCost:'Runtime not reported', compute:'Platform preview; reproducible compute requirement not reported',
  },
  PhysTwin: {
    date:'2025-03', input:'Calibrated RGB-D video of human/deformable-object interaction', output:'Interactive 3DGS appearance plus spatial material/deformation state', architecture:'3DGS/LBS rendering + CMA-ES initialization + differentiable Warp spring–mass optimization', trainCost:'Per-object fit ≈12 min zero-order + ≈5 min first-order', inferCost:'≈37 FPS on RTX 4090; playground ≈2 GB VRAM', compute:'NVIDIA CUDA; repository uses CUDA 12.1',
  },
  'Material Anything': {
    date:'2024-11', input:'3D mesh plus rendered RGB/normal/confidence views', output:'UV-ready PBR albedo, roughness, metallic, and bump maps', architecture:'Diffusion triple-output head + confidence switch + view estimator + UV refiner', trainCost:'Material3D has >80k objects; GPU-hours not reported', inferCost:'Runtime not reported', compute:'GPU/PyTorch/PyTorch3D + Blender 3.2.2',
  },
  PhysDreamer: {
    date:'2024-04', input:'Static 3D Gaussian object/scene plus view and background', output:'Young’s-modulus/velocity fields and simulated 3D dynamics', architecture:'SVD motion prior + triplane/MLP fields optimized through differentiable MPM and 3DGS', trainCost:'Per-object optimization time not reported', inferCost:'64³ MPM grid; 768 substeps/frame; wall time N/R', compute:'GPU required; exact device not reported',
  },
  'SuperDex Physics': {
    date:'2026-??', input:'Rigid/soft articulations, contacts, tendons, cloth, tactile state, and controls', output:'Differentiable rollouts, contact response, and gradients', architecture:'Product-described contact-first differentiable multiphysics with nonconvex collision', trainCost:'N/A for engine; downstream RL separate', inferCost:'Runtime not reported', compute:'Platform preview; reproducible compute requirement not reported',
  },
  GMR: {
    date:'2025-08', input:'SMPL/SMPL-X, BVH, FBX, GVHMR, or XR motion plus target XML/URDF', output:'Per-frame robot base pose and qpos trajectory', architecture:'Weighted multi-link pose-matching optimization with warm start and velocity limits', trainCost:'N/A · optimization-based retargeter', inferCost:'Real-time CPU claimed; numeric throughput not reported', compute:'CPU + Python/MuJoCo; upstream pose estimation may use GPU',
  },
  'Constraint-based retargeting': {
    date:'1998-07', input:'Source animation, target skeleton, and user/environment spacetime constraints', output:'Globally adapted target animation', architecture:'Spacetime constrained optimization over a motion-displacement curve', trainCost:'N/A · offline optimizer', inferCost:'Three paper examples solved in <10 s on historical workstation', compute:'CPU/workstation; exact specification not reported',
  },
  'Online motion retargeting': {
    date:'2000-12', input:'Streaming source configuration and target end-effector trajectories', output:'Online target joint-angle increments', architecture:'Jacobian resolved-motion-rate control with redundancy objective', trainCost:'N/A · controller', inferCost:'Real-time demonstrated; numeric latency not reported', compute:'CPU/workstation; exact specification not reported',
  },
  'Dynamic Movement Primitives': {
    date:'2002-05', input:'Demonstrated trajectory plus start and goal', output:'Goal/time-scalable stable reference trajectory or control signal', architecture:'Stable second-order attractor + phase-driven nonlinear forcing function', trainCost:'Lightweight locally weighted regression; time not reported', inferCost:'Online ODE integration; numeric latency not reported', compute:'CPU',
  },
  'Nakaoka dance transfer': {
    date:'2003-09', input:'Human marker-based dance motion capture', output:'Mechanically constrained, ZMP-balanced HRP-1S trajectory', architecture:'Essential postures + step primitives → joint sequence → constraint/ZMP adjustment', trainCost:'N/A · offline pipeline', inferCost:'Offline runtime not reported', compute:'CPU/workstation + OpenHRP',
  },
  'Dariush constrained transfer': {
    date:'2008-09', input:'Normalized descriptors from markerless human tracking', output:'Online humanoid joint commands', architecture:'Task-space IK/control with joint-limit, self-collision, and balance constraints', trainCost:'N/A for retargeter', inferCost:'Online demonstrated; numeric latency not reported', compute:'CPU/workstation; exact specification not reported',
  },
  'H2O / OmniH2O': {
    date:'2024-06', input:'AMASS/SMPL motion and sparse human pose from RGB, mocap, VR, or language', output:'Optimized robot motion plus 50 Hz whole-body joint-target policy', architecture:'Motion fitting + privileged PPO teacher + DAgger-distilled history-conditioned MLP', trainCost:'Isaac Gym GPU training; wall time not reported', inferCost:'50 Hz policy / 200 Hz PD; ≈20 ms full-system latency', compute:'Isaac Gym GPU; 2×Jetson Orin NX or laptop RTX 4090 deployment',
  },
  SPIDER: {
    date:'2025-11', input:'Human hand/body/object trajectories plus target embodiment', output:'Physics-feasible dexterous-hand or humanoid q/action trajectory', architecture:'Simulator-in-loop CEM over residual actions around kinematic references', trainCost:'Core optimizer N/A; optional downstream RL separate', inferCost:'Example: 1,024 samples × 32 CEM iterations × 0.6 s horizon', compute:'GPU/batched MuJoCo Warp, Genesis, or Isaac Gym',
  },
  'Direct Dynamic Retargeting': {
    date:'2026-05', input:'Monocular-video human keypoints plus robot and simulator', output:'Dynamically feasible humanoid trajectory and tracking policy', architecture:'Derivative-free CEM on task-space/shape loss → PPO/DeepMimic tracking', trainCost:'Per-motion CEM + RL; wall time/GPU count not reported', inferCost:'Real-time H1-2 deployment shown; numeric rate not reported', compute:'Physics simulator + GPU; exact requirement not reported',
  },
  UMR: {
    date:'2026-09', input:'Human T-pose/motion point clouds plus robot point cloud and kinematic model', output:'Contact-aware constrained robot q trajectory', architecture:'Learned dense surface correspondence + constrained point-cloud matching', trainCost:'Training compute not reported', inferCost:'Runtime not reported', compute:'Hardware requirement not reported',
  },
  'dex-retargeting': {
    date:'2023-07', input:'Human hand keypoints/pose plus target-hand URDF', output:'Robot-hand qpos', architecture:'Pinocchio kinematics + position/vector/key-vector sequential optimization', trainCost:'N/A · optimization-based retargeter', inferCost:'Real-time webcam demo; numeric latency not reported', compute:'CPU core; optional GPU hand detector',
  },
  'wuji-retargeting': {
    date:'2026-04', input:'Glove, Vision Pro, video, RealSense/ZED, or MANUS-style keypoints plus Wuji URDF', output:'Wuji-hand joint commands', architecture:'Adaptive analytical optimizer + key-vector optimizer + kinematic transforms', trainCost:'N/A · optimization-based retargeter', inferCost:'Real-time demos; numeric latency not reported', compute:'Ubuntu CPU; optional sensors and MuJoCo',
  },
  ASAP: {
    date:'2025-02', input:'Real robot logs plus SMPL/AMASS motion and target humanoid', output:'Fitted motion, residual dynamics model, and deployable whole-body policy', architecture:'Motion fitting + PPO tracking + learned delta-action dynamics alignment + fine-tuning', trainCost:'4,096 policy envs; 5,000 delta-model envs; ≈5,800 iterations', inferCost:'Real-time G1 deployment; numeric rate not reported', compute:'NVIDIA GPU + Isaac Gym/Sim/Genesis',
  },
  'Diffusion Policy': {
    date:'2023-03', input:'Recent RGB, robot state, and proprioceptive observations', output:'Receding-horizon continuous action chunk', architecture:'Observation-conditioned action diffusion with 1D U-Net or transformer denoiser', trainCost:'Training compute not reported', inferCost:'10-step DDIM ≈0.1 s on RTX 3080', compute:'NVIDIA GPU + PyTorch',
  },
  ACT: {
    date:'2023-03', input:'Multiview RGB plus robot joint state; future actions only during CVAE training', output:'Joint-position action chunk with temporal ensembling', architecture:'CVAE transformer: action/q encoder + multiview ResNet features + chunk decoder', trainCost:'Training compute not reported', inferCost:'Joint targets at 50 Hz; per-forward latency not reported', compute:'GPU/PyTorch; exact VRAM not reported',
  },
  HPT: {
    date:'2024-09', input:'Embodiment proprioception plus single/multiview RGB and optional language/history', output:'Task-specific continuous control through adaptable head', architecture:'Embodiment tokenizers → shared transformer trunk → task-specific heads', trainCost:'1M–1B models; 170k–200k trajectories; batch 256–2,048; wall time N/R', inferCost:'RTX 3070: Base 47 Hz, XL 19 Hz; A100 ≈3–4× faster', compute:'GPU/PyTorch',
  },
  Octo: {
    date:'2024-05', input:'Multiview RGB/history plus language or goal image', output:'Next four normalized robot actions from diffusion readout', architecture:'Modular tokenizers + attention transformer + diffusion action head; 93M/27M', trainCost:'TPUv4-128: 8 h Small / 14 h Base on 800k trajectories', inferCost:'RTX 4090: 13 it/s Base / 17 it/s Small', compute:'TPU pretraining; GPU/TPU JAX inference and fine-tuning',
  },
  'OpenVLA-OFT': {
    date:'2025-02', input:'One/more RGB views, language, and optional proprioception', output:'Parallel continuous action chunks', architecture:'7B OpenVLA with parallel decoding, continuous actions, chunking, L1 objective, optional FiLM', trainCost:'8×A100/H100 80 GB for 1–2 days; 50k–150k steps', inferCost:'26× action throughput / 3× lower latency than base; absolute latency N/R', compute:'15.9–18.0 GB inference; 25.6–73.5 GB training by setup',
  },
  LeRobot: {
    date:'2024-05', input:'Standardized robot observations/actions and LeRobotDataset', output:'Captured datasets, trained policy, evaluation, and deployed actions', architecture:'PyTorch infrastructure with Robot API, dataset format, policy zoo, and sim/real evaluation', trainCost:'Policy-specific; simple ACT training described as several hours', inferCost:'Policy-specific; no framework-level latency', compute:'CPU/MPS/CUDA; GPU recommended for training',
  },
  ICRT: {
    date:'2024-08', input:'Prompt demonstrations plus current left/wrist RGB and proprioception', output:'Closed-loop chunk of 16 continuous actions', architecture:'Vision transformer + token projectors/pooling + 12-layer d=768 causal transformer + MLP decoder', trainCost:'8 GPUs; <1 day with frozen vision, >2 days on 8×A100 if unfrozen', inferCost:'Near 15 Hz with FlashAttention-2', compute:'8-GPU DDP training + CUDA 12.4 + high-throughput SSD',
  },
  'GEN-1.5': {
    date:'2026-08', input:'30 s multimodal context containing 3–12 s sensorimotor physical prompt', output:'100 Hz action trajectory', architecture:'Large multimodal embodied foundation model; backbone/parameters undisclosed', trainCost:'Continuously pretrained >8 months; device count not reported', inferCost:'100 Hz output; per-forward latency/compute not reported', compute:'Closed company system; deployment hardware not reported',
  },
  'Qwen-RobotManip': {
    date:'2026-06', input:'Multiview RGB, language, embodiment prompt, proprioception, and optional action history', output:'Continuous chunks in masked 80-D canonical action space', architecture:'Qwen3.5-4B VLM + 10-block d=768 flow-matching DiT expert; four Euler steps', trainCost:'38,100 h corpus; GPU-hours/device count not reported', inferCost:'Four Euler steps + remote server / RTC; absolute latency not reported', compute:'Weights/training code not released; server hardware not reported',
  },
  'Humanoid Behavior Foundation Model': {
    date:'2026-07', input:'Humanoid proprioception plus masked root-relative whole-body target pose', output:'Desired joint angles for 200 Hz PD control', architecture:'Asymmetric PPO + ≈3M-parameter Humanoid Transformer with state/action/future/task tokens', trainCost:'Largest setup: 64 GPUs × 8,192 envs/GPU; 22,200 epochs', inferCost:'TensorRT 50 Hz policy / 200 Hz low-level PD', compute:'64-GPU training; Jetson Orin or local PC deployment',
  },
};

const arxivDate = (href: string) => {
  const match = href.match(/arxiv\.org\/(?:abs|html|pdf)\/(\d{2})(\d{2})\./);
  if (!match) return undefined;
  const year = Number(match[1]) >= 90 ? `19${match[1]}` : `20${match[1]}`;
  return `${year}-${match[2]}`;
};

export const capabilityDetailFor = (tool: Capability): CapabilityDetail => {
  const base = stageInterfaces[tool.stage] ?? { input:'Method-specific observations and constraints', output:'Method-specific reusable representation or prediction' };
  const override = detailOverrides[tool.name] ?? {};
  return {
    date: override.date ?? arxivDate(tool.href) ?? `${tool.year}-??`,
    input: override.input ?? base.input,
    output: override.output ?? base.output,
    architecture: override.architecture ?? tool.capability,
    trainCost: override.trainCost ?? 'Pretraining / fitting cost not reported',
    inferCost: override.inferCost ?? tool.metric,
    compute: override.compute ?? tool.local,
  };
};
