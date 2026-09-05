import { composableGrasping, progressMilestones, researchLineages, type ResearchLineage } from '../research-lineages-data';

export type Language = 'en' | 'zh';

const english = {
  title: 'Research lineages', titleEmphasis: '& progress.',
  eyebrow: 'A critical reading guide · 2018—2026',
  intro: 'Many papers share a pipeline. The useful history follows the assumptions they remove, the capabilities they enable, and the evidence they add.',
  familiesCount: 'research families', papersCount: 'selected papers', dateBasis: 'First-preprint dates',
  compare: 'Compare families ↓', readChronology: 'Read the chronology ↓', explore: 'Explore this guide',
  format: 'Format', editorial: 'Editorial', compact: 'Compact', language: 'Language',
  formatHint: 'Compact: concise tables and a chronological reading list.',
  readingEyebrow: 'How to read this map', readingTitle: 'What counts as substantive progress?',
  readingIntro: 'Architectural repetition can coexist with useful progress. Compare the technical boundary and downstream result, rather than counting modules in a pipeline diagram.',
  scopeTitle: 'Scope & dating',
  scope: 'This is an editorial grouping of representative papers in the atlas, not an exhaustive survey or a claim of direct ancestry. Dates use the first arXiv submission month; contributions summarize the cited versions reviewed. Later revisions may add evidence. SoMA starts in February 2026, PolaRiS in December 2025, and AINA in November 2025. Chronological order does not imply overall superiority or priority for every result.',
  familiesEyebrow: 'Shared architectures', familiesTitle: 'Seven families.', familiesSubtitle: 'Different technical frontiers.',
  familiesIntro: 'Each group exposes the recurring structure, then orders its papers by first-preprint month. Read the contribution column to see where similar diagrams hide different advances.',
  familyNav: 'Research families', sharedPipeline: 'Shared pipeline', papers: 'papers',
  tableHint: 'Scroll the table horizontally to compare →',
  firstPreprint: 'First preprint', paperName: 'Paper / common name', advance: 'What moved forward',
  paper: 'Paper ↗', atlas: 'Atlas entry ↗', takeaway: 'Editorial takeaway',
  adjacentEyebrow: 'An adjacent direction', adjacentTitle: 'Composable priors', adjacentSubtitle: 'for grasping.',
  adjacentNote: 'Its contribution centers on cross-hand grasp synthesis and module interfaces. It should be assessed separately from advances in physical scene reconstruction.',
  chronologyEyebrow: 'A chronology of substantive advances', chronologyTitle: 'A history of', chronologyEmphasis: 'assumptions removed.',
  chronologyIntro: 'Selected turning points across parallel research directions. These are reading priorities, not first-invention claims; overlapping periods reflect concurrent work.',
  period: 'Period', representativePapers: 'Representative papers', change: 'Capability change',
  frontierEyebrow: 'The open frontier', frontierTitle: 'Can the model predict', frontierSubtitle: 'the consequence of a new action?',
  synthesis: 'Our synthesis: useful progress moves from known geometry to joint identification, controlled capture to natural video, pose matching to contact feasibility, single scenes to task distributions, and visual demonstrations to predictions of real policy performance.',
  remainingTest: 'The remaining test is whether these gains survive new interventions, contact sequences, embodiments, and tasks, at a practical acquisition and computation cost.',
  continue: 'Continue exploring', fullPipelines: 'Compare full pipelines ↗', history: 'Historical foundations ↗', breakdown: 'Inspect the shared pipeline ↗',
};

const chinese: Record<keyof typeof english, string> = {
  title: '研究谱系', titleEmphasis: '与实质进展',
  eyebrow: '批判性阅读指南 · 2018—2026',
  intro: '许多论文共享同一套流程。更有用的技术史，应追踪它们移除了什么假设、拓展了什么能力，以及补上了什么证据。',
  familiesCount: '个研究家族', papersCount: '篇代表论文', dateBasis: '按首稿日期排列',
  compare: '比较研究家族 ↓', readChronology: '阅读进展编年史 ↓', explore: '浏览本页',
  format: '版式', editorial: '图文', compact: '紧凑', language: '语言',
  formatHint: '紧凑模式：简洁表格与按时间排列的阅读清单。',
  readingEyebrow: '如何阅读这张图谱', readingTitle: '什么才算实质进展？',
  readingIntro: '架构重复与实质进展可以并存。应比较技术边界与下游效果，而不是统计流程图中的模块数量。',
  scopeTitle: '范围与日期',
  scope: '本页是对图谱中代表论文的技术归纳，并非完整综述，也不意味着直接继承。日期统一使用 arXiv 首稿月份；贡献依据所查阅的论文版本总结，后续修订可能补充证据。SoMA 首稿为 2026-02，PolaRiS 为 2025-12，AINA 为 2025-11。时间先后不代表全面优劣，也不代表所有结果的首创顺序。',
  familiesEyebrow: '共享架构', familiesTitle: '七个研究家族，', familiesSubtitle: '不同的技术前沿。',
  familiesIntro: '每组先展示共同骨架，再按首稿月份排列论文。比较“具体推进了什么”，才能看出相似流程图背后的不同贡献。',
  familyNav: '研究家族', sharedPipeline: '共同流程', papers: '篇论文',
  tableHint: '左右滑动表格，比较完整内容 →',
  firstPreprint: '首稿', paperName: '论文名称／缩写', advance: '具体推进了什么',
  paper: '论文 ↗', atlas: '图谱条目 ↗', takeaway: '技术判断',
  adjacentEyebrow: '相邻方向', adjacentTitle: '可组合先验', adjacentSubtitle: '与抓取控制',
  adjacentNote: '其贡献重点是跨手抓取与模块接口设计，应与真实场景物理重建的进展分开评价。',
  chronologyEyebrow: '实质进展编年史', chronologyTitle: '一部', chronologyEmphasis: '被移除的假设的历史。',
  chronologyIntro: '从并行的研究方向中选取转折点。这是阅读优先级判断，并非首创权裁定；时间区间重叠表示不同方向同时推进。',
  period: '时间', representativePapers: '代表工作', change: '值得记住的能力变化',
  frontierEyebrow: '尚待突破的边界', frontierTitle: '模型能否预测', frontierSubtitle: '一个新动作的后果？',
  synthesis: '我们的归纳：有价值的进展体现为从已知几何到联合辨识，从受控采集到自然视频，从姿态匹配到接触可行，从单场景到任务分布，从视觉展示到预测真实策略表现。',
  remainingTest: '接下来的检验是：面对新的干预、接触顺序、机器人形态和任务，这些进展能否依然成立，并保持可接受的采集与计算成本。',
  continue: '继续探索', fullPipelines: '比较完整流程 ↗', history: '查看历史基础 ↗', breakdown: '拆解共同流程 ↗',
};

export const copy = { en: english, zh: chinese };
export const criteria = {
  en: [
    ['Remove an assumption', 'Known geometry becomes jointly estimated; controlled capture becomes natural interaction video.'],
    ['Cross a capability boundary', 'Pose matching becomes contact-feasible motion; trajectory replay becomes prediction under new actions.'],
    ['Reduce the cost of useful output', 'Measure human effort, compute, and failure rate per usable scene, trajectory, or policy improvement.'],
    ['Strengthen downstream evidence', 'Test real deployment, held-out interventions, and simulation-to-reality policy ranking under controlled comparisons.'],
  ],
  zh: [
    ['移除一个假设', '从假设几何已知到联合估计，从受控采集到自然交互视频。'],
    ['跨越能力边界', '从姿态匹配到接触可行动作，从轨迹回放到预测新动作的响应。'],
    ['降低有效产出的成本', '衡量每个可用场景、轨迹或策略改进所需的人力、算力与失败率。'],
    ['增强下游证据', '通过受控比较，检验实机部署、未见干预，以及仿真与现实中的策略排名。'],
  ],
};

type FamilyTranslation = Pick<ResearchLineage, 'title' | 'spine' | 'question' | 'takeaway'>;
export const familyTranslations: Record<string, FamilyTranslation> = {
  'neural-simulation': {
    title: '神经渲染与策略仿真', spine: ['重建真实场景', '渲染与物理仿真', '训练或评测策略'],
    question: '共同骨架相近，但优化目标在视觉迁移、策略学习、吞吐量与评测之间变化。',
    takeaway: '实质变化在于学习闭环、视觉迁移、生产效率与评测有效性；“又接了一次 3DGS + simulator”本身不足以证明关键进展。',
  },
  'articulated-assets': {
    title: '关节结构与功能资产', spine: ['恢复物体部件', '推断关节结构', '输出可交互资产'],
    question: '共同目标是恢复部件与运动约束；分歧在于结构来自实际交互证据，还是模型先验。',
    takeaway: '关键进展是结构复杂度与采集条件的放宽；需要分别衡量“生成了合理关节”和“恢复了这个真实物体的正确关节”。',
  },
  'physical-identification': {
    title: '物理辨识与动力学', spine: ['观察动态或主动交互', '辨识物理状态', '预测新的响应'],
    question: '显式参数辨识、生成先验驱动物理、直接学习动力学，是相关但不同的三条分支。',
    takeaway: '最强的检验是新干预预测能力：换一个施力位置、动作或接触顺序，能否仍然预测正确，而不只是复现录制轨迹。',
  },
  'motion-retargeting': {
    title: '动作迁移与接触可行性', spine: ['恢复人类动作', '跨身体映射', '得到可执行行为'],
    question: '动作恢复与重定向反复出现；真正困难的边界逐渐从姿态匹配转向环境交互和接触。',
    takeaway: '清晰的进展线是：姿态相似 → 动作可执行 → 交互关系保留 → 接触可行数据规模化；交互结构与动力学修正相互补充。',
  },
  'video-supervision': {
    title: '视频监督与数据规模化', spine: ['恢复视频动作', '对齐或合成训练数据', '预训练策略'],
    question: '手部恢复、相机运动补偿、动作对齐与质量筛选反复出现；数据来源、监督需求和规模各不相同。',
    takeaway: 'AINA 减少机器人监督，EgoScale 研究规模规律，Ego2Robot 扩大生产规模与形态覆盖；它们不是同一个排行榜上的三个版本。',
  },
  'world-action-models': {
    title: '世界模型与动作接口', spine: ['条件化视频模型', '预测或更新状态', '规划或适应任务'],
    question: '同一个视频模型基础可以支撑不同能力：持续状态、动作可控性，或上下文任务执行。',
    takeaway: '状态持续性、动作可控性和任务条件化是分别成立的进展；这些证据还不能合并成“已经得到通用、可靠的物理模拟器”。',
  },
  'scene-production': {
    title: '场景分布与自动化生产', spine: ['构建数字孪生', '变换或组装场景', '验证有效产出'],
    question: '这些系统组合已有能力来构造训练与评测环境，其价值高度依赖端到端产出。',
    takeaway: '应衡量每个有效场景的人工时间、转换成功率与真实策略收益；可运行的转换与下游实机改进，是不同层级的证据。',
  },
};

// Stable arXiv IDs keep translations attached to sources when display names change.
export const paperTranslations: Record<string, string> = {
  '2403.03949': '将真实示范通过 inverse distillation 带入数字孪生，再用 RL 增强抗扰动能力。',
  '2409.10161': '用 Gaussian Splatting 缩小 RGB 观测域差，并验证操作策略的零样本实机迁移。',
  '2502.08645': '将重建、跨视角渲染和仿真特权状态生成示范接成数据生产流程。',
  '2510.15352': '将高保真渲染接入向量化物理仿真，推进像素策略训练的吞吐量。',
  '2512.16881': '用成对的仿真／现实实验检验策略表现相关性，使仿真成为更可信的评测信号。',
  '2202.08227': '从交互前后的观察联合恢复部件几何与关节模型。',
  '2406.08474': '将 articulation 表达为代码生成问题，支持更复杂的多部件结构。',
  '2410.13882': '用 VLM、资产检索和生成—评判—修正循环自动构造可交互物体。',
  '2604.05621': '从自然的第一视角 RGB-D 交互视频恢复功能场景，减少对受控采集和 CAD 先验的依赖。',
  '2303.05512': '联合估计几何与物理参数，放宽系统辨识中“几何已知”的假设。',
  '2311.12198': '让渲染和连续体仿真共享 Gaussian 表示，减少几何嵌入环节；物理参数仍需提供。',
  '2404.13026': '将视频生成模型的运动先验蒸馏到物理响应中，重点是交互合理性。',
  '2503.00370': '利用机器人交互、关节力矩和相机自动获得几何、碰撞模型与惯性参数。',
  '2602.02402': '将机器人动作纳入软体神经动力学，在所研究的范围内推进超出观测轨迹的可控响应预测。',
  '1804.02717': '结合动作模仿与任务奖励，学习能在物理仿真中响应扰动的控制策略。',
  '2403.04436': '用特权模仿器筛选可行动作，并实现 RGB 驱动的实机全身遥操作。',
  '2505.03729': '联合重建人和环境，学习上下楼梯、坐椅子等依赖场景的全身技能。',
  '2509.26633': '用 interaction mesh 保留人—物—地形的空间与接触关系。',
  '2511.09484': '用物理采样和虚拟接触课程，将运动学示范转成跨身体的动力学可行轨迹。',
  '2503.14526': '从已有机器人轨迹出发，通过仿真物体变化和真实背景合成扩充数据。',
  '2510.21571': '将自然人类视频转成任务粒度、语言和三维动作对齐的 VLA 预训练数据。',
  '2511.16661': '借助智能眼镜提供的三维观测，在所测任务中实现无需机器人训练数据或仿真的多指策略。',
  '2602.16710': '提供大规模人类动作预训练的 scaling 证据，再通过少量对齐数据迁移到灵巧手。',
  '2608.02580': '将动作重定向、机器人视觉合成与多层质量筛选扩展到大规模、多形态训练数据。',
  '2604.01001': '在连续交互中更新显式三维场景状态，缓解跨视角和多阶段生成的结构漂移。',
  '2607.19343': '用像素空间的局部轨迹作为动作接口，同一模型支持正向预测与逆向动作推断。',
  '2608.26103': '用人类视频作为上下文任务说明，通过训练目标抑制已见任务捷径，推进未见任务执行。',
  '2410.07408': '从复制单个场景转向生成保留几何与语义可供性的场景分布，促进策略泛化。',
  '2606.28276': '将视频建场景、物体／场景／任务编辑接成系统，并提供实机泛化与评测相关性证据。',
  '2607.19190': '自动处理工具调用、坐标对齐和仿真组装，跨刚体、软体与人形场景生成可运行 episode。',
  '2609.04096': '将任务理解与物理抓取基策略解耦，使空间、认知、时序先验无需重训基策略即可参与跨手抓取。',
};

export const milestoneTranslations: Record<string, { title: string; change: string; axis: string }> = {
  '2018-04': { title: '示范成为可响应扰动的控制', change: '示范动作成为能在物理仿真中响应扰动的策略。', axis: '控制可行性' },
  '2022-02': { title: '重建结果可以交互', change: '重建物体包含可移动部件与关节结构。', axis: '功能结构' },
  '2023-03': { title: '联合辨识几何与物理', change: '从视频辨识物理参数，放宽物体几何已知的假设。', axis: '移除假设' },
  '2024-03 → 09': { title: '真实—仿真—真实闭环走向实机', change: '在不同任务上，连接真实观测、仿真学习与实机执行。', axis: '部署证据' },
  '2024-10': { title: '从单场景走向训练分布', change: '将保留可供性的场景变化作为促进策略泛化的明确路径。', axis: '分布覆盖' },
  '2025-03': { title: '机器人自动获取物理资产', change: '通过主动交互与力矩感知，减少资产采集中的人工测量。', axis: '采集成本' },
  '2025-05 → 11': { title: '动作迁移显式考虑交互', change: '将环境上下文、交互关系与接触可行性纳入示范迁移。', axis: '接触可行性' },
  '2025-10 → 12': { title: '以速度与实际用途评价仿真', change: '两条独立前沿同时推进：训练吞吐量，以及对真实策略表现的预测。', axis: '效率与有效性' },
  '2026-02': { title: '动作条件动力学与人类数据规模化', change: '两条独立方向：可控软体预测，以及大规模人类到机器人的迁移。', axis: '预测与规模' },
  '2026-04 → 08': { title: '世界模型获得状态与动作接口', change: '分别检验持续状态、统一动作条件化，以及视频引导的任务泛化。', axis: '状态与动作落地' },
  '2026-06 → 09': { title: '生产与组合成为研究目标', change: '推进环境构建、数据生产与模块化能力；其价值取决于有效产出和下游验证。', axis: '生产与组合' },
};

export function localizedResearch(language: Language) {
  if (language === 'en') return { families: researchLineages, grasping: composableGrasping, milestones: progressMilestones };
  return {
    families: researchLineages.map(family => ({ ...family, ...familyTranslations[family.id], papers: family.papers.map(paper => ({ ...paper, advance: paperTranslations[paper.arxiv] })) })),
    grasping: { ...composableGrasping, advance: paperTranslations[composableGrasping.arxiv] },
    milestones: progressMilestones.map(milestone => ({ ...milestone, ...milestoneTranslations[milestone.date] })),
  };
}
