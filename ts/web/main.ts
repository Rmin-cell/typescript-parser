import { CalcLexer } from "../src/calc/lexer";
import { parseToCst as parseCalc } from "../src/calc/parser";
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

function renderCst(text: string, mode: "calc" | "simple"): string {
  try {
    const { cst } = mode === "calc" ? parseCalc(text) : parseSimple(text);
    return safeStringify(cst);
  } catch (e: any) {
    return "Parse error: " + (e?.message ?? String(e));
  }
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
const cst = document.getElementById("cst") as HTMLPreElement;
const ast = document.getElementById("ast") as HTMLPreElement;
const result = document.getElementById("result") as HTMLPreElement;
const runBtn = document.getElementById("run") as HTMLButtonElement;
const modeSel = document.getElementById("mode") as HTMLSelectElement;

function run() {
  const text = input.value.trim();
  const mode = (modeSel.value as "calc" | "simple");
  tokens.textContent = renderTokens(text, mode);
  cst.textContent = renderCst(text, mode);
  ast.textContent = renderAst(text, mode);
  result.textContent = renderResult(text, mode);
}

runBtn.addEventListener("click", run);
modeSel.addEventListener("change", () => {
  if (modeSel.value === "calc") input.value = "3 + 5 * (10 - 4)";
  else input.value = "hello; 123; x";
  run();
});
input.value = "3 + 5 * (10 - 4)";
run();


