import { CalcLexer } from "../src/calc/lexer";
import { buildAstFromText as buildCalcAst } from "../src/calc/ast";
import { evaluate as evalCalc } from "../src/calc/interpreter";
import { SimpleLexer } from "../src/simple/lexer";
import { parse as parseSimple } from "../src/simple/parser";
import { compilerLexer } from "../src/compiler/lexer";
import { parseProgram } from "../src/compiler/parser";
import { SymbolTable } from "../src/compiler/symbol-table";
import { IntermediateCodeGenerator } from "../src/compiler/intermediate-code";
import { CpuCodeGenerator } from "../src/compiler/cpu-code-gen";

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (k, v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      const out: Record<string, any> = {};
      for (const key of Object.keys(v)) {
        const val = (v as any)[key];
        if (key === "children" || key === "name" || key === "image" || key === "tokenType") out[key] = val;
      }
      return out;
    }
    return v;
  }, 2);
}

function renderTokens(text: string, mode: "calc" | "simple" | "compiler"): string {
  let res;
  if (mode === "calc") {
    res = CalcLexer.tokenize(text);
  } else if (mode === "simple") {
    res = SimpleLexer.tokenize(text);
  } else {
    res = compilerLexer.tokenize(text);
  }
  
  if (res.errors && res.errors.length) return "Lexing error: " + res.errors[0].message;
  return res.tokens.map((t: any) => `${t.tokenType.name}(${t.image})`).join("\n");
}

function renderAst(text: string, mode: "calc" | "simple" | "compiler"): string {
  try {
    if (mode === "calc") {
      const ast = buildCalcAst(text);
      return JSON.stringify(ast, null, 2);
    } else if (mode === "compiler") {
      const parseResult = parseProgram(text);
      if (parseResult.errors.length > 0) {
        return "Parse errors:\n" + parseResult.errors.map(e => e.message).join("\n");
      }
      return JSON.stringify(parseResult.cst, null, 2);
    }
    return "(No AST for simple mode)";
  } catch (e: any) {
    return "AST error: " + (e?.message ?? String(e));
  }
}

function renderResult(text: string, mode: "calc" | "simple" | "compiler"): string {
  try {
    if (mode === "calc") return String(evalCalc(text));
    if (mode === "compiler") {
      const parseResult = parseProgram(text);
      if (parseResult.errors.length > 0) {
        return "Compilation failed:\n" + parseResult.errors.map(e => e.message).join("\n");
      }
      return "✅ Compilation successful!";
    }
    // For simple, mirror CLI behavior: print recognized strings/numbers
    const { tokens } = parseSimple(text);
    const lines: string[] = [];
    for (const t of tokens as any[]) {
      if (t.tokenType && t.tokenType.name === "StringTok") lines.push(`Your entered a string - ${t.image}`);
      else if (t.tokenType && t.tokenType.name === "NumTok") lines.push(`The number you entered is - ${t.image}`);
    }
    return lines.join("\n");
  } catch (e: any) {
    return "Eval error: " + (e?.message ?? String(e));
  }
}

const input = document.getElementById("input") as HTMLTextAreaElement;
const tokens = document.getElementById("tokens") as HTMLPreElement;
const ast = document.getElementById("ast") as HTMLPreElement;
const result = document.getElementById("result") as HTMLPreElement;
const runBtn = document.getElementById("run") as HTMLButtonElement;
const modeSel = document.getElementById("mode") as HTMLSelectElement;
const svg = document.getElementById("ast-svg") as SVGSVGElement;
const astDetails = document.getElementById("ast-details") as HTMLDetailsElement;
const astDiagramDetails = document.getElementById("ast-diagram-details") as HTMLDetailsElement;

// Compiler-specific elements
const compilerPanels = document.getElementById("compiler-panels") as HTMLDivElement;
const symbolTable = document.getElementById("symbol-table") as HTMLPreElement;
const threeAddress = document.getElementById("three-address") as HTMLPreElement;
const cpuCode = document.getElementById("cpu-code") as HTMLPreElement;

function run() {
  const text = input.value.trim();
  const mode = (modeSel.value as "calc" | "simple" | "compiler");
  
  // Show/hide compiler panels based on mode
  if (mode === "compiler") {
    compilerPanels.style.display = "block";
  } else {
    compilerPanels.style.display = "none";
  }
  
  // Add loading state
  document.body.classList.add('loading');
  
  // Clear previous error states
  input.classList.remove('error', 'success');
  
  try {
    tokens.textContent = renderTokens(text, mode);
    ast.textContent = renderAst(text, mode);
    result.textContent = renderResult(text, mode);
    
    // Compiler-specific rendering
    if (mode === "compiler") {
      renderCompilerOutput(text);
    }
    
    // Add success state
    input.classList.add('success');
    
    // Only render diagram if panel is open
    if (astDiagramDetails.open) renderAstSvg(text, mode);
  } catch (error) {
    // Add error state
    input.classList.add('error');
  } finally {
    // Remove loading state
    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 300);
  }
}

runBtn.addEventListener("click", run);

// Add keyboard shortcut (Ctrl+Enter or Cmd+Enter)
input.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    run();
  }
});

function renderCompilerOutput(text: string): void {
  try {
    const parseResult = parseProgram(text);
    if (parseResult.errors.length > 0) {
      symbolTable.textContent = "Parse errors - no symbol table generated";
      threeAddress.textContent = "Parse errors - no intermediate code generated";
      cpuCode.textContent = "Parse errors - no CPU code generated";
      return;
    }
    
    // Generate symbol table
    const symTable = new SymbolTable();
    const symbols = symTable.getAllSymbols();
    if (symbols.length === 0) {
      symbolTable.textContent = "(No symbols declared)";
    } else {
      symbolTable.textContent = symbols.map(s => 
        `${s.name.padEnd(15)} | ${(s.isFunction ? 'function' : 'variable').padEnd(8)} | ${s.type.padEnd(8)}${s.parameters ? `(${s.parameters.join(', ')})` : ''}${s.address !== undefined ? ` @${s.address}` : ''}`
      ).join('\n');
    }
    
    // Generate intermediate code
    const intermediateGen = new IntermediateCodeGenerator(symTable);
    const threeAddressCode = intermediateGen.generate(parseResult.cst);
    if (threeAddressCode.length === 0) {
      threeAddress.textContent = "(No instructions generated)";
    } else {
      threeAddress.textContent = threeAddressCode.map((instruction, index) => {
        const line = `${(index + 1).toString().padStart(3)}. `;
        switch (instruction.type) {
          case 'ASSIGN': return `${line}${instruction.target} = ${instruction.source}`;
          case 'ADD': return `${line}${instruction.target} = ${instruction.left} + ${instruction.right}`;
          case 'SUB': return `${line}${instruction.target} = ${instruction.left} - ${instruction.right}`;
          case 'MUL': return `${line}${instruction.target} = ${instruction.left} * ${instruction.right}`;
          case 'DIV': return `${line}${instruction.target} = ${instruction.left} / ${instruction.right}`;
          case 'MOD': return `${line}${instruction.target} = ${instruction.left} % ${instruction.right}`;
          case 'EQ': return `${line}${instruction.target} = ${instruction.left} == ${instruction.right}`;
          case 'NE': return `${line}${instruction.target} = ${instruction.left} != ${instruction.right}`;
          case 'LT': return `${line}${instruction.target} = ${instruction.left} < ${instruction.right}`;
          case 'GT': return `${line}${instruction.target} = ${instruction.left} > ${instruction.right}`;
          case 'LE': return `${line}${instruction.target} = ${instruction.left} <= ${instruction.right}`;
          case 'GE': return `${line}${instruction.target} = ${instruction.left} >= ${instruction.right}`;
          case 'AND': return `${line}${instruction.target} = ${instruction.left} && ${instruction.right}`;
          case 'OR': return `${line}${instruction.target} = ${instruction.left} || ${instruction.right}`;
          case 'NOT': return `${line}${instruction.target} = !${instruction.source}`;
          case 'NEG': return `${line}${instruction.target} = -${instruction.source}`;
          case 'LABEL': return `${line}${instruction.name}:`;
          case 'JUMP': return `${line}goto ${instruction.target}`;
          case 'JUMP_IF_FALSE': return `${line}if (!${instruction.condition}) goto ${instruction.target}`;
          case 'JUMP_IF_TRUE': return `${line}if (${instruction.condition}) goto ${instruction.target}`;
          case 'CALL': return `${line}${instruction.target} = call ${instruction.function}(${instruction.args.join(', ')})`;
          case 'RETURN': return instruction.value ? `${line}return ${instruction.value}` : `${line}return`;
          case 'PRINT': return `${line}print ${instruction.value}`;
          case 'FUNCTION_START': return `${line}function ${instruction.name}(${instruction.params.join(', ')}) {`;
          case 'FUNCTION_END': return `${line}}`;
          default: return `${line}${instruction.type}`;
        }
      }).join('\n');
    }
    
    // Generate CPU code
    const cpuGen = new CpuCodeGenerator(symTable);
    const cpuInstructions = cpuGen.generate(threeAddressCode);
    if (cpuInstructions.length === 0) {
      cpuCode.textContent = "(No CPU instructions generated)";
    } else {
      cpuCode.textContent = cpuInstructions.map((instruction, index) => {
        const line = `${(index + 1).toString().padStart(3)}. `;
        switch (instruction.type) {
          case 'LOAD': return `${line}LOAD ${instruction.reg}, ${instruction.value}`;
          case 'STORE': return `${line}STORE ${instruction.reg}, ${instruction.address}`;
          case 'ADD': return `${line}ADD ${instruction.reg}, ${instruction.left}, ${instruction.right}`;
          case 'SUB': return `${line}SUB ${instruction.reg}, ${instruction.left}, ${instruction.right}`;
          case 'MUL': return `${line}MUL ${instruction.reg}, ${instruction.left}, ${instruction.right}`;
          case 'DIV': return `${line}DIV ${instruction.reg}, ${instruction.left}, ${instruction.right}`;
          case 'MOD': return `${line}MOD ${instruction.reg}, ${instruction.left}, ${instruction.right}`;
          case 'CMP': return `${line}CMP ${instruction.left}, ${instruction.right}`;
          case 'JE': return `${line}JE ${instruction.target}`;
          case 'JNE': return `${line}JNE ${instruction.target}`;
          case 'JL': return `${line}JL ${instruction.target}`;
          case 'JG': return `${line}JG ${instruction.target}`;
          case 'JLE': return `${line}JLE ${instruction.target}`;
          case 'JGE': return `${line}JGE ${instruction.target}`;
          case 'JMP': return `${line}JMP ${instruction.target}`;
          case 'CALL': return `${line}CALL ${instruction.target}`;
          case 'RET': return `${line}RET`;
          case 'PUSH': return `${line}PUSH ${instruction.value}`;
          case 'POP': return `${line}POP ${instruction.reg}`;
          case 'PRINT': return `${line}PRINT ${instruction.reg}`;
          case 'LABEL': return `${line}${instruction.name}:`;
          case 'FUNCTION_START': return `${line}${instruction.name}:`;
          case 'FUNCTION_END': return `${line}RET`;
          default: return `${line}${instruction.type}`;
        }
      }).join('\n');
    }
  } catch (error: any) {
    symbolTable.textContent = `Error: ${error.message}`;
    threeAddress.textContent = `Error: ${error.message}`;
    cpuCode.textContent = `Error: ${error.message}`;
  }
}

modeSel.addEventListener("change", () => {
  if (modeSel.value === "calc") input.value = "3 + 5 * (10 - 4)";
  else if (modeSel.value === "simple") input.value = "hello; 123; x";
  else if (modeSel.value === "compiler") input.value = "let x = 10\nlet y = 5\nlet result = x + y * 2\nprint result";
  run();
});

// Auto-run on input change (debounced)
let timeoutId: number;
input.addEventListener("input", () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (input.value.trim()) {
      run();
    }
  }, 500);
});

input.value = "3 + 5 * (10 - 4)";
run();

// --- Simple AST SVG renderer ---
type AstNode = { type: string; value?: any; left?: AstNode; right?: AstNode };

function clearSvg() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function drawNode(x: number, y: number, label: string) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", String(x - 32));
  rect.setAttribute("y", String(y - 16));
  rect.setAttribute("width", "64");
  rect.setAttribute("height", "32");
  rect.setAttribute("rx", "8");
  rect.setAttribute("fill", "#ffffff");
  rect.setAttribute("stroke", "#cbd5e1");
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(x));
  text.setAttribute("y", String(y + 5));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "12");
  text.setAttribute("fill", "#0f172a");
  text.textContent = label;
  g.appendChild(rect);
  g.appendChild(text);
  svg.appendChild(g);
}

function drawEdge(x1: number, y1: number, x2: number, y2: number) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(x1));
  line.setAttribute("y1", String(y1));
  line.setAttribute("x2", String(x2));
  line.setAttribute("y2", String(y2));
  line.setAttribute("stroke", "#94a3b8");
  svg.appendChild(line);
}

function layoutAndDraw(node: AstNode | undefined, x: number, y: number, spread: number) {
  if (!node) return;
  const label = node.type === "NumberLiteral" ? String(node.value) :
                node.type === "UnaryMinus" ? "-" :
                (node as any).op ?? node.type;
  drawNode(x, y, label);
  if (node.type === "UnaryMinus") {
    const cx = x;
    const cy = y + 80;
    drawEdge(x, y + 16, cx, cy - 16);
    layoutAndDraw(node.value, cx, cy, Math.max(40, spread / 2));
  } else if (node.type === "BinaryExpr") {
    const lx = x - spread;
    const rx = x + spread;
    const cy = y + 80;
    drawEdge(x, y + 16, lx, cy - 16);
    drawEdge(x, y + 16, rx, cy - 16);
    layoutAndDraw(node.left, lx, cy, Math.max(40, spread / 2));
    layoutAndDraw(node.right, rx, cy, Math.max(40, spread / 2));
  }
}

function renderAstSvg(text: string, mode: "calc" | "simple" | "compiler") {
  clearSvg();
  if (mode !== "calc") return; // diagram only for calculator AST
  try {
    const ast = buildCalcAst(text) as AstNode;
    const width = svg.viewBox.baseVal.width || 1100;
    layoutAndDraw(ast, width / 2, 40, Math.min(300, width / 4));
  } catch {
    // ignore drawing on parse errors
  }
}

// Re-render when AST details toggled
astDiagramDetails.addEventListener("toggle", () => {
  if (astDiagramDetails.open) renderAstSvg(input.value.trim(), modeSel.value as any);
});


