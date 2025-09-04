import { CstParser, IToken } from "chevrotain";
import { CalcLexer, allTokens, NumberLiteral, Plus, Minus, Mult, Div, LParen, RParen } from "./lexer";

export class CalcParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: false });
    this.performSelfAnalysis();
  }

  public expression = this.RULE("expression", () => {
    this.SUBRULE(this.term);
    this.MANY(() => {
      this.OR([
        { ALT: () => { this.CONSUME(Plus); this.SUBRULE2(this.term); } },
        { ALT: () => { this.CONSUME(Minus); this.SUBRULE3(this.term); } }
      ]);
    });
  });

  private term = this.RULE("term", () => {
    this.SUBRULE(this.factor);
    this.MANY(() => {
      this.OR([
        { ALT: () => { this.CONSUME(Mult); this.SUBRULE2(this.factor); } },
        { ALT: () => { this.CONSUME(Div); this.SUBRULE3(this.factor); } }
      ]);
    });
  });

  private factor = this.RULE("factor", () => {
    this.OR([
      { ALT: () => { this.CONSUME(NumberLiteral); } },
      { ALT: () => { this.CONSUME(LParen); this.SUBRULE(this.expression); this.CONSUME(RParen); } },
      { ALT: () => { this.CONSUME(Minus); this.SUBRULE(this.factor); } }
    ]);
  });
}

export function parseToCst(input: string) {
  const lexResult = CalcLexer.tokenize(input);
  const parser = new CalcParser();
  parser.input = lexResult.tokens as IToken[];
  const cst = parser.expression();
  if (parser.errors.length) {
    const first = parser.errors[0];
    throw new Error("Parse error: " + first.message);
  }
  return { cst, tokens: lexResult.tokens };
}


