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
    console.log("visitVariableDeclaration called with:", ctx);
    if (ctx.children) {
      const varName = ctx.children.Identifier[0].image;
      console.log("Variable name:", varName);
      console.log("Expression context:", ctx.children.expression[0]);
      const exprResult = this.visitExpression(ctx.children.expression[0]);
      console.log("Expression result:", exprResult);
      
      // Determine variable type from expression
      const varType = this.inferTypeFromExpression(ctx.children.expression[0]);
      console.log("Variable type:", varType);
      
      // Declare variable in symbol table
      this.symbolTable.declareVariable(varName, varType);
      
      this.emit({ type: "ASSIGN", target: varName, source: exprResult });
    }
  }

  private visitAssignment(ctx: any): void {
    // Unified CST access: always use ctx.children.*
    if (!ctx.children || !ctx.children.Identifier) {
      return;
    }
    
    const varName = ctx.children.Identifier[0].image;
    const expressionCtx = ctx.children.expression?.[0];
    
    if (expressionCtx) {
      const exprResult = this.visitExpression(expressionCtx);
      this.emit({ type: "ASSIGN", target: varName, source: exprResult });
    }
  }

  private visitIfStatement(ctx: any): void {
    // Unified CST access: always use ctx.children.*
    if (!ctx.children) {
      return;
    }
    
    // Get expression
    const expressionCtx = ctx.children.expression?.[0];
    if (!expressionCtx) {
      return;
    }
    
    const conditionResult = this.visitExpression(expressionCtx);
    const elseLabel = this.newLabel();
    const endLabel = this.newLabel();
    
    this.emit({ type: "JUMP_IF_FALSE", condition: conditionResult, target: elseLabel });
    
    // Then block
    if (ctx.children.statement) {
      for (const stmt of ctx.children.statement) {
        this.visitStatement(stmt);
      }
    }
    
    this.emit({ type: "JUMP", target: endLabel });
    this.emit({ type: "LABEL", name: elseLabel });
    
    // Else block
    if (ctx.children.statement2) {
      for (const stmt of ctx.children.statement2) {
        this.visitStatement(stmt);
      }
    }
    
    this.emit({ type: "LABEL", name: endLabel });
  }

  private visitWhileStatement(ctx: any): void {
    // Unified CST access: always use ctx.children.*
    if (!ctx.children) {
      return;
    }
    
    const startLabel = this.newLabel();
    const endLabel = this.newLabel();
    
    this.emit({ type: "LABEL", name: startLabel });
    
    // Get expression
    const expressionCtx = ctx.children.expression?.[0];
    if (!expressionCtx) {
      return;
    }
    
    const conditionResult = this.visitExpression(expressionCtx);
    this.emit({ type: "JUMP_IF_FALSE", condition: conditionResult, target: endLabel });
    
    // Loop body
    if (ctx.children.statement) {
      for (const stmt of ctx.children.statement) {
        this.visitStatement(stmt);
      }
    }
    
    this.emit({ type: "JUMP", target: startLabel });
    this.emit({ type: "LABEL", name: endLabel });
  }

  private visitFunctionDeclaration(ctx: any): void {
    // Unified CST access: always use ctx.children.*
    if (!ctx.children || !ctx.children.Identifier) {
      return;
    }
    
    const funcName = ctx.children.Identifier[0].image;
    const params: string[] = [];
    const paramTypes: DataType[] = [];
    
    if (ctx.children.parameterList && ctx.children.parameterList.length > 0) {
      if (ctx.children.parameterList[0].children && ctx.children.parameterList[0].children.Identifier) {
        for (const param of ctx.children.parameterList[0].children.Identifier) {
          params.push(param.image);
          paramTypes.push("number"); // Default parameter type
        }
      }
    }
    
    // Declare function in symbol table
    this.symbolTable.declareFunction(funcName, "number", paramTypes); // Default return type
    
    this.emit({ type: "FUNCTION_START", name: funcName, params });
    
    // Function body
    if (ctx.children.statement) {
      for (const stmt of ctx.children.statement) {
        this.visitStatement(stmt);
      }
    }
    
    this.emit({ type: "FUNCTION_END" });
  }

  private visitReturnStatement(ctx: any): void {
    // Unified CST access: always use ctx.children.*
    if (!ctx.children) {
      this.emit({ type: "RETURN" });
      return;
    }
    
    const expressionCtx = ctx.children.expression?.[0];
    if (expressionCtx) {
      const exprResult = this.visitExpression(expressionCtx);
      this.emit({ type: "RETURN", value: exprResult });
    } else {
      this.emit({ type: "RETURN" });
    }
  }

  private visitPrintStatement(ctx: any): void {
    // Unified CST access: always use ctx.children.*
    if (!ctx.children) {
      return;
    }
    
    const expressionCtx = ctx.children.expression?.[0];
    if (expressionCtx) {
      const exprResult = this.visitExpression(expressionCtx);
      this.emit({ type: "PRINT", value: exprResult });
    }
  }

  private visitExpression(ctx: any): string {
    if (ctx.children && ctx.children.logicalOr && ctx.children.logicalOr.length > 0) {
      return this.visitLogicalOr(ctx.children.logicalOr[0]);
    }
    
    return "0"; // fallback
  }

  private visitLogicalOr(ctx: any): string {
    if (ctx.children && ctx.children.logicalAnd && ctx.children.logicalAnd.length > 0) {
      let result = this.visitLogicalAnd(ctx.children.logicalAnd[0]);
      
      for (let i = 1; i < ctx.children.logicalAnd.length; i++) {
        const right = this.visitLogicalAnd(ctx.children.logicalAnd[i]);
        const temp = this.newTemp();
        this.emit({ type: "OR", target: temp, left: result, right });
        result = temp;
      }
      
      return result;
    }
    return "0"; // fallback
  }

  private visitLogicalAnd(ctx: any): string {
    console.log("visitLogicalAnd called with:", ctx);
    console.log("ctx.children:", ctx.children);
    console.log("ctx.children?.equality:", ctx.children?.equality);
    
    if (ctx.children && ctx.children.equality && ctx.children.equality.length > 0) {
      let result = this.visitEquality(ctx.children.equality[0]);
      console.log("visitLogicalAnd result:", result);
      
      for (let i = 1; i < ctx.children.equality.length; i++) {
        const right = this.visitEquality(ctx.children.equality[i]);
        const temp = this.newTemp();
        this.emit({ type: "AND", target: temp, left: result, right });
        result = temp;
      }
      
      return result;
    }
    console.log("visitLogicalAnd fallback to 0");
    return "0"; // fallback
  }

  private visitEquality(ctx: any): string {
    console.log("visitEquality called with:", ctx);
    console.log("ctx.children:", ctx.children);
    console.log("ctx.children?.comparison:", ctx.children?.comparison);
    
    if (ctx.children && ctx.children.comparison && ctx.children.comparison.length > 0) {
      let result = this.visitComparison(ctx.children.comparison[0]);
      console.log("visitEquality result:", result);
      
      // Get the operators from the CST
      const operators: string[] = [];
      if (ctx.children.Equal) operators.push(...ctx.children.Equal.map((op: any) => "EQ"));
      if (ctx.children.NotEqual) operators.push(...ctx.children.NotEqual.map((op: any) => "NE"));
      
      for (let i = 1; i < ctx.children.comparison.length; i++) {
        const right = this.visitComparison(ctx.children.comparison[i]);
        const temp = this.newTemp();
        
        // Use the operator for this position
        const opType = operators[i - 1] as "EQ" | "NE" || "EQ";
        
        this.emit({ type: opType, target: temp, left: result, right });
        result = temp;
      }
      
      return result;
    }
    console.log("visitEquality fallback to 0");
    return "0"; // fallback
  }

  private visitComparison(ctx: any): string {
    console.log("visitComparison called with:", ctx);
    console.log("ctx.children:", ctx.children);
    console.log("ctx.children?.term:", ctx.children?.term);
    
    if (ctx.children && ctx.children.term && ctx.children.term.length > 0) {
      let result = this.visitTerm(ctx.children.term[0]);
      console.log("visitComparison result:", result);
      
      // Get the operators from the CST
      const operators: string[] = [];
      if (ctx.children.Less) operators.push(...ctx.children.Less.map((op: any) => "LT"));
      if (ctx.children.Greater) operators.push(...ctx.children.Greater.map((op: any) => "GT"));
      if (ctx.children.LessEqual) operators.push(...ctx.children.LessEqual.map((op: any) => "LE"));
      if (ctx.children.GreaterEqual) operators.push(...ctx.children.GreaterEqual.map((op: any) => "GE"));
      
      for (let i = 1; i < ctx.children.term.length; i++) {
        const right = this.visitTerm(ctx.children.term[i]);
        const temp = this.newTemp();
        
        // Use the operator for this position
        const opType = operators[i - 1] as "LT" | "GT" | "LE" | "GE" || "LT";
        
        this.emit({ type: opType, target: temp, left: result, right });
        result = temp;
      }
      
      return result;
    }
    console.log("visitComparison fallback to 0");
    return "0"; // fallback
  }

  private visitTerm(ctx: any): string {
    console.log("visitTerm called with:", ctx);
    console.log("ctx.children:", ctx.children);
    console.log("ctx.children?.factor:", ctx.children?.factor);
    
    if (ctx.children && ctx.children.factor && ctx.children.factor.length > 0) {
      let result = this.visitFactor(ctx.children.factor[0]);
      console.log("visitTerm result:", result);
      
      // Get the operators from the CST
      const operators: string[] = [];
      if (ctx.children.Plus) operators.push(...ctx.children.Plus.map((op: any) => "ADD"));
      if (ctx.children.Minus) operators.push(...ctx.children.Minus.map((op: any) => "SUB"));
      
      for (let i = 1; i < ctx.children.factor.length; i++) {
        const right = this.visitFactor(ctx.children.factor[i]);
        const temp = this.newTemp();
        
        // Use the operator for this position
        const opType = operators[i - 1] as "ADD" | "SUB" || "ADD";
        
        this.emit({ type: opType, target: temp, left: result, right });
        result = temp;
      }
      
      return result;
    }
    console.log("visitTerm fallback to 0");
    return "0"; // fallback
  }

  private visitFactor(ctx: any): string {
    console.log("visitFactor called with:", ctx);
    console.log("ctx.children:", ctx.children);
    console.log("ctx.children?.unary:", ctx.children?.unary);
    
    if (ctx.children && ctx.children.unary && ctx.children.unary.length > 0) {
      let result = this.visitUnary(ctx.children.unary[0]);
      console.log("visitFactor result:", result);
      
      // Get the operators from the CST
      const operators: string[] = [];
      if (ctx.children.Mult) operators.push(...ctx.children.Mult.map((op: any) => "MUL"));
      if (ctx.children.Div) operators.push(...ctx.children.Div.map((op: any) => "DIV"));
      if (ctx.children.Mod) operators.push(...ctx.children.Mod.map((op: any) => "MOD"));
      
      for (let i = 1; i < ctx.children.unary.length; i++) {
        const right = this.visitUnary(ctx.children.unary[i]);
        const temp = this.newTemp();
        
        // Use the operator for this position
        const opType = operators[i - 1] as "MUL" | "DIV" | "MOD" || "MUL";
        
        this.emit({ type: opType, target: temp, left: result, right });
        result = temp;
      }
      
      return result;
    }
    console.log("visitFactor fallback to 0");
    return "0"; // fallback
  }

  private visitUnary(ctx: any): string {
    console.log("visitUnary called with:", ctx);
    console.log("ctx.children:", ctx.children);
    console.log("ctx.children?.Not:", ctx.children?.Not);
    console.log("ctx.children?.Minus:", ctx.children?.Minus);
    console.log("ctx.children?.primary:", ctx.children?.primary);
    
    if (ctx.children && ctx.children.Not && ctx.children.unary && ctx.children.unary.length > 0) {
      const operand = this.visitUnary(ctx.children.unary[0]);
      const temp = this.newTemp();
      this.emit({ type: "NOT", target: temp, source: operand });
      return temp;
    } else if (ctx.children && ctx.children.Minus && ctx.children.unary && ctx.children.unary.length > 0) {
      const operand = this.visitUnary(ctx.children.unary[0]);
      const temp = this.newTemp();
      this.emit({ type: "NEG", target: temp, source: operand });
      return temp;
    } else if (ctx.children && ctx.children.primary && ctx.children.primary.length > 0) {
      const result = this.visitPrimary(ctx.children.primary[0]);
      console.log("visitUnary result:", result);
      return result;
    }
    console.log("visitUnary fallback to 0");
    return "0"; // fallback
  }

  private visitPrimary(ctx: any): string {
    console.log("visitPrimary called with:", ctx);
    console.log("ctx.children:", ctx.children);
    console.log("ctx.children?.NumberLiteral:", ctx.children?.NumberLiteral);
    console.log("ctx.children?.StringLiteral:", ctx.children?.StringLiteral);
    console.log("ctx.children?.BooleanLiteral:", ctx.children?.BooleanLiteral);
    console.log("ctx.children?.functionCall:", ctx.children?.functionCall);
    console.log("ctx.children?.Identifier:", ctx.children?.Identifier);
    console.log("ctx.children?.expression:", ctx.children?.expression);
    
    if (ctx.children && ctx.children.NumberLiteral && ctx.children.NumberLiteral.length > 0) {
      const result = ctx.children.NumberLiteral[0].image;
      console.log("visitPrimary NumberLiteral result:", result);
      return result;
    } else if (ctx.children && ctx.children.StringLiteral && ctx.children.StringLiteral.length > 0) {
      const result = ctx.children.StringLiteral[0].image;
      console.log("visitPrimary StringLiteral result:", result);
      return result;
    } else if (ctx.children && ctx.children.BooleanLiteral && ctx.children.BooleanLiteral.length > 0) {
      const result = ctx.children.BooleanLiteral[0].image;
      console.log("visitPrimary BooleanLiteral result:", result);
      return result;
    } else if (ctx.children && ctx.children.functionCall && ctx.children.functionCall.length > 0) {
      const result = this.visitFunctionCall(ctx.children.functionCall[0]);
      console.log("visitPrimary functionCall result:", result);
      return result;
    } else if (ctx.children && ctx.children.Identifier && ctx.children.Identifier.length > 0) {
      const result = ctx.children.Identifier[0].image;
      console.log("visitPrimary Identifier result:", result);
      return result;
    } else if (ctx.children && ctx.children.expression && ctx.children.expression.length > 0) {
      const result = this.visitExpression(ctx.children.expression[0]);
      console.log("visitPrimary expression result:", result);
      return result;
    }
    
    console.log("visitPrimary fallback to 0");
    return "0"; // fallback instead of throwing error
  }

  private visitFunctionCall(ctx: any): string {
    // Unified CST access: always use ctx.children.*
    if (!ctx.children || !ctx.children.Identifier) {
      return "0";
    }
    
    const funcName = ctx.children.Identifier[0].image;
    const args: string[] = [];
    
    if (ctx.children.argumentList && ctx.children.argumentList.length > 0) {
      if (ctx.children.argumentList[0].children && ctx.children.argumentList[0].children.expression) {
        for (const arg of ctx.children.argumentList[0].children.expression) {
          args.push(this.visitExpression(arg));
        }
      }
    }
    
    const result = this.newTemp();
    this.emit({ type: "CALL", target: result, function: funcName, args });
    return result;
  }
}

