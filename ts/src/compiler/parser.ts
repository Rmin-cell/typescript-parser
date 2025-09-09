import { CstParser, CstNode } from "chevrotain";
import { 
  allTokens,
  compilerLexer,
  Let, If, Else, While, Function, Return, Print,
  NumberLiteral, StringLiteral, BooleanLiteral, Identifier,
  Plus, Minus, Mult, Div, Mod, Assign,
  Equal, NotEqual, Less, Greater, LessEqual, GreaterEqual, And, Or, Not,
  LParen, RParen, LBrace, RBrace, Semicolon, Comma
} from "./lexer";

export class CompilerParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: true });
    this.performSelfAnalysis();
  }

  // Program: sequence of statements
  public program = this.RULE("program", () => {
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
  });

  // Statement: various types of statements
  private statement = this.RULE("statement", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.variableDeclaration) },
      { ALT: () => this.SUBRULE(this.assignment) },
      { ALT: () => this.SUBRULE(this.ifStatement) },
      { ALT: () => this.SUBRULE(this.whileStatement) },
      { ALT: () => this.SUBRULE(this.functionDeclaration) },
      { ALT: () => this.SUBRULE(this.returnStatement) },
      { ALT: () => this.SUBRULE(this.printStatement) },
      { ALT: () => this.SUBRULE(this.expressionStatement) }
    ]);
    this.OPTION(() => this.CONSUME(Semicolon));
  });

  // Variable declaration: let identifier = expression
  private variableDeclaration = this.RULE("variableDeclaration", () => {
    this.CONSUME(Let);
    this.CONSUME(Identifier);
    this.CONSUME(Assign);
    this.SUBRULE(this.expression);
  });

  // Assignment: identifier = expression
  private assignment = this.RULE("assignment", () => {
    this.CONSUME(Identifier);
    this.CONSUME(Assign);
    this.SUBRULE(this.expression);
  });

  // If statement: if (expression) { statements } else { statements }
  private ifStatement = this.RULE("ifStatement", () => {
    this.CONSUME(If);
    this.CONSUME(LParen);
    this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    this.CONSUME(LBrace);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(RBrace);
    this.OPTION(() => {
      this.CONSUME(Else);
      this.CONSUME2(LBrace);
      this.MANY2(() => this.SUBRULE2(this.statement));
      this.CONSUME2(RBrace);
    });
  });

  // While statement: while (expression) { statements }
  private whileStatement = this.RULE("whileStatement", () => {
    this.CONSUME(While);
    this.CONSUME(LParen);
    this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    this.CONSUME(LBrace);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(RBrace);
  });

  // Function declaration: function identifier(params) { statements }
  private functionDeclaration = this.RULE("functionDeclaration", () => {
    this.CONSUME(Function);
    this.CONSUME(Identifier);
    this.CONSUME(LParen);
    this.OPTION(() => {
      this.SUBRULE(this.parameterList);
    });
    this.CONSUME(RParen);
    this.CONSUME(LBrace);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(RBrace);
  });

  // Parameter list: identifier, identifier, ...
  private parameterList = this.RULE("parameterList", () => {
    this.CONSUME(Identifier);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.CONSUME2(Identifier);
    });
  });

  // Return statement: return expression
  private returnStatement = this.RULE("returnStatement", () => {
    this.CONSUME(Return);
    this.OPTION(() => this.SUBRULE(this.expression));
  });

  // Print statement: print expression
  private printStatement = this.RULE("printStatement", () => {
    this.CONSUME(Print);
    this.SUBRULE(this.expression);
  });

  // Expression statement: expression
  private expressionStatement = this.RULE("expressionStatement", () => {
    this.SUBRULE(this.expression);
  });

  // Expression: logical OR
  private expression = this.RULE("expression", () => {
    this.SUBRULE(this.logicalOr);
  });

  // Logical OR: logicalAnd || logicalAnd
  private logicalOr = this.RULE("logicalOr", () => {
    this.SUBRULE(this.logicalAnd);
    this.MANY(() => {
      this.CONSUME(Or);
      this.SUBRULE2(this.logicalAnd);
    });
  });

  // Logical AND: equality && equality
  private logicalAnd = this.RULE("logicalAnd", () => {
    this.SUBRULE(this.equality);
    this.MANY(() => {
      this.CONSUME(And);
      this.SUBRULE2(this.equality);
    });
  });

  // Equality: comparison == comparison, comparison != comparison
  private equality = this.RULE("equality", () => {
    this.SUBRULE(this.comparison);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Equal) },
        { ALT: () => this.CONSUME(NotEqual) }
      ]);
      this.SUBRULE2(this.comparison);
    });
  });

  // Comparison: term < term, term > term, term <= term, term >= term
  private comparison = this.RULE("comparison", () => {
    this.SUBRULE(this.term);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Less) },
        { ALT: () => this.CONSUME(Greater) },
        { ALT: () => this.CONSUME(LessEqual) },
        { ALT: () => this.CONSUME(GreaterEqual) }
      ]);
      this.SUBRULE2(this.term);
    });
  });

  // Term: factor + factor, factor - factor
  private term = this.RULE("term", () => {
    this.SUBRULE(this.factor);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Plus) },
        { ALT: () => this.CONSUME(Minus) }
      ]);
      this.SUBRULE2(this.factor);
    });
  });

  // Factor: unary * unary, unary / unary, unary % unary
  private factor = this.RULE("factor", () => {
    this.SUBRULE(this.unary);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Mult) },
        { ALT: () => this.CONSUME(Div) },
        { ALT: () => this.CONSUME(Mod) }
      ]);
      this.SUBRULE2(this.unary);
    });
  });

  // Unary: !unary, -unary, primary
  private unary = this.RULE("unary", () => {
    this.OR([
      { ALT: () => {
        this.CONSUME(Not);
        this.SUBRULE2(this.unary);
      }},
      { ALT: () => {
        this.CONSUME(Minus);
        this.SUBRULE3(this.unary);
      }},
      { ALT: () => this.SUBRULE(this.primary) }
    ]);
  });

  // Primary: literals, identifiers, function calls, parenthesized expressions
  private primary = this.RULE("primary", () => {
    this.OR([
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(BooleanLiteral) },
      { ALT: () => this.SUBRULE(this.functionCall) },
      { ALT: () => this.CONSUME(Identifier) },
      { ALT: () => {
        this.CONSUME(LParen);
        this.SUBRULE(this.expression);
        this.CONSUME(RParen);
      }}
    ]);
  });

  // Function call: identifier(arguments)
  private functionCall = this.RULE("functionCall", () => {
    this.CONSUME(Identifier);
    this.CONSUME(LParen);
    this.OPTION(() => {
      this.SUBRULE(this.argumentList);
    });
    this.CONSUME(RParen);
  });

  // Argument list: expression, expression, ...
  private argumentList = this.RULE("argumentList", () => {
    this.SUBRULE(this.expression);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE2(this.expression);
    });
  });
}

export function parseProgram(input: string): { cst: CstNode; errors: any[] } {
  const parser = new CompilerParser();
  const lexResult = compilerLexer.tokenize(input);
  
  parser.input = lexResult.tokens;
  const cst = parser.program();
  
  return {
    cst,
    errors: [...lexResult.errors, ...parser.errors]
  };
}
