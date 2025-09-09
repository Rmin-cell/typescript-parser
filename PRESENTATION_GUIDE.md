# Parser Visualizer - Presentation Guide

## 🎯 **Project Overview**

**TypeScript Parser/Scanner Implementation** - A modern demonstration of compiler frontend techniques using Chevrotain library, featuring both CLI tools and an interactive web GUI.

### **Key Features to Present:**
- ✅ **Lexical Analysis** (Tokenization)
- ✅ **Syntax Analysis** (Parsing) 
- ✅ **AST Generation** (Abstract Syntax Trees)
- ✅ **Interactive Web GUI** with real-time visualization
- ✅ **Two Parser Modes**: Calculator & Simple Statement Parser

---

## 📋 **Presentation Structure**

### **1. Introduction (2-3 minutes)**
**What we built:** A complete compiler frontend that demonstrates lexical analysis, parsing, and AST generation.

**Why it matters:** These are the fundamental building blocks of any programming language or compiler.

**Tech Stack:** TypeScript + Chevrotain + Vite + Modern Web APIs

---

## 🔍 **2. Lexical Analysis (Tokenization) - 5 minutes**

### **Concept:**
Converting character streams into structured tokens using regular expressions.

### **Demo Code:**
```typescript
// ts/src/calc/lexer.ts
import { createToken, Lexer } from "chevrotain";

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
  group: Lexer.SKIPPED  // Ignore whitespace
});

export const allTokens = [
  WhiteSpace,
  NumberLiteral,
  Plus,
  Minus,
  Mult,
  Div,
  LParen,
  RParen
];

export const calcLexer = new Lexer(allTokens);
```

### **Live Demo:**
1. Open web GUI: `npm run dev`
2. Enter: `3 + 5 * (10 - 4)`
3. Show tokens output:
```json
[
  { "image": "3", "tokenType": "NumberLiteral" },
  { "image": "+", "tokenType": "Plus" },
  { "image": "5", "tokenType": "NumberLiteral" },
  { "image": "*", "tokenType": "Mult" },
  { "image": "(", "tokenType": "LParen" },
  { "image": "10", "tokenType": "NumberLiteral" },
  { "image": "-", "tokenType": "Minus" },
  { "image": "4", "tokenType": "NumberLiteral" },
  { "image": ")", "tokenType": "RParen" }
]
```

---

## 🌳 **3. Syntax Analysis (Parsing) - 7 minutes**

### **Concept:**
Building a parse tree from tokens based on grammar rules, handling operator precedence and associativity.

### **Demo Code:**
```typescript
// ts/src/calc/parser.ts
import { CstParser } from "chevrotain";

export class CalcParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  // Expression: handles addition and subtraction (lowest precedence)
  public expression = this.RULE("expression", () => {
    this.SUBRULE(this.term);
    this.MANY(() => {
      this.OR([
        { ALT: () => { this.CONSUME(Plus); this.SUBRULE2(this.term); } },
        { ALT: () => { this.CONSUME(Minus); this.SUBRULE2(this.term); } }
      ]);
    });
  });

  // Term: handles multiplication and division (higher precedence)
  private term = this.RULE("term", () => {
    this.SUBRULE(this.factor);
    this.MANY(() => {
      this.OR([
        { ALT: () => { this.CONSUME(Mult); this.SUBRULE2(this.factor); } },
        { ALT: () => { this.CONSUME(Div); this.SUBRULE2(this.factor); } }
      ]);
    });
  });

  // Factor: handles numbers and parenthesized expressions (highest precedence)
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

### **Key Points to Explain:**
- **Operator Precedence**: `*` and `/` have higher precedence than `+` and `-`
- **Left Associativity**: `3 + 4 + 5` is parsed as `(3 + 4) + 5`
- **Recovery**: `recoveryEnabled: true` provides error recovery

### **Live Demo:**
1. Show the same expression: `3 + 5 * (10 - 4)`
2. Explain how the parser groups operations correctly
3. Show error handling: try `3 + + 5` or `3 + (5`

---

## 🎨 **4. AST Generation - 5 minutes**

### **Concept:**
Converting the Concrete Syntax Tree (CST) into a simplified Abstract Syntax Tree (AST) that focuses on semantics rather than syntax.

### **Demo Code:**
```typescript
// ts/src/calc/ast.ts
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
      result = { 
        type: "BinaryExpr", 
        op, 
        left: result, 
        right: this.visit(ctx.term[i + 1]) 
      };
    }
    return result;
  }

  term(ctx: any): AstNode {
    if (ctx.factor && ctx.factor.length === 1) {
      return this.visit(ctx.factor[0]);
    }
    
    let result = this.visit(ctx.factor[0]);
    for (let i = 0; i < ctx.factor.length - 1; i++) {
      const op = ctx.Mult ? "*" : "/";
      result = { 
        type: "BinaryExpr", 
        op, 
        left: result, 
        right: this.visit(ctx.factor[i + 1]) 
      };
    }
    return result;
  }

  factor(ctx: any): AstNode {
    if (ctx.NumberLiteral) {
      return { type: "NumberLiteral", value: parseInt(ctx.NumberLiteral[0].image) };
    }
    if (ctx.expression) {
      return this.visit(ctx.expression[0]);
    }
    throw new Error("Invalid factor");
  }
}
```

### **Live Demo:**
1. Show AST JSON output for `3 + 5 * (10 - 4)`:
```json
{
  "type": "BinaryExpr",
  "op": "+",
  "left": { "type": "NumberLiteral", "value": 3 },
  "right": {
    "type": "BinaryExpr",
    "op": "*",
    "left": { "type": "NumberLiteral", "value": 5 },
    "right": {
      "type": "BinaryExpr",
      "op": "-",
      "left": { "type": "NumberLiteral", "value": 10 },
      "right": { "type": "NumberLiteral", "value": 4 }
    }
  }
}
```

2. Show the visual AST diagram (expand the collapsible section)

---

## 🖥️ **5. Web GUI Features - 8 minutes**

### **Interactive Features:**
1. **Real-time Processing**: Auto-runs on input change
2. **Mode Switching**: Calculator vs Simple parser
3. **Visual AST**: SVG-based tree diagram
4. **Error Handling**: Clear error messages
5. **Responsive Design**: Works on mobile

### **Key GUI Code:**
```typescript
// ts/web/main.ts - Main processing function
function run() {
  const input = document.getElementById('input') as HTMLTextAreaElement;
  const mode = (document.getElementById('mode') as HTMLSelectElement).value as 'calc' | 'simple';
  const text = input.value.trim();
  
  if (!text) {
    clearAll();
    return;
  }

  try {
    document.body.classList.add('loading');
    
    // Process based on mode
    if (mode === 'calc') {
      const tokens = tokenize(text);
      const cst = parseToCst(text);
      const ast = buildAstFromText(text);
      const result = evaluate(text);
      
      renderTokens(tokens);
      renderAst(ast);
      renderResult(result);
      renderAstSvg(ast);
    } else {
      // Simple parser logic
      const result = parseSimple(text);
      renderResult(result);
    }
    
    input.classList.remove('error');
    input.classList.add('success');
  } catch (error) {
    renderResult(`Error: ${error.message}`);
    input.classList.remove('success');
    input.classList.add('error');
  } finally {
    document.body.classList.remove('loading');
  }
}
```

### **Live Demo Sequence:**
1. **Calculator Mode:**
   - Enter: `2 * (3 + 4) - 1`
   - Show tokens, AST JSON, result, and visual diagram
   - Try error case: `2 + + 3`

2. **Simple Mode:**
   - Switch to Simple mode
   - Enter: `hello; 123; world;`
   - Show how it recognizes strings, numbers, and semicolons

3. **Interactive Features:**
   - Show auto-run (type and see immediate updates)
   - Show keyboard shortcut (Cmd+Enter)
   - Show responsive design (resize window)

---

## 🚀 **6. CLI Tools - 3 minutes**

### **Calculator CLI:**
```bash
cd ts
npm run calc
```

**Demo Input/Output:**
```
Enter an expression: 3 + 5 * (10 - 4)
Tokens: [NumberLiteral: 3, Plus: +, NumberLiteral: 5, ...]
Result: 33
```

### **Simple Parser CLI:**
```bash
npm run simple
```

**Demo Input/Output:**
```
Enter text: hello; 123; world;
Recognized: hello (string), 123 (number), world (string)
```

---

## 🎯 **7. Key Technical Concepts - 5 minutes**

### **Visitor Pattern:**
```typescript
// Multiple visitors for different purposes
class EvalVisitor extends (new CalcParser().getBaseCstVisitorConstructor()) {
  expression(ctx: any): number {
    // Returns numeric result
  }
}

class AstVisitor extends (new CalcParser().getBaseCstVisitorConstructor()) {
  expression(ctx: any): AstNode {
    // Returns AST node
  }
}
```

### **Error Recovery:**
- Lexical errors: Invalid characters
- Syntax errors: Malformed expressions
- Runtime errors: Division by zero
- Recovery: Graceful error handling with helpful messages

### **Modern Web Technologies:**
- **Vite**: Fast development server
- **TypeScript**: Type safety and modern JavaScript features
- **SVG**: Scalable vector graphics for AST visualization
- **CSS Custom Properties**: Consistent design system

---

## 📊 **8. Project Architecture - 3 minutes**

```
ts/
├── src/
│   ├── calc/           # Calculator parser
│   │   ├── lexer.ts    # Token definitions
│   │   ├── parser.ts   # Grammar rules
│   │   ├── ast.ts      # AST construction
│   │   ├── interpreter.ts # Expression evaluation
│   │   └── cli.ts      # Command-line interface
│   └── simple/         # Simple statement parser
│       ├── lexer.ts    # Token definitions
│       ├── parser.ts   # Grammar rules
│       └── cli.ts      # Command-line interface
├── web/
│   └── main.ts         # Web GUI logic
├── index.html          # Web interface
└── package.json        # Dependencies and scripts
```

---

## 🎪 **9. Live Demo Script**

### **Opening (1 minute):**
"Today I'll demonstrate a complete compiler frontend built in TypeScript. This project shows how modern programming languages process code from text to executable instructions."

### **Core Demo (15 minutes):**
1. **Start web GUI** (`npm run dev`)
2. **Show tokenization**: Enter `3 + 5 * (10 - 4)`, explain tokens
3. **Show parsing**: Explain grammar rules and precedence
4. **Show AST**: Display JSON and visual diagram
5. **Show evaluation**: Calculate result (33)
6. **Show error handling**: Try invalid input
7. **Switch modes**: Demonstrate Simple parser
8. **Show CLI tools**: Run both command-line interfaces

### **Technical Deep Dive (5 minutes):**
- Explain Visitor Pattern
- Show error recovery
- Discuss modern web technologies

### **Closing (2 minutes):**
"This demonstrates the fundamental building blocks of any compiler or interpreter. The same principles apply to languages like JavaScript, Python, or C++."

---

## 🛠️ **Setup Instructions for Demo**

### **Prerequisites:**
```bash
# Ensure Node.js is installed
node --version  # Should be v16+

# Navigate to project
cd ts

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Demo URLs:**
- **Web GUI**: http://localhost:5173
- **Calculator CLI**: `npm run calc`
- **Simple CLI**: `npm run simple`

---

## 💡 **Key Talking Points**

1. **Real-world Relevance**: These concepts power every programming language
2. **Modern Implementation**: TypeScript + Chevrotain vs traditional Flex/Bison
3. **Interactive Learning**: Visual feedback helps understand parsing
4. **Production Ready**: Error handling, recovery, and type safety
5. **Extensible**: Easy to add new operators, functions, or language features

---

## 🎯 **Success Metrics**

- ✅ **Functional**: All parsers work correctly
- ✅ **Visual**: Clear AST diagrams and token display
- ✅ **Interactive**: Real-time feedback and error handling
- ✅ **Educational**: Easy to understand and modify
- ✅ **Professional**: Clean code and modern web design

---

**Good luck with your presentation! 🚀**
