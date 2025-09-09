import { CstNode } from "chevrotain";
import { SymbolTable, DataType } from "./symbol-table";

export type ThreeAddressInstruction = 
  | { type: "ASSIGN"; target: string; source: string }
  | { type: "ADD"; target: string; left: string; right: string }
  | { type: "SUB"; target: string; left: string; right: string }
  | { type: "MUL"; target: string; left: string; right: string }
  | { type: "DIV"; target: string; left: string; right: string }
  | { type: "MOD"; target: string; left: string; right: string }
  | { type: "EQ"; target: string; left: string; right: string }
  | { type: "NE"; target: string; left: string; right: string }
  | { type: "LT"; target: string; left: string; right: string }
  | { type: "GT"; target: string; left: string; right: string }
  | { type: "LE"; target: string; left: string; right: string }
  | { type: "GE"; target: string; left: string; right: string }
  | { type: "AND"; target: string; left: string; right: string }
  | { type: "OR"; target: string; left: string; right: string }
  | { type: "NOT"; target: string; source: string }
  | { type: "NEG"; target: string; source: string }
  | { type: "LABEL"; name: string }
  | { type: "JUMP"; target: string }
  | { type: "JUMP_IF_FALSE"; condition: string; target: string }
  | { type: "JUMP_IF_TRUE"; condition: string; target: string }
  | { type: "CALL"; target: string; function: string; args: string[] }
  | { type: "RETURN"; value?: string }
  | { type: "PRINT"; value: string }
  | { type: "FUNCTION_START"; name: string; params: string[] }
  | { type: "FUNCTION_END" };

export class IntermediateCodeGenerator {
  private instructions: ThreeAddressInstruction[] = [];
  private tempCounter = 0;
  private labelCounter = 0;
  private symbolTable: SymbolTable;

  constructor(symbolTable: SymbolTable) {
    this.symbolTable = symbolTable;
  }

  private newTemp(): string {
    return `t${this.tempCounter++}`;
  }

  private newLabel(): string {
    return `L${this.labelCounter++}`;
  }

  private inferTypeFromExpression(exprCtx: any): DataType {
    if (exprCtx.children.NumberLiteral) {
      return "number";
    } else if (exprCtx.children.StringLiteral) {
      return "string";
    } else if (exprCtx.children.BooleanLiteral) {
      return "boolean";
    } else if (exprCtx.children.Identifier) {
      // Look up existing variable type
      const varName = exprCtx.children.Identifier[0].image;
      const symbol = this.symbolTable.lookup(varName);
      return symbol ? symbol.type : "number"; // Default to number if not found
    } else if (exprCtx.children.expression) {
      // Parenthesized expression
      return this.inferTypeFromExpression(exprCtx.children.expression[0]);
    } else if (exprCtx.children.functionCall) {
      // Function call - assume returns number for now
      return "number";
    } else {
      // For arithmetic/logical operations, assume number
      return "number";
    }
  }

  generate(cst: CstNode): ThreeAddressInstruction[] {
    this.instructions = [];
    this.tempCounter = 0;
    this.labelCounter = 0;
    
    this.visitProgram(cst);
    return this.instructions;
  }

  private emit(instruction: ThreeAddressInstruction): void {
    this.instructions.push(instruction);
  }

  private visitProgram(ctx: any): void {
    if (ctx.children && ctx.children.statement) {
      for (const stmt of ctx.children.statement) {
        this.visitStatement(stmt);
      }
    }
  }

  private visitStatement(ctx: any): void {
    if (ctx.children) {
      if (ctx.children.variableDeclaration) {
        this.visitVariableDeclaration(ctx.children.variableDeclaration[0]);
      } else if (ctx.children.assignment) {
        this.visitAssignment(ctx.children.assignment[0]);
      } else if (ctx.children.ifStatement) {
        this.visitIfStatement(ctx.children.ifStatement[0]);
      } else if (ctx.children.whileStatement) {
        this.visitWhileStatement(ctx.children.whileStatement[0]);
      } else if (ctx.children.functionDeclaration) {
        this.visitFunctionDeclaration(ctx.children.functionDeclaration[0]);
      } else if (ctx.children.returnStatement) {
        this.visitReturnStatement(ctx.children.returnStatement[0]);
      } else if (ctx.children.printStatement) {
        this.visitPrintStatement(ctx.children.printStatement[0]);
      } else if (ctx.children.expressionStatement) {
        this.visitExpression(ctx.children.expressionStatement[0]);
      }
    }
  }

  private visitVariableDeclaration(ctx: any): void {
    if (ctx.children) {
      const varName = ctx.children.Identifier[0].image;
      const exprResult = this.visitExpression(ctx.children.expression[0]);
      
      // Determine variable type from expression
      const varType = this.inferTypeFromExpression(ctx.children.expression[0]);
      
      // Declare variable in symbol table
      this.symbolTable.declareVariable(varName, varType);
      
      this.emit({ type: "ASSIGN", target: varName, source: exprResult });
    }
  }

  private visitAssignment(ctx: any): void {
    const varName = ctx.Identifier[0].image;
    const exprResult = this.visitExpression(ctx.expression[0]);
    
    this.emit({ type: "ASSIGN", target: varName, source: exprResult });
  }

  private visitIfStatement(ctx: any): void {
    const conditionResult = this.visitExpression(ctx.expression[0]);
    const elseLabel = this.newLabel();
    const endLabel = this.newLabel();
    
    this.emit({ type: "JUMP_IF_FALSE", condition: conditionResult, target: elseLabel });
    
    // Then block
    if (ctx.statement) {
      for (const stmt of ctx.statement) {
        this.visitStatement(stmt);
      }
    }
    
    this.emit({ type: "JUMP", target: endLabel });
    this.emit({ type: "LABEL", name: elseLabel });
    
    // Else block (if exists)
    if (ctx.else) {
      // Find else statements in the context
      const elseStatements = ctx.else[0]?.statement;
      if (elseStatements) {
        for (const stmt of elseStatements) {
          this.visitStatement(stmt);
        }
      }
    }
    
    this.emit({ type: "LABEL", name: endLabel });
  }

  private visitWhileStatement(ctx: any): void {
    const startLabel = this.newLabel();
    const endLabel = this.newLabel();
    
    this.emit({ type: "LABEL", name: startLabel });
    
    const conditionResult = this.visitExpression(ctx.expression[0]);
    this.emit({ type: "JUMP_IF_FALSE", condition: conditionResult, target: endLabel });
    
    // Loop body
    if (ctx.statement) {
      for (const stmt of ctx.statement) {
        this.visitStatement(stmt);
      }
    }
    
    this.emit({ type: "JUMP", target: startLabel });
    this.emit({ type: "LABEL", name: endLabel });
  }

  private visitFunctionDeclaration(ctx: any): void {
    const funcName = ctx.Identifier[0].image;
    const params: string[] = [];
    const paramTypes: DataType[] = [];
    
    if (ctx.parameterList) {
      for (const param of ctx.parameterList[0].Identifier) {
        params.push(param.image);
        paramTypes.push("number"); // Default parameter type
      }
    }
    
    // Declare function in symbol table
    this.symbolTable.declareFunction(funcName, "number", paramTypes); // Default return type
    
    this.emit({ type: "FUNCTION_START", name: funcName, params });
    
    // Function body
    if (ctx.statement) {
      for (const stmt of ctx.statement) {
        this.visitStatement(stmt);
      }
    }
    
    this.emit({ type: "FUNCTION_END" });
  }

  private visitReturnStatement(ctx: any): void {
    if (ctx.expression) {
      const exprResult = this.visitExpression(ctx.expression[0]);
      this.emit({ type: "RETURN", value: exprResult });
    } else {
      this.emit({ type: "RETURN" });
    }
  }

  private visitPrintStatement(ctx: any): void {
    const exprResult = this.visitExpression(ctx.expression[0]);
    this.emit({ type: "PRINT", value: exprResult });
  }

  private visitExpression(ctx: any): string {
    console.log("visitExpression called with:", ctx);
    if (ctx.children && ctx.children.logicalOr) {
      return this.visitLogicalOr(ctx.children.logicalOr[0]);
    }
    return "0"; // fallback
  }

  private visitLogicalOr(ctx: any): string {
    let result = this.visitLogicalAnd(ctx.logicalAnd[0]);
    
    for (let i = 1; i < ctx.logicalAnd.length; i++) {
      const right = this.visitLogicalAnd(ctx.logicalAnd[i]);
      const temp = this.newTemp();
      this.emit({ type: "OR", target: temp, left: result, right });
      result = temp;
    }
    
    return result;
  }

  private visitLogicalAnd(ctx: any): string {
    let result = this.visitEquality(ctx.equality[0]);
    
    for (let i = 1; i < ctx.equality.length; i++) {
      const right = this.visitEquality(ctx.equality[i]);
      const temp = this.newTemp();
      this.emit({ type: "AND", target: temp, left: result, right });
      result = temp;
    }
    
    return result;
  }

  private visitEquality(ctx: any): string {
    let result = this.visitComparison(ctx.comparison[0]);
    
    for (let i = 1; i < ctx.comparison.length; i++) {
      const right = this.visitComparison(ctx.comparison[i]);
      const temp = this.newTemp();
      
      // Determine operator type
      const opIndex = i - 1;
      const opType = ctx.Equal ? "EQ" : "NE";
      
      this.emit({ type: opType, target: temp, left: result, right });
      result = temp;
    }
    
    return result;
  }

  private visitComparison(ctx: any): string {
    let result = this.visitTerm(ctx.term[0]);
    
    for (let i = 1; i < ctx.term.length; i++) {
      const right = this.visitTerm(ctx.term[i]);
      const temp = this.newTemp();
      
      // Determine operator type based on context
      const opType = "LT"; // Simplified for now
      this.emit({ type: opType, target: temp, left: result, right });
      result = temp;
    }
    
    return result;
  }

  private visitTerm(ctx: any): string {
    let result = this.visitFactor(ctx.factor[0]);
    
    for (let i = 1; i < ctx.factor.length; i++) {
      const right = this.visitFactor(ctx.factor[i]);
      const temp = this.newTemp();
      
      // Determine operator type
      const opType = ctx.Plus ? "ADD" : "SUB";
      this.emit({ type: opType, target: temp, left: result, right });
      result = temp;
    }
    
    return result;
  }

  private visitFactor(ctx: any): string {
    let result = this.visitUnary(ctx.unary[0]);
    
    for (let i = 1; i < ctx.unary.length; i++) {
      const right = this.visitUnary(ctx.unary[i]);
      const temp = this.newTemp();
      
      // Determine operator type
      const opType = ctx.Mult ? "MUL" : ctx.Div ? "DIV" : "MOD";
      this.emit({ type: opType, target: temp, left: result, right });
      result = temp;
    }
    
    return result;
  }

  private visitUnary(ctx: any): string {
    if (ctx.Not) {
      const operand = this.visitUnary(ctx.unary[0]);
      const temp = this.newTemp();
      this.emit({ type: "NOT", target: temp, source: operand });
      return temp;
    } else if (ctx.Minus) {
      const operand = this.visitUnary(ctx.unary[0]);
      const temp = this.newTemp();
      this.emit({ type: "NEG", target: temp, source: operand });
      return temp;
    } else {
      return this.visitPrimary(ctx.primary[0]);
    }
  }

  private visitPrimary(ctx: any): string {
    if (ctx.NumberLiteral) {
      return ctx.NumberLiteral[0].image;
    } else if (ctx.StringLiteral) {
      return ctx.StringLiteral[0].image;
    } else if (ctx.BooleanLiteral) {
      return ctx.BooleanLiteral[0].image;
    } else if (ctx.functionCall) {
      return this.visitFunctionCall(ctx.functionCall[0]);
    } else if (ctx.Identifier) {
      return ctx.Identifier[0].image;
    } else if (ctx.expression) {
      return this.visitExpression(ctx.expression[0]);
    }
    
    throw new Error("Invalid primary expression");
  }

  private visitFunctionCall(ctx: any): string {
    const funcName = ctx.Identifier[0].image;
    const args: string[] = [];
    
    if (ctx.argumentList) {
      for (const arg of ctx.argumentList[0].expression) {
        args.push(this.visitExpression(arg));
      }
    }
    
    const result = this.newTemp();
    this.emit({ type: "CALL", target: result, function: funcName, args });
    return result;
  }
}

