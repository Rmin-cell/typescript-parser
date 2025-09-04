import { CstNode } from "chevrotain";
import { CalcParser, parseToCst } from "./parser";

class EvalVisitor extends (new CalcParser().getBaseCstVisitorConstructor()) {
  constructor() {
    super();
    this.validateVisitor();
  }

  expression(ctx: any): number {
    let value = this.visit(ctx.term[0]);
    const ops = ctx.Plus ?? [];
    const subs = ctx.Minus ?? [];
    let opIdx = 0;
    let subIdx = 0;
    for (let i = 1; i < ctx.term.length; i++) {
      const hasPlus = opIdx < ops.length && (ops[opIdx].tokenType.name === "Plus");
      const hasMinus = subIdx < subs.length && (subs[subIdx].tokenType.name === "Minus");
      if (hasPlus) {
        value += this.visit(ctx.term[i]);
        opIdx++;
      } else if (hasMinus) {
        value -= this.visit(ctx.term[i]);
        subIdx++;
      }
    }
    return value;
  }

  term(ctx: any): number {
    let value = this.visit(ctx.factor[0]);
    const muls = ctx.Mult ?? [];
    const divs = ctx.Div ?? [];
    let m = 0;
    let d = 0;
    for (let i = 1; i < ctx.factor.length; i++) {
      const hasMult = m < muls.length && (muls[m].tokenType.name === "Mult");
      const hasDiv = d < divs.length && (divs[d].tokenType.name === "Div");
      if (hasMult) {
        value *= this.visit(ctx.factor[i]);
        m++;
      } else if (hasDiv) {
        const rhs = this.visit(ctx.factor[i]);
        if (rhs === 0) throw new Error("Division by zero");
        value = Math.trunc(value / rhs);
        d++;
      }
    }
    return value;
  }

  factor(ctx: any): number {
    if (ctx.NumberLiteral) {
      return parseInt(ctx.NumberLiteral[0].image, 10);
    }
    if (ctx.expression) {
      return this.visit(ctx.expression[0]);
    }
    if (ctx.Minus) {
      return -this.visit(ctx.factor[0]);
    }
    throw new Error("Invalid factor");
  }
}

export function evaluate(input: string): number {
  const parser = new CalcParser();
  const visitor = new EvalVisitor();
  const { cst } = parseToCst(input);
  return visitor.visit(cst as CstNode);
}


