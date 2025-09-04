#!/usr/bin/env node
import readline from "readline";
import { parse } from "./parser";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("Enter statements (STRING | NUM | OTHER) separated by ';':");
rl.on("line", (line) => {
  try {
    const { tokens } = parse(line.trim());
    for (const t of tokens) {
      if (t.tokenType.name === "StringTok") {
        console.log(`Your entered a string - ${t.image}`);
      } else if (t.tokenType.name === "NumTok") {
        console.log(`The number you entered is - ${t.image}`);
      }
    }
  } catch (e: any) {
    console.error("Syntax Error:", e.message ?? String(e));
  } finally {
    rl.close();
  }
});


