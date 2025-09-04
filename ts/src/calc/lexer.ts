import { createToken, Lexer } from "chevrotain";

export const NumberLiteral = createToken({ name: "NumberLiteral", pattern: /\d+/ });
export const Plus = createToken({ name: "Plus", pattern: /\+/ });
export const Minus = createToken({ name: "Minus", pattern: /-/ });
export const Mult = createToken({ name: "Mult", pattern: /\*/ });
export const Div = createToken({ name: "Div", pattern: /\// });
export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /[\s\t\n\r]+/, group: Lexer.SKIPPED });

export const allTokens = [WhiteSpace, NumberLiteral, Plus, Minus, Mult, Div, LParen, RParen];
export const CalcLexer = new Lexer(allTokens);


