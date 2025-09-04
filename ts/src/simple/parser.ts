import { CstParser, IToken } from "chevrotain";
import { SimpleLexer, tokens, StringTok, NumTok, Semi, Other } from "./lexer";

export class SimpleParser extends CstParser {
  constructor() {
    super(tokens, { recoveryEnabled: false });
    this.performSelfAnalysis();
  }

  public prog = this.RULE("prog", () => {
    this.MANY(() => {
      this.SUBRULE(this.stmt);
      this.OPTION(() => this.CONSUME(Semi));
    });
  });

  private stmt = this.RULE("stmt", () => {
    this.OR([
      { ALT: () => { this.CONSUME(StringTok); } },
      { ALT: () => { this.CONSUME(NumTok); } },
      { ALT: () => { this.CONSUME(Other); } }
    ]);
  });
}

export function parse(input: string) {
  const lexResult = SimpleLexer.tokenize(input);
  const parser = new SimpleParser();
  parser.input = lexResult.tokens as IToken[];
  const cst = parser.prog();
  if (parser.errors.length) {
    throw new Error("Parse error: " + parser.errors[0].message);
  }
  return { cst, tokens: lexResult.tokens };
}


