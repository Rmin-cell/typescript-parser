import { ControlFlowGraph, BasicBlock } from "./cfg-generator";

export class CFGVisualizer {
  private svg: SVGSVGElement;
  private cfg: ControlFlowGraph | null = null;
  private nodeRadius = 30;
  private nodeSpacing = 150;
  private levelSpacing = 100;

  constructor(svgElement: SVGSVGElement) {
    this.svg = svgElement;
  }

  render(cfg: ControlFlowGraph): void {
    this.cfg = cfg;
    this.clear();
    
    if (cfg.blocks.size === 0) {
      this.renderEmpty();
      return;
    }
    
    // Layout the graph
    const layout = this.layoutGraph(cfg);
    
    // Render nodes
    this.renderNodes(layout);
    
    // Render edges
    this.renderEdges(layout);
    
    // Set SVG viewBox to fit all content
    this.fitViewBox(layout);
  }

  private layoutGraph(cfg: ControlFlowGraph): Map<string, { x: number; y: number; level: number }> {
    const layout = new Map<string, { x: number; y: number; level: number }>();
    const visited = new Set<string>();
    const queue: Array<{ blockId: string; level: number }> = [];
    
    // Start with entry block
    if (cfg.entryBlock) {
      queue.push({ blockId: cfg.entryBlock, level: 0 });
    }
    
    // BFS to assign levels
    while (queue.length > 0) {
      const { blockId, level } = queue.shift()!;
      
      if (visited.has(blockId)) continue;
      visited.add(blockId);
      
      const block = cfg.blocks.get(blockId);
      if (!block) continue;
      
      layout.set(blockId, { x: 0, y: 0, level });
      
      // Add successors to queue
      for (const successorId of block.successors) {
        if (!visited.has(successorId)) {
          queue.push({ blockId: successorId, level: level + 1 });
        }
      }
    }
    
    // Position nodes within each level
    const levelGroups = new Map<number, string[]>();
    for (const [blockId, pos] of layout) {
      if (!levelGroups.has(pos.level)) {
        levelGroups.set(pos.level, []);
      }
      levelGroups.get(pos.level)!.push(blockId);
    }
    
    // Position nodes
    for (const [level, blockIds] of levelGroups) {
      const y = level * this.levelSpacing + 50;
      const totalWidth = (blockIds.length - 1) * this.nodeSpacing;
      const startX = -totalWidth / 2;
      
      blockIds.forEach((blockId, index) => {
        const x = startX + index * this.nodeSpacing;
        const pos = layout.get(blockId)!;
        pos.x = x;
        pos.y = y;
      });
    }
    
    return layout;
  }

  private renderNodes(layout: Map<string, { x: number; y: number; level: number }>): void {
    if (!this.cfg) return;
    
    for (const [blockId, pos] of layout) {
      const block = this.cfg.blocks.get(blockId);
      if (!block) continue;
      
      // Create group for the node
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "cfg-node");
      group.setAttribute("data-block-id", blockId);
      
      // Create circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", pos.x.toString());
      circle.setAttribute("cy", pos.y.toString());
      circle.setAttribute("r", this.nodeRadius.toString());
      circle.setAttribute("fill", this.getNodeColor(block));
      circle.setAttribute("stroke", "#374151");
      circle.setAttribute("stroke-width", "2");
      
      // Create text
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", pos.x.toString());
      text.setAttribute("y", pos.y.toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-family", "monospace");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#1f2937");
      text.textContent = blockId;
      
      group.appendChild(circle);
      group.appendChild(text);
      
      this.svg.appendChild(group);
    }
  }

  private renderEdges(layout: Map<string, { x: number; y: number; level: number }>): void {
    if (!this.cfg) return;
    
    for (const edge of this.cfg.edges) {
      const fromPos = layout.get(edge.from);
      const toPos = layout.get(edge.to);
      
      if (!fromPos || !toPos) continue;
      
      // Calculate edge path
      const path = this.calculateEdgePath(fromPos, toPos, edge.label);
      
      // Create path element
      const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathElement.setAttribute("d", path);
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute("stroke", this.getEdgeColor(edge.label));
      pathElement.setAttribute("stroke-width", "2");
      pathElement.setAttribute("marker-end", "url(#arrowhead)");
      
      this.svg.appendChild(pathElement);
    }
    
    // Add arrowhead marker definition
    this.addArrowheadMarker();
  }

  private calculateEdgePath(from: { x: number; y: number }, to: { x: number; y: number }, label?: string): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < this.nodeRadius * 2) {
      // Self-loop
      const controlX = from.x + 50;
      const controlY = from.y - 50;
      return `M ${from.x + this.nodeRadius} ${from.y} Q ${controlX} ${controlY} ${from.x} ${from.y - this.nodeRadius}`;
    }
    
    // Calculate intersection points with circles
    const angle = Math.atan2(dy, dx);
    const fromX = from.x + this.nodeRadius * Math.cos(angle);
    const fromY = from.y + this.nodeRadius * Math.sin(angle);
    const toX = to.x - this.nodeRadius * Math.cos(angle);
    const toY = to.y - this.nodeRadius * Math.sin(angle);
    
    if (label === "fall-through") {
      // Straight line for fall-through
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      // Curved line for jumps
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const controlX = midX + (dy > 0 ? 30 : -30);
      const controlY = midY - (dx > 0 ? 30 : -30);
      
      return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
    }
  }

  private addArrowheadMarker(): void {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");
    
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
    polygon.setAttribute("fill", "#6b7280");
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
  }

  private getNodeColor(block: BasicBlock): string {
    if (block.isEntry) return "#10b981"; // Green for entry
    if (block.isExit) return "#ef4444"; // Red for exit
    return "#3b82f6"; // Blue for regular blocks
  }

  private getEdgeColor(label?: string): string {
    switch (label) {
      case "JUMP_IF_TRUE": return "#10b981"; // Green for true branch
      case "JUMP_IF_FALSE": return "#ef4444"; // Red for false branch
      case "fall-through": return "#6b7280"; // Gray for fall-through
      default: return "#3b82f6"; // Blue for regular jumps
    }
  }

  private fitViewBox(layout: Map<string, { x: number; y: number; level: number }>): void {
    if (layout.size === 0) return;
    
    const positions = Array.from(layout.values());
    const minX = Math.min(...positions.map(p => p.x)) - this.nodeRadius - 20;
    const maxX = Math.max(...positions.map(p => p.x)) + this.nodeRadius + 20;
    const minY = Math.min(...positions.map(p => p.y)) - this.nodeRadius - 20;
    const maxY = Math.max(...positions.map(p => p.y)) + this.nodeRadius + 20;
    
    this.svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
  }

  private renderEmpty(): void {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "0");
    text.setAttribute("y", "0");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-family", "monospace");
    text.setAttribute("font-size", "14");
    text.setAttribute("fill", "#6b7280");
    text.textContent = "No control flow graph available";
    
    this.svg.appendChild(text);
  }

  private clear(): void {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }
}