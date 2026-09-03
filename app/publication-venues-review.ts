// Independent venue audit for Pipeline Atlas records dated 2024--2026.
// Reviewed 2026-09-03. `verified` means an archival main-conference or journal
// publication was traceable to proceedings, a DOI record, or an official
// project/author page. An arXiv DOI, workshop appearance, talk, or submission
// alone is not treated as an archival venue.

export const publicationVenueReview: Record<
  string,
  { label: string; verified: boolean; evidence: string; note?: string }
> = {
  SoMA: {
    label: 'International Conference on Machine Learning (ICML), 2026',
    verified: true,
    evidence: 'Official ICML 2026 paper listing: https://icml.cc/Downloads/2026',
  },
  MicroDuck: {
    label: 'Open-source software release (2026)',
    verified: false,
    evidence: 'Official repository: https://github.com/pollen-robotics/microduck_rl',
    note: 'No archival paper is identified by the project repository.',
  },
  'ReaDy-Go': {
    label: 'IEEE Robotics and Automation Letters (RA-L), 2026',
    verified: true,
    evidence: 'DOI 10.1109/LRA.2026.3707355: https://doi.org/10.1109/LRA.2026.3707355',
  },
  Ego2Robot: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2608.02580',
    note: 'No archival venue is listed on the current paper record.',
  },
  'RLDX-1': {
    label: 'Company technical report (2026)',
    verified: false,
    evidence: 'Technical-report record: https://arxiv.org/abs/2605.03269',
    note: 'The work is explicitly presented as a technical report, not an archival publication.',
  },
  'World Labs Atlas': {
    label: 'Company technical disclosure (2026)',
    verified: false,
    evidence: 'World Labs product article: https://www.worldlabs.ai/blog/atlas',
    note: 'A company article is not an archival peer-reviewed venue.',
  },
  GenRec: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2608.17832',
    note: 'No archival venue is listed on the current paper record.',
  },
  EgoTrack3D: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2608.08016',
    note: 'No archival venue is listed on the current paper record.',
  },
  SiMDex: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'Official project citation: https://lin-nie.github.io/SiMDex/',
    note: 'The project citation remains an arXiv article; no accepted archival venue is claimed.',
  },
  VidMap: {
    label: 'European Conference on Computer Vision (ECCV), 2026',
    verified: true,
    evidence: 'Official implementation and proceedings citation: https://github.com/cvg/vidmap',
  },
  'World Labs R2S2R': {
    label: 'Company technical article (2026)',
    verified: false,
    evidence: 'World Labs article: https://www.worldlabs.ai/blog/real-to-sim-to-real',
    note: 'The article documents a system and experiments but is not an archival paper.',
  },
  'Masked Visual Actions': {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'Official project citation: https://masked-visual-actions.github.io/',
    note: 'The official BibTeX is @misc/arXiv and names no accepted venue.',
  },
  'World from Motion': {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2607.01202',
    note: 'No archival venue is listed on the current paper record.',
  },
  'WAM-TTT': {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2607.06988',
    note: 'No archival venue is listed on the current paper record.',
  },
  Wh0: {
    label: 'Under review (2026)',
    verified: false,
    evidence: 'Official project citation: https://chenyt31.github.io/wh0.github.io/',
    note: 'The official BibTeX says “Under review”; this is not an acceptance.',
  },
  GenHOI: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2606.12995',
    note: 'No archival venue is listed on the current paper record.',
  },
  EgoScale: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2602.16710',
    note: 'No archival venue is listed by the current NVIDIA project/paper metadata.',
  },
  EgoHumanoid: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2602.10106',
    note: 'No archival venue is listed on the current paper record.',
  },
  DexImit: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2602.10105',
    note: 'No archival venue is listed on the current paper record.',
  },
  Lucida: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'Official project citation: https://lucida-r2s.github.io/',
    note: 'The official BibTeX labels Lucida an arXiv preprint and names no archival venue.',
  },
  'Zero-WAM': {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2608.26103',
    note: 'No archival venue is listed on the current paper record.',
  },
  'Agentic Real2Sim': {
    label: 'arXiv preprint / project release (2026)',
    verified: false,
    evidence: 'Official project citation: https://agentic-real2sim.github.io/',
    note: 'The project BibTeX uses @misc/howpublished=Project website; no archival venue is claimed.',
  },
  RoboSnap: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'Official project citation: https://robosnap.github.io/',
    note: 'The official BibTeX is @misc/arXiv and names no accepted venue.',
  },
  SimFoundry: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2606.28276',
    note: 'No archival venue is listed on the current paper record.',
  },
  'μ₀': {
    label: 'arXiv preprint / model release (2026)',
    verified: false,
    evidence: 'Official model-card citation: https://huggingface.co/furonghuang-lab/mu0',
    note: 'The official citation identifies an arXiv preprint, not an archival venue.',
  },
  'Qwen-RobotManip': {
    label: 'Technical report (2026)',
    verified: false,
    evidence: 'Technical-report record: https://arxiv.org/abs/2606.17846',
    note: 'The title and official record identify a technical report; no archival acceptance is listed.',
  },
  EgoEngine: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2606.12604',
    note: 'A workshop spotlight is non-archival and is not counted as a publication venue.',
  },
  WorldComposer: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'Official repository citation: https://github.com/jaber628/WorldComposer',
    note: 'The repository cites the work as @misc/arXiv and names no accepted venue.',
  },
  EgoSim: {
    label: 'European Conference on Computer Vision (ECCV), 2026',
    verified: true,
    evidence: 'Official project page: https://egosimulator.github.io/',
  },
  ExoGS: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2601.18629',
    note: 'No archival venue is listed on the current paper or repository citation.',
  },
  GSWorld: {
    label: 'IEEE International Conference on Robotics and Automation (ICRA), 2026',
    verified: true,
    evidence: 'Official project page: https://3dgsworld.github.io/',
  },
  'RobotArena∞': {
    label: 'International Conference on Learning Representations (ICLR), 2026',
    verified: true,
    evidence: 'Official ICLR proceedings: https://proceedings.iclr.cc/paper_files/paper/2026/hash/2aa3da3c1463ee2cdaaee94be4f8ba3f-Abstract-Conference.html',
  },
  GaussGym: {
    label: 'ICLR 2026 submission; no archival acceptance verified',
    verified: false,
    evidence: 'OpenReview manuscript marked under review: https://openreview.net/pdf?id=w1xbvA3rBk',
    note: 'Submission metadata and an under-review manuscript are not evidence of acceptance.',
  },
  'Real2Sim Soft Bodies': {
    label: 'arXiv preprint (2025)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2511.04665',
    note: 'No archival venue is listed on the current paper record.',
  },
  TraceGen: {
    label: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2026',
    verified: true,
    evidence: 'Official project page with proceedings citation: https://tracegen.github.io/',
  },
  HDMI: {
    label: 'Preprint / in submission (2025)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2509.16757',
    note: 'The current paper record lists only the project page; author metadata still describes it as in submission.',
  },
  VideoMimic: {
    label: 'Conference on Robot Learning (CoRL), 2025',
    verified: true,
    evidence: 'PMLR 305 proceedings: https://proceedings.mlr.press/v305/allshire25a.html',
  },
  'Scalable Real2Sim': {
    label: 'IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), 2025',
    verified: true,
    evidence: 'Official implementation identifies IROS 2025: https://github.com/nepfaff/scalable-real2sim',
  },
  ReBot: {
    label: 'IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), 2025',
    verified: true,
    evidence: 'DOI 10.1109/IROS60139.2025.11246305: https://doi.org/10.1109/IROS60139.2025.11246305',
  },
  'X-Sim': {
    label: 'Conference on Robot Learning (CoRL), 2025',
    verified: true,
    evidence: 'PMLR 305 proceedings: https://proceedings.mlr.press/v305/dan25a.html',
  },
  'Re³Sim': {
    label: 'IEEE International Conference on Robotics and Automation (ICRA), 2026',
    verified: true,
    evidence: 'Official implementation and proceedings citation: https://github.com/InternRobotics/Re3Sim',
  },
  SplatSim: {
    label: 'IEEE International Conference on Robotics and Automation (ICRA), 2025',
    verified: true,
    evidence: 'DOI 10.1109/ICRA55743.2025.11128339: https://doi.org/10.1109/ICRA55743.2025.11128339',
  },
  RialTo: {
    label: 'Robotics: Science and Systems (RSS), 2024',
    verified: true,
    evidence: 'Official RSS XX proceedings: https://www.roboticsproceedings.org/rss20/p015.html',
  },
  Immediate3DGS: {
    label: 'ACM SIGGRAPH Conference Papers, 2026',
    verified: true,
    evidence: 'Official GraphDeco implementation identifies the SIGGRAPH 2026 paper: https://github.com/graphdeco-inria/i3dgs',
  },
  AnyRecon: {
    label: 'ACM SIGGRAPH Asia, 2026',
    verified: true,
    evidence: 'Official project page: https://yutian10.github.io/AnyRecon/',
  },
  'M³': {
    label: 'ACM SIGGRAPH Asia, 2026',
    verified: true,
    evidence: 'Official project page: https://city-super.github.io/M3/',
  },
  'LiteReality-Agent': {
    label: 'Project release (2026)',
    verified: false,
    evidence: 'Official project page: https://litereality.github.io/Litereality-agent-site/',
    note: 'No standalone archival paper or accepted venue is identified by the project page.',
  },
  LiteReality: {
    label: 'Advances in Neural Information Processing Systems (NeurIPS), 2025',
    verified: true,
    evidence: 'Official NeurIPS proceedings: https://proceedings.neurips.cc/paper_files/paper/2025/hash/ee4bfd01b0b7278aaa8c8127632f4635-Abstract-Conference.html',
  },
  'On-the-fly NVS': {
    label: 'ACM Transactions on Graphics 44(4) / SIGGRAPH, 2025',
    verified: true,
    evidence: 'Official GraphDeco implementation and TOG citation: https://github.com/graphdeco-inria/on-the-fly-nvs',
  },
  H2O: {
    label: 'IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), 2024',
    verified: true,
    evidence: 'DOI 10.1109/IROS58592.2024.10801984: https://doi.org/10.1109/IROS58592.2024.10801984',
  },
  OmniH2O: {
    label: 'Conference on Robot Learning (CoRL), 2024',
    verified: true,
    evidence: 'PMLR 270 proceedings: https://proceedings.mlr.press/v270/he25b.html',
    note: 'The conference was held in 2024; PMLR volume 270 was published in 2025.',
  },
  HumanPlus: {
    label: 'Conference on Robot Learning (CoRL), 2024',
    verified: true,
    evidence: 'PMLR 270 proceedings: https://proceedings.mlr.press/v270/fu25a.html',
    note: 'The conference was held in 2024; PMLR volume 270 was published in 2025.',
  },
  'GMR Retargeting': {
    label: 'IEEE International Conference on Robotics and Automation (ICRA), 2026',
    verified: true,
    evidence: 'Official implementation identifies the ICRA 2026 paper: https://github.com/YanjieZe/GMR',
  },
  'SPIDER Retargeting': {
    label: 'IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), 2026',
    verified: true,
    evidence: 'Author publication page: https://haozhi.io/',
  },
  UMR: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2609.02134',
    note: 'This record was submitted on 2026-09-02 and lists no archival venue.',
  },
  EmbodMocap: {
    label: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2026',
    verified: true,
    evidence: 'Official implementation and acceptance notice: https://github.com/WenjiaWang0312/EmbodMocap',
  },
  HumanX: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'Official author publication page: https://wyhuai.github.io/info/',
    note: 'The author page labels HumanX “arXiv 2026” and names no accepted venue.',
  },
  AINA: {
    label: 'IEEE International Conference on Robotics and Automation (ICRA), 2026',
    verified: true,
    evidence: 'Official project page: https://aina-robot.github.io/',
  },
  HumanEgo: {
    label: 'arXiv preprint (2026)',
    verified: false,
    evidence: 'arXiv record: https://arxiv.org/abs/2605.24934',
    note: 'No archival venue is listed on the current paper record.',
  },
  OmniRetarget: {
    label: 'IEEE International Conference on Robotics and Automation (ICRA), 2026',
    verified: true,
    evidence: 'Official project page and award record: https://omniretarget.github.io/',
    note: 'The project reports both the ICRA 2026 Best Conference Paper Award and Best Paper Award on Robot Manipulation and Locomotion.',
  },
  FunREC: {
    label: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2026',
    verified: true,
    evidence: 'CVF Open Access proceedings: https://openaccess.thecvf.com/content/CVPR2026/html/Delitzas_FUN_REC__Reconstructing_Functional_3D_Scenes_from_Egocentric_Interaction_CVPR_2026_paper.html',
  },
  REACT3D: {
    label: 'IEEE Robotics and Automation Letters (RA-L), 2026',
    verified: true,
    evidence: 'DOI 10.1109/LRA.2026.3674028 and official project page: https://react3d.github.io/',
  },
};
