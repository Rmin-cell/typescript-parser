#!/usr/bin/env node
import readline from "readline";
import { evaluate } from "./interpreter";
import { CalcLexer } from "./lexer";
import { parseToCst } from "./parser";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("Enter an arithmetic expression (e.g., 3 + 5 * (10 - 4)):");
rl.on("line", (line) => {
  try {
    const text = line.trim();

    console.log("Scanning tokens...");
    const lex = CalcLexer.tokenize(text);
    if (lex.errors && lex.errors.length) {
      console.error("Lexing error:", lex.errors[0].message);
      rl.close();
      return;
    }
    const tokenStr = lex.tokens.map((t: any) => `${t.tokenType.name}(${t.image})`).join(" ");
    console.log(tokenStr);

    console.log("Parsing to CST...");
    const { cst } = parseToCst(text);

    const printCst = (node: any, indent: string = "") => {
      console.log(`${indent}${node.name}`);
      const children = node.children || {};
      const keys = Object.keys(children);
      for (const key of keys) {
        const arr = children[key] as any[];
        for (const child of arr) {
          if (child && typeof child.image === "string") {
            console.log(`${indent}  ${key}: ${child.image}`);
          } else if (child && typeof child === "object" && child.name) {
            printCst(child, indent + "  ");
          }
        }
      }
    };
    printCst(cst as any);

    const result = evaluate(text);
    console.log(`Result: ${result}`);
  } catch (e: any) {
    console.error("Error:", e.message ?? String(e));
  } finally {
    rl.close();
  }
});


