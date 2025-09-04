import { CalcLexer } from "../src/calc/lexer";
import { parseToCst } from "../src/calc/parser";
import { buildAstFromText } from "../src/calc/ast";
import { evaluate } from "../src/calc/interpreter";

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

function renderTokens(text: string): string {
  const res = CalcLexer.tokenize(text);
  if (res.errors && res.errors.length) {
    return "Lexing error: " + res.errors[0].message;
  }
  return res.tokens.map((t: any) => `${t.tokenType.name}(${t.image})`).join("\n");
}

function renderCst(text: string): string {
  try {
    const { cst } = parseToCst(text);
    return safeStringify(cst);
  } catch (e: any) {
    return "Parse error: " + (e?.message ?? String(e));
  }
}

function renderAst(text: string): string {
  try {
    const ast = buildAstFromText(text);
    return JSON.stringify(ast, null, 2);
  } catch (e: any) {
    return "AST error: " + (e?.message ?? String(e));
  }
}

function renderResult(text: string): string {
  try {
    return String(evaluate(text));
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

function run() {
  const text = input.value.trim();
  tokens.textContent = renderTokens(text);
  cst.textContent = renderCst(text);
  ast.textContent = renderAst(text);
  result.textContent = renderResult(text);
}

runBtn.addEventListener("click", run);
input.value = "3 + 5 * (10 - 4)";
run();


