# TypeScript Parser/Scanner Implementation

This repository contains a modern TypeScript implementation of lexical analysis and parsing using the Chevrotain library. It demonstrates how to build a complete compiler frontend with both command-line interfaces and a web-based GUI for visualization.

## Table of Contents
1. [Overview](#overview)
2. [TypeScript Implementation (`ts/`)](#typescript-implementation)
3. [Building and Running](#building-and-running)
4. [Key Concepts](#key-concepts)

---

## Overview

The TypeScript implementation provides:
- **Calculator Parser**: Arithmetic expression evaluation with operator precedence
- **Simple Statement Parser**: Recognition of strings, numbers, and semicolon-terminated statements
- **Web GUI**: Interactive visualization of tokens, AST, and parsing results
- **CLI Tools**: Command-line interfaces for both parsers
- **AST Generation**: Abstract Syntax Tree construction and visualization

---

## TypeScript Implementation (`ts/`)

### Project Structure

```
ts/
├── src/
│   ├── calc/           # Calculator parser implementation
│   │   ├── lexer.ts    # Token definitions
│   │   ├── parser.ts   # Grammar rules
│   │   ├── interpreter.ts # Expression evaluation
│   │   ├── ast.ts      # AST construction
│   │   └── cli.ts      # Command-line interface
│   └── simple/         # Simple statement parser
│       ├── lexer.ts    # Token definitions
│       ├── parser.ts   # Grammar rules
│       └── cli.ts      # Command-line interface
├── web/
│   └── main.ts         # Web GUI logic
├── index.html          # Web interface
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

### Calculator Parser Implementation

#### Lexer (`ts/src/calc/lexer.ts`)
```typescript
export const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /[0-9]+/,
  longer_alt: WhiteSpace
});

export const Plus = createToken({ name: "Plus", pattern: /\+/ });
export const Minus = createToken({ name: "Minus", pattern: /-/ });
export const Mult = createToken({ name: "Mult", pattern: /\*/ });
export const Div = createToken({ name: "Div", pattern: /\// });
export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
});
```

**Key Features:**
- **Token Definition**: Uses Chevrotain's `createToken()` for each symbol
- **Pattern Matching**: Regex patterns for numbers, operators, and parentheses
- **Whitespace Handling**: `SKIPPED` group ignores whitespace tokens
- **Token Precedence**: `longer_alt` ensures proper token recognition

#### Parser (`ts/src/calc/parser.ts`)
```typescript
export class CalcParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  public expression = this.RULE("expression", () => {
    this.SUBRULE(this.term);
    this.MANY(() => {
      this.OR([
        { ALT: () => { this.CONSUME(Plus); this.SUBRULE2(this.term); } },
        { ALT: () => { this.CONSUME(Minus); this.SUBRULE2(this.term); } }
      ]);
    });
  });

  private term = this.RULE("term", () => {
    this.SUBRULE(this.factor);
    this.MANY(() => {
      this.OR([
        { ALT: () => { this.CONSUME(Mult); this.SUBRULE2(this.factor); } },
        { ALT: () => { this.CONSUME(Div); this.SUBRULE2(this.factor); } }
      ]);
    });
  });

  private factor = this.RULE("factor", () => {
    this.OR([
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => {
        this.CONSUME(LParen);
        this.SUBRULE(this.expression);
        this.CONSUME(RParen);
      }}
    ]);
  });
}
```

**Grammar Rules Explained:**
- **Expression**: Handles addition and subtraction with left associativity
- **Term**: Handles multiplication and division with higher precedence
- **Factor**: Handles numbers and parenthesized expressions
- **Recovery**: `recoveryEnabled: true` provides error recovery

#### AST Builder (`ts/src/calc/ast.ts`)
```typescript
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
    if (ctx.term && ctx.term.length === 1) {
      return this.visit(ctx.term[0]);
    }
    
    let result = this.visit(ctx.term[0]);
    for (let i = 0; i < ctx.term.length - 1; i++) {
      const op = ctx.Plus ? "+" : "-";
      result = { type: "BinaryExpr", op, left: result, right: this.visit(ctx.term[i + 1]) };
    }
    return result;
  }
}
```

**AST Features:**
- **Type Safety**: TypeScript types for all AST node variants
- **Visitor Pattern**: Converts Concrete Syntax Tree to Abstract Syntax Tree
- **Simplified Structure**: Removes syntactic sugar, focuses on semantics

#### Interpreter (`ts/src/calc/interpreter.ts`)
```typescript
class EvalVisitor extends (new CalcParser().getBaseCstVisitorConstructor()) {
  constructor() {
    super();
    this.validateVisitor();
  }

  expression(ctx: any): number {
    if (ctx.term && ctx.term.length === 1) {
      return this.visit(ctx.term[0]);
    }
    
    let result = this.visit(ctx.term[0]);
    for (let i = 0; i < ctx.term.length - 1; i++) {
      const op = ctx.Plus ? "+" : "-";
      const right = this.visit(ctx.term[i + 1]);
      result = op === "+" ? result + right : result - right;
    }
    return result;
  }
}
```

**Evaluation Logic:**
- **Visitor Pattern**: Traverses CST to compute values
- **Operator Precedence**: Respects mathematical precedence rules
- **Error Handling**: Graceful handling of division by zero

### Simple Statement Parser

#### Lexer (`ts/src/simple/lexer.ts`)
```typescript
export const StringTok = createToken({
  name: "StringTok",
  pattern: /[a-zA-Z]+/,
  longer_alt: WhiteSpace
});

export const NumTok = createToken({
  name: "NumTok", 
  pattern: /[0-9]+/,
  longer_alt: WhiteSpace
});

export const Semi = createToken({ name: "Semi", pattern: /;/ });
export const Other = createToken({ name: "Other", pattern: /./ });
```

#### Parser (`ts/src/simple/parser.ts`)
```typescript
export class SimpleParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  public prog = this.RULE("prog", () => {
    this.MANY(() => {
      this.SUBRULE(this.stmt);
    });
  });

  private stmt = this.RULE("stmt", () => {
    this.OR([
      { ALT: () => this.CONSUME(StringTok) },
      { ALT: () => this.CONSUME(NumTok) },
      { ALT: () => this.CONSUME(Other) }
    ]);
    this.OPTION(() => this.CONSUME(Semi));
  });
}
```

### Web GUI Features

#### Interactive Interface (`ts/index.html`)
- **Mode Selection**: Switch between Calculator and Simple parsers
- **Real-time Input**: Live tokenization and parsing
- **Visual AST**: SVG-based tree diagram
- **Collapsible Sections**: Space-efficient layout

#### Visualization (`ts/web/main.ts`)
```typescript
function drawAst(ast: AstNode | undefined, container: HTMLElement) {
  clearSvg();
  if (!ast) return;
  
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "400");
  svg.style.border = "1px solid #e2e8f0";
  svg.style.borderRadius = "8px";
  
  layoutAndDraw(ast, 200, 50, 150);
  container.appendChild(svg);
}
```

**GUI Features:**
- **SVG Rendering**: Scalable vector graphics for AST visualization
- **Dynamic Layout**: Automatic positioning of nodes
- **Interactive Elements**: Expandable sections and mode switching
- **Error Display**: Clear error messages and recovery

---

## Building and Running

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
cd ts
npm install             # Install dependencies
```

### Development
```bash
npm run build          # Build TypeScript
npm run calc           # Run calculator CLI
npm run simple         # Run simple parser CLI
npm run dev            # Start web GUI (http://localhost:5173)
```

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run calc` - Run calculator command-line interface
- `npm run simple` - Run simple parser command-line interface
- `npm run dev` - Start development server for web GUI

---

## Key Concepts

### Lexical Analysis (Tokenization)
- **Token Recognition**: Converts character stream into structured tokens
- **Pattern Matching**: Uses regular expressions to identify language constructs
- **Semantic Values**: Associates data with tokens (e.g., numeric values)
- **Error Handling**: Detects and reports invalid characters

### Syntax Analysis (Parsing)
- **Grammar Rules**: Define valid sentence structures using Chevrotain DSL
- **Operator Precedence**: Controls order of operations (multiplication before addition)
- **Associativity**: Determines grouping of operators (left-associative)
- **Error Recovery**: Graceful handling of syntax errors with recovery

### Abstract Syntax Trees (AST)
- **Simplified Representation**: Removes syntactic sugar from parse tree
- **Semantic Structure**: Focuses on meaning rather than syntax
- **Type Safety**: TypeScript types ensure correct AST construction
- **Visualization**: SVG-based tree diagrams for understanding structure

### Visitor Pattern
- **Separation of Concerns**: Separates parsing from evaluation/transformation
- **Multiple Visitors**: Different visitors for evaluation, AST building, etc.
- **Extensibility**: Easy to add new operations without modifying parser

This TypeScript implementation demonstrates modern compiler construction techniques using industry-standard tools and patterns.
