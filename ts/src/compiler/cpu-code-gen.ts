import { ThreeAddressInstruction } from "./intermediate-code";
import { SymbolTable } from "./symbol-table";

export type CpuInstruction = 
  | { type: "LOAD"; reg: string; value: string }
  | { type: "STORE"; reg: string; address: string }
  | { type: "ADD"; reg: string; left: string; right: string }
  | { type: "SUB"; reg: string; left: string; right: string }
  | { type: "MUL"; reg: string; left: string; right: string }
  | { type: "DIV"; reg: string; left: string; right: string }
  | { type: "MOD"; reg: string; left: string; right: string }
  | { type: "CMP"; left: string; right: string }
  | { type: "JE"; target: string }
  | { type: "JNE"; target: string }
  | { type: "JL"; target: string }
  | { type: "JG"; target: string }
  | { type: "JLE"; target: string }
  | { type: "JGE"; target: string }
  | { type: "JMP"; target: string }
  | { type: "CALL"; target: string }
  | { type: "RET" }
  | { type: "PUSH"; value: string }
  | { type: "POP"; reg: string }
  | { type: "PRINT"; reg: string }
  | { type: "LABEL"; name: string }
  | { type: "FUNCTION_START"; name: string }
  | { type: "FUNCTION_END" };

export class CpuCodeGenerator {
  private instructions: CpuInstruction[] = [];
  private registerCounter = 0;
  private symbolTable: SymbolTable;
  private registerMap: Map<string, string> = new Map();

  constructor(symbolTable: SymbolTable) {
    this.symbolTable = symbolTable;
  }

  generate(threeAddressCode: ThreeAddressInstruction[]): CpuInstruction[] {
    this.instructions = [];
    this.registerCounter = 0;
    this.registerMap.clear();
    
    for (const instruction of threeAddressCode) {
      this.generateCpuInstruction(instruction);
    }
    
    return this.instructions;
  }

  private newRegister(): string {
    return `r${this.registerCounter++}`;
  }

  private getRegister(operand: string): string {
    if (this.registerMap.has(operand)) {
      return this.registerMap.get(operand)!;
    }
    
    // Check if it's a literal value
    if (this.isLiteral(operand)) {
      const reg = this.newRegister();
      this.instructions.push({ type: "LOAD", reg, value: operand });
      this.registerMap.set(operand, reg);
      return reg;
    }
    
    // Check if it's a variable
    if (this.symbolTable.lookup(operand)) {
      const reg = this.newRegister();
      const address = this.symbolTable.getVariableAddress(operand).toString();
      this.instructions.push({ type: "LOAD", reg, value: address });
      this.registerMap.set(operand, reg);
      return reg;
    }
    
    // Assume it's already a register
    return operand;
  }

  private isLiteral(value: string): boolean {
    return /^\d+$/.test(value) || /^"[^"]*"$/.test(value) || /^(true|false)$/.test(value);
  }

  private generateCpuInstruction(instruction: ThreeAddressInstruction): void {
    switch (instruction.type) {
      case "ASSIGN":
        this.generateAssign(instruction);
        break;
      case "ADD":
        this.generateAdd(instruction);
        break;
      case "SUB":
        this.generateSub(instruction);
        break;
      case "MUL":
        this.generateMul(instruction);
        break;
      case "DIV":
        this.generateDiv(instruction);
        break;
      case "MOD":
        this.generateMod(instruction);
        break;
      case "EQ":
        this.generateEq(instruction);
        break;
      case "NE":
        this.generateNe(instruction);
        break;
      case "LT":
        this.generateLt(instruction);
        break;
      case "GT":
        this.generateGt(instruction);
        break;
      case "LE":
        this.generateLe(instruction);
        break;
      case "GE":
        this.generateGe(instruction);
        break;
      case "AND":
        this.generateAnd(instruction);
        break;
      case "OR":
        this.generateOr(instruction);
        break;
      case "NOT":
        this.generateNot(instruction);
        break;
      case "NEG":
        this.generateNeg(instruction);
        break;
      case "LABEL":
        this.instructions.push({ type: "LABEL", name: instruction.name });
        break;
      case "JUMP":
        this.instructions.push({ type: "JMP", target: instruction.target });
        break;
      case "JUMP_IF_FALSE":
        this.generateJumpIfFalse(instruction);
        break;
      case "JUMP_IF_TRUE":
        this.generateJumpIfTrue(instruction);
        break;
      case "CALL":
        this.generateCall(instruction);
        break;
      case "RETURN":
        this.generateReturn(instruction);
        break;
      case "PRINT":
        this.generatePrint(instruction);
        break;
      case "FUNCTION_START":
        this.instructions.push({ type: "FUNCTION_START", name: instruction.name });
        break;
      case "FUNCTION_END":
        this.instructions.push({ type: "FUNCTION_END" });
        break;
    }
  }

  private generateAssign(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "ASSIGN") return;
    
    const targetReg = this.getRegister(instruction.target);
    const sourceReg = this.getRegister(instruction.source);
    
    if (targetReg !== sourceReg) {
      this.instructions.push({ type: "LOAD", reg: targetReg, value: sourceReg });
    }
  }

  private generateAdd(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "ADD") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "ADD", reg: targetReg, left: leftReg, right: rightReg });
  }

  private generateSub(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "SUB") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "SUB", reg: targetReg, left: leftReg, right: rightReg });
  }

  private generateMul(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "MUL") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "MUL", reg: targetReg, left: leftReg, right: rightReg });
  }

  private generateDiv(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "DIV") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "DIV", reg: targetReg, left: leftReg, right: rightReg });
  }

  private generateMod(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "MOD") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "MOD", reg: targetReg, left: leftReg, right: rightReg });
  }

  private generateEq(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "EQ") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "CMP", left: leftReg, right: rightReg });
    this.instructions.push({ type: "JE", target: targetReg });
  }

  private generateNe(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "NE") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "CMP", left: leftReg, right: rightReg });
    this.instructions.push({ type: "JNE", target: targetReg });
  }

  private generateLt(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "LT") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "CMP", left: leftReg, right: rightReg });
    this.instructions.push({ type: "JL", target: targetReg });
  }

  private generateGt(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "GT") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "CMP", left: leftReg, right: rightReg });
    this.instructions.push({ type: "JG", target: targetReg });
  }

  private generateLe(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "LE") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "CMP", left: leftReg, right: rightReg });
    this.instructions.push({ type: "JLE", target: targetReg });
  }

  private generateGe(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "GE") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    this.instructions.push({ type: "CMP", left: leftReg, right: rightReg });
    this.instructions.push({ type: "JGE", target: targetReg });
  }

  private generateAnd(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "AND") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    // Logical AND: if left is false, result is false; otherwise result is right
    const falseLabel = `L${this.instructions.length + 2}`;
    const endLabel = `L${this.instructions.length + 4}`;
    
    this.instructions.push({ type: "CMP", left: leftReg, right: "0" });
    this.instructions.push({ type: "JE", target: falseLabel });
    this.instructions.push({ type: "LOAD", reg: targetReg, value: rightReg });
    this.instructions.push({ type: "JMP", target: endLabel });
    this.instructions.push({ type: "LABEL", name: falseLabel });
    this.instructions.push({ type: "LOAD", reg: targetReg, value: "0" });
    this.instructions.push({ type: "LABEL", name: endLabel });
  }

  private generateOr(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "OR") return;
    
    const targetReg = this.getRegister(instruction.target);
    const leftReg = this.getRegister(instruction.left);
    const rightReg = this.getRegister(instruction.right);
    
    // Logical OR: if left is true, result is true; otherwise result is right
    const trueLabel = `L${this.instructions.length + 2}`;
    const endLabel = `L${this.instructions.length + 4}`;
    
    this.instructions.push({ type: "CMP", left: leftReg, right: "0" });
    this.instructions.push({ type: "JNE", target: trueLabel });
    this.instructions.push({ type: "LOAD", reg: targetReg, value: rightReg });
    this.instructions.push({ type: "JMP", target: endLabel });
    this.instructions.push({ type: "LABEL", name: trueLabel });
    this.instructions.push({ type: "LOAD", reg: targetReg, value: "1" });
    this.instructions.push({ type: "LABEL", name: endLabel });
  }

  private generateNot(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "NOT") return;
    
    const targetReg = this.getRegister(instruction.target);
    const sourceReg = this.getRegister(instruction.source);
    
    // Logical NOT: if source is 0, result is 1; otherwise result is 0
    const zeroLabel = `L${this.instructions.length + 2}`;
    const endLabel = `L${this.instructions.length + 4}`;
    
    this.instructions.push({ type: "CMP", left: sourceReg, right: "0" });
    this.instructions.push({ type: "JE", target: zeroLabel });
    this.instructions.push({ type: "LOAD", reg: targetReg, value: "0" });
    this.instructions.push({ type: "JMP", target: endLabel });
    this.instructions.push({ type: "LABEL", name: zeroLabel });
    this.instructions.push({ type: "LOAD", reg: targetReg, value: "1" });
    this.instructions.push({ type: "LABEL", name: endLabel });
  }

  private generateNeg(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "NEG") return;
    
    const targetReg = this.getRegister(instruction.target);
    const sourceReg = this.getRegister(instruction.source);
    
    this.instructions.push({ type: "SUB", reg: targetReg, left: "0", right: sourceReg });
  }

  private generateJumpIfFalse(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "JUMP_IF_FALSE") return;
    
    const conditionReg = this.getRegister(instruction.condition);
    
    this.instructions.push({ type: "CMP", left: conditionReg, right: "0" });
    this.instructions.push({ type: "JE", target: instruction.target });
  }

  private generateJumpIfTrue(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "JUMP_IF_TRUE") return;
    
    const conditionReg = this.getRegister(instruction.condition);
    
    this.instructions.push({ type: "CMP", left: conditionReg, right: "0" });
    this.instructions.push({ type: "JNE", target: instruction.target });
  }

  private generateCall(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "CALL") return;
    
    const targetReg = this.getRegister(instruction.target);
    
    // Push arguments
    for (const arg of instruction.args) {
      const argReg = this.getRegister(arg);
      this.instructions.push({ type: "PUSH", value: argReg });
    }
    
    this.instructions.push({ type: "CALL", target: instruction.function });
    this.instructions.push({ type: "POP", reg: targetReg });
  }

  private generateReturn(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "RETURN") return;
    
    if (instruction.value) {
      const valueReg = this.getRegister(instruction.value);
      this.instructions.push({ type: "PUSH", value: valueReg });
    }
    this.instructions.push({ type: "RET" });
  }

  private generatePrint(instruction: ThreeAddressInstruction): void {
    if (instruction.type !== "PRINT") return;
    
    const valueReg = this.getRegister(instruction.value);
    this.instructions.push({ type: "PRINT", reg: valueReg });
  }
}