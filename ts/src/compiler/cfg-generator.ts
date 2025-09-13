import { ThreeAddressInstruction } from "./intermediate-code";

export interface BasicBlock {
  id: string;
  instructions: ThreeAddressInstruction[];
  startLine: number;
  endLine: number;
  predecessors: string[];
  successors: string[];
  isEntry: boolean;
  isExit: boolean;
}

export interface ControlFlowGraph {
  blocks: Map<string, BasicBlock>;
  entryBlock: string;
  exitBlocks: string[];
  edges: Array<{ from: string; to: string; label?: string }>;
}

export class CFGGenerator {
  private instructions: ThreeAddressInstruction[] = [];
  private blocks: Map<string, BasicBlock> = new Map();
  private leaders: Set<number> = new Set();
  private edges: Array<{ from: string; to: string; label?: string }> = [];

  generate(instructions: ThreeAddressInstruction[]): ControlFlowGraph {
    console.log("CFGGenerator: Starting CFG generation with", instructions.length, "instructions");
    console.log("CFGGenerator: Instructions:", instructions);
    
    this.instructions = instructions;
    this.blocks.clear();
    this.leaders.clear();
    this.edges = [];

    // Step 1: Identify leaders (start of basic blocks)
    this.identifyLeaders();
    console.log("CFGGenerator: Identified leaders:", Array.from(this.leaders));

    // Step 2: Create basic blocks
    this.createBasicBlocks();
    console.log("CFGGenerator: Created", this.blocks.size, "basic blocks");

    // Step 3: Build control flow edges
    this.buildControlFlowEdges();
    console.log("CFGGenerator: Created", this.edges.length, "edges");

    // Step 4: Identify entry and exit blocks
    this.identifyEntryExitBlocks();

    const result = {
      blocks: this.blocks,
      entryBlock: this.findEntryBlock(),
      exitBlocks: this.findExitBlocks(),
      edges: this.edges
    };
    
    console.log("CFGGenerator: Final CFG:", result);
    return result;
  }

  private identifyLeaders(): void {
    // First instruction is always a leader
    this.leaders.add(0);

    for (let i = 0; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];

      // Instructions that can be targets of jumps are leaders
      if (instruction.type === "LABEL") {
        this.leaders.add(i);
      }

      // Instructions following jumps are leaders
      if (this.isJumpInstruction(instruction)) {
        if (i + 1 < this.instructions.length) {
          this.leaders.add(i + 1);
        }
      }

      // Instructions following conditional jumps are leaders
      if (instruction.type === "JUMP_IF_FALSE" || instruction.type === "JUMP_IF_TRUE") {
        if (i + 1 < this.instructions.length) {
          this.leaders.add(i + 1);
        }
      }
    }

    // Ensure we have at least one leader for simple programs
    if (this.leaders.size === 0 && this.instructions.length > 0) {
      this.leaders.add(0);
    }
  }

  private createBasicBlocks(): void {
    const leaderArray = Array.from(this.leaders).sort((a, b) => a - b);

    for (let i = 0; i < leaderArray.length; i++) {
      const startLine = leaderArray[i];
      const endLine = i + 1 < leaderArray.length ? leaderArray[i + 1] - 1 : this.instructions.length - 1;
      
      const blockId = `B${startLine}`;
      const blockInstructions = this.instructions.slice(startLine, endLine + 1);
      
      this.blocks.set(blockId, {
        id: blockId,
        instructions: blockInstructions,
        startLine,
        endLine,
        predecessors: [],
        successors: [],
        isEntry: false,
        isExit: false
      });
    }
  }

  private buildControlFlowEdges(): void {
    for (const [blockId, block] of this.blocks) {
      const lastInstruction = block.instructions[block.instructions.length - 1];
      
      if (this.isJumpInstruction(lastInstruction)) {
        // Handle jump instructions
      if (lastInstruction.type === "JUMP") {
          const targetLabel = lastInstruction.target;
          const targetBlock = this.findBlockByLabel(targetLabel);
          if (targetBlock) {
            this.addEdge(blockId, targetBlock.id);
        }
      } else if (lastInstruction.type === "JUMP_IF_FALSE" || lastInstruction.type === "JUMP_IF_TRUE") {
          const targetLabel = lastInstruction.target;
          const targetBlock = this.findBlockByLabel(targetLabel);
          if (targetBlock) {
            this.addEdge(blockId, targetBlock.id, lastInstruction.type);
          }
          
          // Add fall-through edge to next block
          const nextBlock = this.findNextBlock(blockId);
          if (nextBlock) {
            this.addEdge(blockId, nextBlock.id, "fall-through");
          }
        }
      } else {
        // Fall-through to next block
        const nextBlock = this.findNextBlock(blockId);
        if (nextBlock) {
          this.addEdge(blockId, nextBlock.id);
        }
      }
    }
  }

  private addEdge(from: string, to: string, label?: string): void {
    this.edges.push({ from, to, label });
    
    const fromBlock = this.blocks.get(from);
    const toBlock = this.blocks.get(to);
    
    if (fromBlock && toBlock) {
      if (!fromBlock.successors.includes(to)) {
        fromBlock.successors.push(to);
      }
      if (!toBlock.predecessors.includes(from)) {
        toBlock.predecessors.push(from);
      }
    }
  }

  private findBlockByLabel(label: string): BasicBlock | null {
    for (const block of this.blocks.values()) {
      for (const instruction of block.instructions) {
        if (instruction.type === "LABEL" && instruction.name === label) {
          return block;
        }
      }
    }
    return null;
  }

  private findNextBlock(currentBlockId: string): BasicBlock | null {
    const currentBlock = this.blocks.get(currentBlockId);
    if (!currentBlock) return null;

    const nextStartLine = currentBlock.endLine + 1;
    for (const block of this.blocks.values()) {
      if (block.startLine === nextStartLine) {
        return block;
      }
    }
    return null;
  }

  private identifyEntryExitBlocks(): void {
    // Find entry block (first block)
    const entryBlock = Array.from(this.blocks.values())
      .sort((a, b) => a.startLine - b.startLine)[0];
    
    if (entryBlock) {
      entryBlock.isEntry = true;
    }

    // Find exit blocks (blocks with no successors)
    for (const block of this.blocks.values()) {
      if (block.successors.length === 0) {
        block.isExit = true;
      }
    }
  }

  private findEntryBlock(): string {
    const entryBlock = Array.from(this.blocks.values())
      .sort((a, b) => a.startLine - b.startLine)[0];
    return entryBlock ? entryBlock.id : "";
  }

  private findExitBlocks(): string[] {
    return Array.from(this.blocks.values())
      .filter(block => block.isExit)
      .map(block => block.id);
  }

  private isJumpInstruction(instruction: ThreeAddressInstruction): boolean {
    return instruction.type === "JUMP" || 
           instruction.type === "JUMP_IF_FALSE" || 
           instruction.type === "JUMP_IF_TRUE";
  }
}