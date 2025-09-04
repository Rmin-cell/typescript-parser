import { CalcLexer } from "../src/calc/lexer";
import { buildAstFromText as buildCalcAst } from "../src/calc/ast";
import { evaluate as evalCalc } from "../src/calc/interpreter";
import { SimpleLexer } from "../src/simple/lexer";
import { parse as parseSimple } from "../src/simple/parser";

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

function renderTokens(text: string, mode: "calc" | "simple"): string {
  const res = mode === "calc" ? CalcLexer.tokenize(text) : SimpleLexer.tokenize(text);
  if (res.errors && res.errors.length) return "Lexing error: " + res.errors[0].message;
  return res.tokens.map((t: any) => `${t.tokenType.name}(${t.image})`).join("\n");
}

function renderAst(text: string, mode: "calc" | "simple"): string {
  try {
    if (mode === "calc") {
      const ast = buildCalcAst(text);
      return JSON.stringify(ast, null, 2);
    }
    return "(No AST for simple mode)";
  } catch (e: any) {
    return "AST error: " + (e?.message ?? String(e));
  }
}

function renderResult(text: string, mode: "calc" | "simple"): string {
  try {
    if (mode === "calc") return String(evalCalc(text));
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

function run() {
  const text = input.value.trim();
  const mode = (modeSel.value as "calc" | "simple");
  tokens.textContent = renderTokens(text, mode);
  ast.textContent = renderAst(text, mode);
  result.textContent = renderResult(text, mode);
  // Only render diagram if panel is open
  if (astDetails.open) renderAstSvg(text, mode);
}

runBtn.addEventListener("click", run);
modeSel.addEventListener("change", () => {
  if (modeSel.value === "calc") input.value = "3 + 5 * (10 - 4)";
  else input.value = "hello; 123; x";
  run();
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

function renderAstSvg(text: string, mode: "calc" | "simple") {
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
astDetails.addEventListener("toggle", () => {
  if (astDetails.open) renderAstSvg(input.value.trim(), modeSel.value as any);
});


