import { descendantPapers, researchTree, type ResearchNode } from './decision-tree-data';

export type LandscapeNode = {
  id: string;
  parent?: string;
  depth: number;
  sector: number;
  data: ResearchNode;
  papers: string[];
  position: [number, number, number];
};
export const branchColors = ['#6fe0b7', '#79bafa', '#f4bd79', '#b8a0fa'];

// Preserve the taxonomy exactly: spatial placement carries no performance metric.
export function buildLandscape(): LandscapeNode[] {
  const nodes: LandscapeNode[] = [];
  function visit(data: ResearchNode, depth: number, start: number, end: number, sector: number, parent?: string) {
    const id = data.kind === 'paper' ? data.paper : data.id;
    const papers = descendantPapers(data).map(leaf => leaf.paper);
    const angle = (start + end) / 2;
    const radius = depth === 0 ? 0 : data.kind === 'paper' ? 43 : Math.min(38, 8 + depth * 8);
    nodes.push({ id, parent, depth, sector, data, papers, position: [Math.cos(angle) * radius, data.kind === 'paper' ? 17 + depth * 3 : -18 + depth * 9, Math.sin(angle) * radius] });
    if (data.kind === 'decision') {
      let cursor = start;
      data.children.forEach((child, index) => {
        const span = (end - start) * descendantPapers(child).length / papers.length;
        visit(child, depth + 1, cursor + .035, cursor + span - .035, depth === 0 ? index : sector, id);
        cursor += span;
      });
    }
  }
  visit(researchTree, 0, -.8, Math.PI * 2 - .8, 0);
  return nodes;
}
export const landscapeNodes = buildLandscape();
