import { CstNode } from "chevrotain";
import { parseProgram } from "./parser";
import { SymbolTable } from "./symbol-table";

export type Value = number | string | boolean;

export class CompilerInterpreter {
  private symbolTable: SymbolTable;
  private variables: Map<string, Value> = new Map();
  private output: string[] = [];

  constructor() {
    this.symbolTable = new SymbolTable();
  }

  interpret(input: string): string {
    this.output = [];
    this.symbolTable = new SymbolTable();
    this.variables.clear();
    
    try {
      const parseResult = parseProgram(input);
      if (parseResult.errors.length > 0) {
        return "Parse errors:\n" + parseResult.errors.map(e => e.message).join("\n");
      }
      
      this.visitProgram(parseResult.cst);
      return this.output.join("\n");
    } catch (error: any) {
      return `Runtime error: ${error.message}`;
    }
  }

  private visitProgram(cst: CstNode): void {
    const ctx = (cst as any).children;
    if (ctx.statement) {
      for (const stmt of ctx.statement) {
        this.visitStatement(stmt);
      }
    }
  }

  private visitStatement(cst: CstNode): void {
    const ctx = (cst as any).children;
    
    if (ctx.variableDeclaration) {
      this.visitVariableDeclaration(ctx.variableDeclaration[0]);
    } else if (ctx.assignment) {
      this.visitAssignment(ctx.assignment[0]);
    } else if (ctx.ifStatement) {
      this.visitIfStatement(ctx.ifStatement[0]);
    } else if (ctx.whileStatement) {
      this.visitWhileStatement(ctx.whileStatement[0]);
    } else if (ctx.printStatement) {
      this.visitPrintStatement(ctx.printStatement[0]);
    } else if (ctx.returnStatement) {
      this.visitReturnStatement(ctx.returnStatement[0]);
    } else if (ctx.expressionStatement) {
      this.visitExpression(ctx.expressionStatement[0].children.expression[0]);
    }
  }

  private visitVariableDeclaration(cst: CstNode): void {
    const ctx = (cst as any).children;
    const name = ctx.Identifier[0].image;
    const value = this.visitExpression(ctx.expression[0]);
    
    this.symbolTable.declareVariable(name, typeof value as "number" | "string" | "boolean");
    this.variables.set(name, value);
  }

  private visitAssignment(cst: CstNode): void {
    const ctx = (cst as any).children;
    const name = ctx.Identifier[0].image;
    const value = this.visitExpression(ctx.expression[0]);
    
    if (!this.variables.has(name)) {
      throw new Error(`Undefined variable: ${name}`);
    }
    this.variables.set(name, value);
  }

  private visitIfStatement(cst: CstNode): void {
    const ctx = (cst as any).children;
    const condition = this.visitExpression(ctx.expression[0]);
    
    if (condition) {
      if (ctx.statement) {
        for (const stmt of ctx.statement) {
          this.visitStatement(stmt);
        }
      }
    } else if (ctx.else && ctx.statement2) {
      for (const stmt of ctx.statement2) {
        this.visitStatement(stmt);
      }
    }
  }

  private visitWhileStatement(cst: CstNode): void {
    const ctx = (cst as any).children;
    
    while (this.visitExpression(ctx.expression[0])) {
      if (ctx.statement) {
        for (const stmt of ctx.statement) {
          this.visitStatement(stmt);
        }
      }
    }
  }

  private visitPrintStatement(cst: CstNode): void {
    const ctx = (cst as any).children;
    const value = this.visitExpression(ctx.expression[0]);
    this.output.push(String(value));
  }

  private visitReturnStatement(cst: CstNode): void {
    const ctx = (cst as any).children;
    if (ctx.expression) {
      const value = this.visitExpression(ctx.expression[0]);
      this.output.push(`Return: ${value}`);
    }
  }

  private visitExpression(cst: CstNode): Value {
    const ctx = (cst as any).children;
    return this.visitLogicalOr(ctx.logicalOr[0]);
  }

  private visitLogicalOr(cst: CstNode): Value {
    const ctx = (cst as any).children;
    let result = this.visitLogicalAnd(ctx.logicalAnd[0]);
    
    if (ctx.Or) {
      for (let i = 0; i < ctx.Or.length; i++) {
        const right = this.visitLogicalAnd(ctx.logicalAnd[i + 1]);
        result = (result as any) || (right as any);
      }
    }
    
    return result;
  }

  private visitLogicalAnd(cst: CstNode): Value {
    const ctx = (cst as any).children;
    let result = this.visitEquality(ctx.equality[0]);
    
    if (ctx.And) {
      for (let i = 0; i < ctx.And.length; i++) {
        const right = this.visitEquality(ctx.equality[i + 1]);
        result = (result as any) && (right as any);
      }
    }
    
    return result;
  }

  private visitEquality(cst: CstNode): Value {
    const ctx = (cst as any).children;
    let result = this.visitComparison(ctx.comparison[0]);
    
    if (ctx.Equal) {
      for (let i = 0; i < ctx.Equal.length; i++) {
        const right = this.visitComparison(ctx.comparison[i + 1]);
        result = result === right;
      }
    } else if (ctx.NotEqual) {
      for (let i = 0; i < ctx.NotEqual.length; i++) {
        const right = this.visitComparison(ctx.comparison[i + 1]);
        result = result !== right;
      }
    }
    
    return result;
  }

  private visitComparison(cst: CstNode): Value {
    const ctx = (cst as any).children;
    let result = this.visitTerm(ctx.term[0]);
    
    if (ctx.Less) {
      for (let i = 0; i < ctx.Less.length; i++) {
        const right = this.visitTerm(ctx.term[i + 1]);
        result = (result as any) < (right as any);
      }
    } else if (ctx.Greater) {
      for (let i = 0; i < ctx.Greater.length; i++) {
        const right = this.visitTerm(ctx.term[i + 1]);
        result = (result as any) > (right as any);
      }
    } else if (ctx.LessEqual) {
      for (let i = 0; i < ctx.LessEqual.length; i++) {
        const right = this.visitTerm(ctx.term[i + 1]);
        result = (result as any) <= (right as any);
      }
    } else if (ctx.GreaterEqual) {
      for (let i = 0; i < ctx.GreaterEqual.length; i++) {
        const right = this.visitTerm(ctx.term[i + 1]);
        result = (result as any) >= (right as any);
      }
    }
    
    return result;
  }

  private visitTerm(cst: CstNode): Value {
    const ctx = (cst as any).children;
    let result = this.visitFactor(ctx.factor[0]);
    
    if (ctx.Plus) {
      for (let i = 0; i < ctx.Plus.length; i++) {
        const right = this.visitFactor(ctx.factor[i + 1]);
        result = (result as any) + (right as any);
      }
    } else if (ctx.Minus) {
      for (let i = 0; i < ctx.Minus.length; i++) {
        const right = this.visitFactor(ctx.factor[i + 1]);
        result = (result as any) - (right as any);
      }
    }
    
    return result;
  }

  private visitFactor(cst: CstNode): Value {
    const ctx = (cst as any).children;
    let result = this.visitUnary(ctx.unary[0]);
    
    if (ctx.Mult) {
      for (let i = 0; i < ctx.Mult.length; i++) {
        const right = this.visitUnary(ctx.unary[i + 1]);
        result = (result as any) * (right as any);
      }
    } else if (ctx.Div) {
      for (let i = 0; i < ctx.Div.length; i++) {
        const right = this.visitUnary(ctx.unary[i + 1]);
        result = (result as any) / (right as any);
      }
    } else if (ctx.Mod) {
      for (let i = 0; i < ctx.Mod.length; i++) {
        const right = this.visitUnary(ctx.unary[i + 1]);
        result = (result as any) % (right as any);
      }
    }
    
    return result;
  }

  private visitUnary(cst: CstNode): Value {
    const ctx = (cst as any).children;
    
    if (ctx.Not) {
      const value = this.visitUnary(ctx.unary[0]);
      return !(value as any);
    } else if (ctx.Minus) {
      const value = this.visitUnary(ctx.unary[0]);
      return -(value as any);
    } else {
      return this.visitPrimary(ctx.primary[0]);
    }
  }

  private visitPrimary(cst: CstNode): Value {
    const ctx = (cst as any).children;
    
    if (ctx.NumberLiteral) {
      return parseInt(ctx.NumberLiteral[0].image, 10);
    } else if (ctx.StringLiteral) {
      const str = ctx.StringLiteral[0].image;
      return str.slice(1, -1); // Remove quotes
    } else if (ctx.BooleanLiteral) {
      return ctx.BooleanLiteral[0].image === "true";
    } else if (ctx.Identifier) {
      const name = ctx.Identifier[0].image;
      if (!this.variables.has(name)) {
        throw new Error(`Undefined variable: ${name}`);
      }
      return this.variables.get(name)!;
    } else if (ctx.expression) {
      return this.visitExpression(ctx.expression[0]);
    } else if (ctx.functionCall) {
      return this.visitFunctionCall(ctx.functionCall[0]);
    }
    
    throw new Error("Invalid primary expression");
  }

  private visitFunctionCall(cst: CstNode): Value {
    const ctx = (cst as any).children;
    const name = ctx.Identifier[0].image;
    
    // Simple function simulation
    if (name === "add") {
      const args = this.visitArgumentList(ctx.argumentList[0]);
      return (args[0] as any) + (args[1] as any);
    }
    
    return `[function ${name}]`;
  }

  private visitArgumentList(cst: CstNode): Value[] {
    const ctx = (cst as any).children;
    const args: Value[] = [];
    
    if (ctx.expression) {
      for (const expr of ctx.expression) {
        args.push(this.visitExpression(expr));
      }
    }
    
    return args;
  }
}

export function interpretCompilerCode(input: string): string {
  const interpreter = new CompilerInterpreter();
  return interpreter.interpret(input);
}
