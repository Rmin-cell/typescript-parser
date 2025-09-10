import { ThreeAddressInstruction } from "./intermediate-code";
import { ControlFlowGraph, BasicBlock } from "./cfg-generator";

export interface LiveRange {
  variable: string;
  start: number;
  end: number;
}

export interface InterferenceEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface InterferenceGraph {
  nodes: Set<string>;
  edges: InterferenceEdge[];
  nodeColors: Map<string, number>;
  nodeDegrees: Map<string, number>;
}

export interface RegisterAllocation {
  variableToRegister: Map<string, string>;
  spilledVariables: Set<string>;
  interferenceGraph: InterferenceGraph;
  allocationSteps: AllocationStep[];
}

export interface AllocationStep {
  step: number;
  description: string;
  action: 'simplify' | 'spill' | 'color' | 'coalesce';
  node?: string;
  color?: number;
  register?: string;
  graph: InterferenceGraph;
}

export class RegisterAllocator {
  private instructions: ThreeAddressInstruction[] = [];
  private cfg: ControlFlowGraph;
  private liveRanges: Map<string, LiveRange> = new Map();
  private interferenceGraph: InterferenceGraph;
  private allocationSteps: AllocationStep[] = [];
  private availableRegisters: string[] = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'];
  private maxRegisters: number = 8;

  constructor(cfg: ControlFlowGraph, instructions: ThreeAddressInstruction[]) {
    this.cfg = cfg;
    this.instructions = instructions;
    this.interferenceGraph = {
      nodes: new Set(),
      edges: [],
      nodeColors: new Map(),
      nodeDegrees: new Map()
    };
  }

  allocate(): RegisterAllocation {
    console.log("RegisterAllocator: Starting register allocation");
    
    // Step 1: Build live ranges
    this.buildLiveRanges();
    console.log("RegisterAllocator: Built live ranges:", this.liveRanges);

    // Step 2: Build interference graph
    this.buildInterferenceGraph();
    console.log("RegisterAllocator: Built interference graph:", this.interferenceGraph);

    // Step 3: Apply graph coloring algorithm
    this.applyGraphColoring();
    console.log("RegisterAllocator: Applied graph coloring");

    // Step 4: Generate final allocation
    const allocation = this.generateAllocation();
    console.log("RegisterAllocator: Generated allocation:", allocation);

    return allocation;
  }

  private buildLiveRanges(): void {
    // For simplicity, we'll use a basic approach:
    // Variables are live from their first use to their last use
    const variableUses: Map<string, { first: number; last: number }> = new Map();

    for (let i = 0; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];
      const variables = this.getVariablesInInstruction(instruction);

      for (const variable of variables) {
        if (!variableUses.has(variable)) {
          variableUses.set(variable, { first: i, last: i });
        } else {
          const range = variableUses.get(variable)!;
          range.last = i;
        }
      }
    }

    // Convert to live ranges
    for (const [variable, range] of variableUses) {
      this.liveRanges.set(variable, {
        variable,
        start: range.first,
        end: range.last
      });
    }
  }

  private buildInterferenceGraph(): void {
    // Initialize nodes
    for (const variable of this.liveRanges.keys()) {
      this.interferenceGraph.nodes.add(variable);
      this.interferenceGraph.nodeDegrees.set(variable, 0);
    }

    // Build interference edges
    const variables = Array.from(this.liveRanges.keys());
    
    for (let i = 0; i < variables.length; i++) {
      for (let j = i + 1; j < variables.length; j++) {
        const var1 = variables[i];
        const var2 = variables[j];
        
        if (this.variablesInterfere(var1, var2)) {
          this.interferenceGraph.edges.push({ from: var1, to: var2 });
          this.interferenceGraph.edges.push({ from: var2, to: var1 });
          
          // Update degrees
          const deg1 = this.interferenceGraph.nodeDegrees.get(var1) || 0;
          const deg2 = this.interferenceGraph.nodeDegrees.get(var2) || 0;
          this.interferenceGraph.nodeDegrees.set(var1, deg1 + 1);
          this.interferenceGraph.nodeDegrees.set(var2, deg2 + 1);
        }
      }
    }
  }

  private variablesInterfere(var1: string, var2: string): boolean {
    const range1 = this.liveRanges.get(var1);
    const range2 = this.liveRanges.get(var2);
    
    if (!range1 || !range2) return false;
    
    // Variables interfere if their live ranges overlap
    return !(range1.end < range2.start || range2.end < range1.start);
  }

  private applyGraphColoring(): void {
    let step = 0;
    const worklist = Array.from(this.interferenceGraph.nodes);
    const colored = new Set<string>();
    const spilled = new Set<string>();

    // Simplified graph coloring using greedy algorithm
    while (worklist.length > 0) {
      // Find node with minimum degree
      let minDegreeNode = worklist[0];
      let minDegree = this.interferenceGraph.nodeDegrees.get(minDegreeNode) || 0;
      
      for (const node of worklist) {
        const degree = this.interferenceGraph.nodeDegrees.get(node) || 0;
        if (degree < minDegree) {
          minDegree = degree;
          minDegreeNode = node;
        }
      }

      // Try to color the node
      const availableColors = this.getAvailableColors(minDegreeNode, colored);
      
      if (availableColors.length > 0) {
        const color = availableColors[0];
        this.interferenceGraph.nodeColors.set(minDegreeNode, color);
        colored.add(minDegreeNode);
        
        this.allocationSteps.push({
          step: step++,
          description: `Colored variable ${minDegreeNode} with color ${color}`,
          action: 'color',
          node: minDegreeNode,
          color: color,
          register: this.availableRegisters[color],
          graph: this.cloneGraph()
        });
      } else {
        // Spill the variable
        spilled.add(minDegreeNode);
        
        this.allocationSteps.push({
          step: step++,
          description: `Spilled variable ${minDegreeNode} (no available colors)`,
          action: 'spill',
          node: minDegreeNode,
          graph: this.cloneGraph()
        });
      }

      // Remove from worklist
      const index = worklist.indexOf(minDegreeNode);
      worklist.splice(index, 1);
    }
  }

  private getAvailableColors(node: string, colored: Set<string>): number[] {
    const usedColors = new Set<number>();
    
    // Find colors used by interfering neighbors
    for (const edge of this.interferenceGraph.edges) {
      if (edge.from === node && colored.has(edge.to)) {
        const color = this.interferenceGraph.nodeColors.get(edge.to);
        if (color !== undefined) {
          usedColors.add(color);
        }
      }
    }
    
    // Return available colors
    const available: number[] = [];
    for (let i = 0; i < this.maxRegisters; i++) {
      if (!usedColors.has(i)) {
        available.push(i);
      }
    }
    
    return available;
  }

  private generateAllocation(): RegisterAllocation {
    const variableToRegister = new Map<string, string>();
    const spilledVariables = new Set<string>();
    
    for (const [variable, color] of this.interferenceGraph.nodeColors) {
      if (color < this.availableRegisters.length) {
        variableToRegister.set(variable, this.availableRegisters[color]);
      } else {
        spilledVariables.add(variable);
      }
    }
    
    // Add spilled variables
    for (const [variable] of this.liveRanges) {
      if (!this.interferenceGraph.nodeColors.has(variable)) {
        spilledVariables.add(variable);
      }
    }
    
    return {
      variableToRegister,
      spilledVariables,
      interferenceGraph: this.interferenceGraph,
      allocationSteps: this.allocationSteps
    };
  }

  private getVariablesInInstruction(instruction: ThreeAddressInstruction): string[] {
    const variables: string[] = [];
    
    switch (instruction.type) {
      case "ASSIGN":
        if (instruction.target) variables.push(instruction.target);
        if (instruction.source && this.isVariable(instruction.source)) {
          variables.push(instruction.source);
        }
        break;
      case "ADD":
      case "SUB":
      case "MUL":
      case "DIV":
      case "MOD":
      case "EQ":
      case "NE":
      case "LT":
      case "GT":
      case "LE":
      case "GE":
      case "AND":
      case "OR":
        if (instruction.target) variables.push(instruction.target);
        if (instruction.left && this.isVariable(instruction.left)) {
          variables.push(instruction.left);
        }
        if (instruction.right && this.isVariable(instruction.right)) {
          variables.push(instruction.right);
        }
        break;
      case "NOT":
      case "NEG":
        if (instruction.target) variables.push(instruction.target);
        if (instruction.source && this.isVariable(instruction.source)) {
          variables.push(instruction.source);
        }
        break;
      case "CALL":
        if (instruction.target) variables.push(instruction.target);
        if (instruction.args) {
          for (const arg of instruction.args) {
            if (this.isVariable(arg)) {
              variables.push(arg);
            }
          }
        }
        break;
    }
    
    return variables;
  }

  private isVariable(value: string): boolean {
    // Check if it's a variable (not a literal or temporary)
    return !value.match(/^\d+$/) && !value.match(/^".*"$/) && !value.match(/^t\d+$/);
  }

  private cloneGraph(): InterferenceGraph {
    return {
      nodes: new Set(this.interferenceGraph.nodes),
      edges: [...this.interferenceGraph.edges],
      nodeColors: new Map(this.interferenceGraph.nodeColors),
      nodeDegrees: new Map(this.interferenceGraph.nodeDegrees)
    };
  }
}
