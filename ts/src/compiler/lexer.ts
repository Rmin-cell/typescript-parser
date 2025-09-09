import { createToken, Lexer } from "chevrotain";

// Whitespace (declared first as it's used in longer_alt)
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// Newline (for statement separation)
export const Newline = createToken({
  name: "Newline",
  pattern: /\n/,
  group: Lexer.SKIPPED
});

// Identifiers (declared early as it's used in longer_alt)
export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
  longer_alt: WhiteSpace
});

// Keywords
export const Let = createToken({ name: "Let", pattern: /let/, longer_alt: Identifier });
export const If = createToken({ name: "If", pattern: /if/, longer_alt: Identifier });
export const Else = createToken({ name: "Else", pattern: /else/, longer_alt: Identifier });
export const While = createToken({ name: "While", pattern: /while/, longer_alt: Identifier });
export const Function = createToken({ name: "Function", pattern: /function/, longer_alt: Identifier });
export const Return = createToken({ name: "Return", pattern: /return/, longer_alt: Identifier });
export const Print = createToken({ name: "Print", pattern: /print/, longer_alt: Identifier });

// Literals
export const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /[0-9]+/,
  longer_alt: WhiteSpace
});

export const StringLiteral = createToken({
  name: "StringLiteral", 
  pattern: /"[^"]*"/,
  longer_alt: WhiteSpace
});

export const BooleanLiteral = createToken({
  name: "BooleanLiteral",
  pattern: /true|false/,
  longer_alt: WhiteSpace
});

// Operators
export const Plus = createToken({ name: "Plus", pattern: /\+/ });
export const Minus = createToken({ name: "Minus", pattern: /-/ });
export const Mult = createToken({ name: "Mult", pattern: /\*/ });
export const Div = createToken({ name: "Div", pattern: /\// });
export const Mod = createToken({ name: "Mod", pattern: /%/ });
export const Assign = createToken({ name: "Assign", pattern: /=/ });
export const Equal = createToken({ name: "Equal", pattern: /==/ });
export const NotEqual = createToken({ name: "NotEqual", pattern: /!=/ });
export const Less = createToken({ name: "Less", pattern: /</ });
export const Greater = createToken({ name: "Greater", pattern: />/ });
export const LessEqual = createToken({ name: "LessEqual", pattern: /<=/ });
export const GreaterEqual = createToken({ name: "GreaterEqual", pattern: />=/ });
export const And = createToken({ name: "And", pattern: /&&/ });
export const Or = createToken({ name: "Or", pattern: /\|\|/ });
export const Not = createToken({ name: "Not", pattern: /!/ });

// Delimiters
export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const LBrace = createToken({ name: "LBrace", pattern: /\{/ });
export const RBrace = createToken({ name: "RBrace", pattern: /\}/ });
export const Semicolon = createToken({ name: "Semicolon", pattern: /;/ });
export const Comma = createToken({ name: "Comma", pattern: /,/ });

// All tokens in order of precedence
export const allTokens = [
  WhiteSpace,
  Newline,
  // Keywords
  Let,
  If,
  Else,
  While,
  Function,
  Return,
  Print,
  // Literals
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  // Identifiers
  Identifier,
  // Operators (by precedence)
  Equal,
  NotEqual,
  LessEqual,
  GreaterEqual,
  Less,
  Greater,
  And,
  Or,
  Plus,
  Minus,
  Mult,
  Div,
  Mod,
  Not,
  Assign,
  // Delimiters
  LParen,
  RParen,
  LBrace,
  RBrace,
  Semicolon,
  Comma
];

export const compilerLexer = new Lexer(allTokens);