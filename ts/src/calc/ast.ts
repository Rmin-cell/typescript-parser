import { CstNode } from "chevrotain";
import { CalcParser, parseToCst } from "./parser";

export type AstNode =
  | { type: "NumberLiteral"; value: number }
  | { type: "UnaryMinus"; value: AstNode }
  | { type: "BinaryExpr"; op: "+" | "-" | "*" | "/"; left: AstNode; right: AstNode };

class AstVisitor extends (new CalcParser().getBaseCstVisitorConstructor()) {
  constructor() {
    super();
    this.validateVisitor();
  }

  expression(ctx: any): AstNode {
    let node = this.visit(ctx.term[0]) as AstNode;
    let termIndex = 1;
    // Operators appear in ctx.Plus / ctx.Minus in the order consumed
    const pluses = ctx.Plus ?? [];
    const minuses = ctx.Minus ?? [];
    let p = 0;
    let m = 0;
    while (termIndex < ctx.term.length) {
      if (p < pluses.length) {
        node = { type: "BinaryExpr", op: "+", left: node, right: this.visit(ctx.term[termIndex]) };
        p++;
      } else if (m < minuses.length) {
        node = { type: "BinaryExpr", op: "-", left: node, right: this.visit(ctx.term[termIndex]) };
        m++;
      }
      termIndex++;
    }
    return node;
  }

  term(ctx: any): AstNode {
    let node = this.visit(ctx.factor[0]) as AstNode;
    let factorIndex = 1;
    const mults = ctx.Mult ?? [];
    const divs = ctx.Div ?? [];
    let mi = 0;
    let di = 0;
    while (factorIndex < ctx.factor.length) {
      if (mi < mults.length) {
        node = { type: "BinaryExpr", op: "*", left: node, right: this.visit(ctx.factor[factorIndex]) };
        mi++;
      } else if (di < divs.length) {
        node = { type: "BinaryExpr", op: "/", left: node, right: this.visit(ctx.factor[factorIndex]) };
        di++;
      }
      factorIndex++;
    }
    return node;
  }

  factor(ctx: any): AstNode {
    if (ctx.NumberLiteral) {
      return { type: "NumberLiteral", value: parseInt(ctx.NumberLiteral[0].image, 10) };
    }
    if (ctx.expression) {
      return this.visit(ctx.expression[0]);
    }
    if (ctx.Minus) {
      return { type: "UnaryMinus", value: this.visit(ctx.factor[0]) };
    }
    throw new Error("Invalid factor");
  }
}

export function buildAstFromText(input: string): AstNode {
  const { cst } = parseToCst(input);
  const visitor = new AstVisitor();
  return visitor.visit(cst as CstNode) as AstNode;
}


