export type TreeLanguage = 'en' | 'zh';
export type TreeText = Record<TreeLanguage, string>;
export type PaperLeaf = { kind: 'paper'; paper: string; answer: TreeText };
export type DecisionNode = { kind: 'decision'; id: string; answer: TreeText; question: TreeText; children: ResearchNode[] };
export type ResearchNode = DecisionNode | PaperLeaf;
const text = (en: string, zh: string): TreeText => ({ en, zh });
const leaf = (paper: string, en: string, zh: string): PaperLeaf => ({ kind: 'paper', paper, answer: text(en, zh) });
const decision = (id: string, answer: TreeText, question: TreeText, children: ResearchNode[]): DecisionNode => ({ kind: 'decision', id, answer, question, children });

// Edges distinguish primary research objectives, not exclusive capability sets.
// Paper IDs are source keys; papers only occur at terminal nodes, once each.
export const researchTree: DecisionNode = decision('root', text('Real-to-sim research', 'Real-to-Sim 研究'), text('What is the primary output you need?', '你最需要得到什么产出？'), [
  decision('assets', text('An interactive asset or scene', '可交互的资产或场景'), text('Recover object structure, or construct a scene distribution?', '恢复物体结构，还是构建场景分布？'), [
    decision('articulation', text('Recover movable parts and joints', '恢复可动部件与关节'), text('Where does the articulation evidence come from?', '关节结构的证据从哪里来？'), [
      decision('observed-motion', text('Observe the object moving', '观察物体真实运动'), text('Controlled before/after views, or natural interaction video?', '受控的前后状态，还是自然交互视频？'), [
        leaf('2202.08227', 'Before/after observations → part geometry + joint model', '交互前后观察 → 部件几何与关节模型'),
        leaf('2604.05621', 'Egocentric RGB-D interaction → functional scene', '第一视角 RGB-D 交互 → 功能场景'),
      ]),
      decision('structural-priors', text('Infer structure with model priors', '借助模型先验推断结构'), text('Predict articulation code, or iteratively generate and critique it?', '直接预测关节代码，还是反复生成与评判？'), [
        leaf('2406.08474', 'Recovered part geometry → LLM articulation code', '恢复部件几何 → LLM 生成关节代码'),
        leaf('2410.13882', 'Asset retrieval + VLM proposal/critique → refined articulation', '资产检索与 VLM 生成／评判 → 修正关节结构'),
      ]),
    ]),
    decision('scene-production', text('Construct scenes for downstream use', '构建可供下游使用的场景'), text('Is the main contribution variation, downstream validation, or automatic assembly?', '主要贡献是场景变化、下游验证，还是自动组装？'), [
      leaf('2410.07408', 'Affordance-preserving cousins → a training distribution', '保留可供性的 cousins → 训练分布'),
      leaf('2606.28276', 'Editable twins/cousins → policy transfer + correlated evaluation', '可编辑孪生与 cousins → 策略迁移及相关性评测'),
      leaf('2607.19190', 'Agent-driven tool orchestration → runnable episodic twins', '智能体编排工具 → 可运行的 episode 孪生'),
    ]),
  ]),
  decision('dynamics', text('A controllable physical or visual response', '可控的物理或视觉响应'), text('Identify physical properties, or model the response itself?', '辨识物理属性，还是建模响应本身？'), [
    decision('identification', text('Identify physical properties from reality', '从现实中辨识物理属性'), text('Use visual dynamics, or instrumented robot interaction?', '利用视觉动态，还是机器人交互与传感？'), [
      leaf('2303.05512', 'Multi-view video → joint geometry and parameter identification', '多视角视频 → 联合辨识几何与物理参数'),
      leaf('2503.00370', 'Camera + robot torques → geometry, collision, and inertia', '相机与机器人力矩 → 几何、碰撞模型及惯性'),
    ]),
    decision('response-model', text('Build a model that responds to interventions', '构建能响应干预的模型'), text('Use explicit mechanics, or learned state transitions?', '采用显式力学，还是学习状态转移？'), [
      decision('explicit-mechanics', text('Explicit continuum mechanics', '显式连续体力学'), text('Supply physical parameters, or infer plausible behavior from a video prior?', '给定物理参数，还是用视频先验推断合理行为？'), [
        leaf('2311.12198', 'Shared Gaussian rendering/physics representation + supplied parameters', '共享 Gaussian 渲染／物理表示，并给定参数'),
        leaf('2404.13026', 'Video-generation motion priors → plausible physical response', '视频生成运动先验 → 合理的物理响应'),
      ]),
      decision('learned-transition', text('Learned dynamics or video transitions', '学习动力学或视频转移'), text('What grounds and controls the predicted response?', '用什么来约束和控制预测响应？'), [
        leaf('2602.02402', 'Robot actions → soft-body Gaussian dynamics', '机器人动作 → 软体 Gaussian 动力学'),
        leaf('2604.01001', 'Updatable 3D scene state → consistent interaction video', '可更新的三维场景状态 → 一致的交互视频'),
        leaf('2607.19343', 'Masked pixel trajectories → forward and inverse action modeling', '像素轨迹掩码 → 正向与逆向动作建模'),
      ]),
    ]),
  ]),
  decision('behavior', text('Executable actions or learning data', '可执行动作或训练数据'), text('Transfer motion, create supervision, or specify a task at execution?', '迁移动作、构造监督数据，还是在执行时指定任务？'), [
    decision('motion-transfer', text('Turn motion into feasible robot behavior', '将动作转为机器人可行行为'), text('Is the emphasis motion tracking or interaction preservation?', '重点是动作跟踪，还是保留交互？'), [
      decision('tracking', text('Track reference motion with physical control', '用物理控制跟踪参考动作'), text('Learn simulated imitation, or deploy camera-driven teleoperation?', '学习仿真模仿，还是部署相机驱动的遥操作？'), [
        leaf('1804.02717', 'Motion imitation + task rewards → responsive simulated control', '动作模仿与任务奖励 → 可响应扰动的仿真控制'),
        leaf('2403.04436', 'Feasibility filtering + RGB input → real humanoid teleoperation', '可行性筛选与 RGB 输入 → 实机人形遥操作'),
      ]),
      decision('interaction-transfer', text('Preserve how the body interacts with its world', '保留身体与环境的交互方式'), text('Recover context, preserve relationships, or repair dynamic feasibility?', '恢复上下文、保留交互关系，还是修正动力学可行性？'), [
        leaf('2505.03729', 'Joint human/scene reconstruction → contextual whole-body skills', '联合重建人与场景 → 依赖环境的全身技能'),
        leaf('2509.26633', 'Interaction mesh → preserved body/object/terrain relationships', '交互网格 → 保留身体／物体／地形关系'),
        leaf('2511.09484', 'Physics sampling + contact curriculum → feasible cross-body trajectories', '物理采样与接触课程 → 跨身体可行轨迹'),
      ]),
    ]),
    decision('supervision', text('Create or scale action supervision', '构造或规模化动作监督'), text('Is the source robot data or human video?', '来源是机器人数据，还是人类视频？'), [
      leaf('2503.14526', 'Existing robot trajectories → object and visual augmentation', '已有机器人轨迹 → 物体及视觉增广'),
      decision('human-data', text('Human demonstrations', '人类示范'), text('Avoid robot training data, or align human data for broader pretraining?', '免除机器人训练数据，还是对齐人类数据以预训练？'), [
        leaf('2511.16661', 'Smart-glasses 3D observations → policies without robot training data', '智能眼镜三维观测 → 无需机器人训练数据的策略'),
        decision('pretraining', text('Human data as a scalable pretraining source', '以人类数据作为可扩展的预训练来源'), text('Improve action labels, test scaling, or synthesize robot-format data?', '完善动作标签、检验规模规律，还是合成机器人格式数据？'), [
          leaf('2510.21571', 'Unscripted human activity → task/language/3D-action aligned VLA data', '自然人类活动 → 任务／语言／三维动作对齐的 VLA 数据'),
          leaf('2602.16710', 'Large human pretraining + aligned transfer → scaling evidence', '大规模人类预训练与对齐迁移 → 规模规律证据'),
          leaf('2608.02580', 'Retargeting + robot visual synthesis + curation → multi-morphology data', '重定向、机器人视觉合成与筛选 → 多形态数据'),
        ]),
      ]),
    ]),
    decision('task-interface', text('Specify or compose a task at execution', '在执行时指定或组合任务'), text('Condition on a human video, or compose semantic priors with a grasp policy?', '以人类视频指定任务，还是组合语义先验与抓取策略？'), [
      leaf('2608.26103', 'In-context human video → unseen-task policy execution', '上下文人类视频 → 未见任务的策略执行'),
      leaf('2609.04096', 'Composable priors + shared physical grasp evaluator → cross-hand grasping', '可组合先验与共享物理抓取评估器 → 跨手抓取'),
    ]),
  ]),
  decision('simulation-use', text('Simulation that trains or evaluates policies', '用于策略训练或评测的仿真'), text('Improve a policy, scale its training, or predict its real performance?', '改进策略、扩展训练吞吐量，还是预测真实表现？'), [
    decision('policy-learning', text('Improve policies using reconstructed worlds', '用重建世界改进策略'), text('Robustify a real policy, or learn from visually aligned synthetic data?', '增强真实策略的鲁棒性，还是用视觉对齐的合成数据学习？'), [
      leaf('2403.03949', 'Real demonstrations + inverse distillation + RL → robustness', '真实示范、逆向蒸馏与 RL → 鲁棒性'),
      decision('synthetic-learning', text('Learn from visually aligned simulation', '从视觉对齐的仿真中学习'), text('Close the RGB gap, or automate expert demonstration production?', '缩小 RGB 域差，还是自动生产专家示范？'), [
        leaf('2409.10161', 'Gaussian rendering → zero-shot RGB manipulation transfer', 'Gaussian 渲染 → RGB 操作策略的零样本迁移'),
        leaf('2502.08645', 'Reconstruction + cross-view rendering + privileged experts → training data', '重建、跨视角渲染与特权专家 → 训练数据'),
      ]),
    ]),
    leaf('2510.15352', 'Vectorized physics + Gaussian rendering → high-throughput pixel learning', '向量化物理与 Gaussian 渲染 → 高吞吐像素策略学习'),
    leaf('2512.16881', 'Paired sim/real trials → policy-performance correlation', '成对仿真／实机试验 → 策略表现相关性'),
  ]),
]);

export function descendantPapers(node: ResearchNode): PaperLeaf[] {
  return node.kind === 'paper' ? [node] : node.children.flatMap(descendantPapers);
}
export function paperPath(paper: string, node: DecisionNode = researchTree): DecisionNode[] {
  for (const child of node.children) {
    if (child.kind === 'paper' && child.paper === paper) return [node];
    if (child.kind === 'decision') {
      const path = paperPath(paper, child);
      if (path.length) return [node, ...path];
    }
  }
  return [];
}
