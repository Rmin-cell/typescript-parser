import { createToken, Lexer } from "chevrotain";

export const StringTok = createToken({ name: "StringTok", pattern: /[a-zA-Z]+/ });
export const NumTok = createToken({ name: "NumTok", pattern: /\d+/ });
export const Semi = createToken({ name: "Semi", pattern: /;/ });
export const Other = createToken({ name: "Other", pattern: /./ });
export const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /[\s\t\n\r]+/, group: Lexer.SKIPPED });

export const tokens = [WhiteSpace, StringTok, NumTok, Semi, Other];
export const SimpleLexer = new Lexer(tokens);


