import * as readline from 'readline';
import { compilerLexer } from './lexer';
import { parseProgram } from './parser';
import { SymbolTable } from './symbol-table';
import { IntermediateCodeGenerator } from './intermediate-code';
import { CpuCodeGenerator } from './cpu-code-gen';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printTokens(input: string): void {
  console.log('\n🔍 **TOKENS:**');
  console.log('='.repeat(50));
  
  const lexResult = compilerLexer.tokenize(input);
  
  if (lexResult.errors.length > 0) {
    console.log('❌ Lexical Errors:');
    lexResult.errors.forEach(error => {
      console.log(`  ${error.message} at line ${error.line}, column ${error.column}`);
    });
    return;
  }
  
  lexResult.tokens.forEach((token, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${token.tokenType.name.padEnd(15)} | "${token.image}"`);
  });
}

function printSymbolTable(symbolTable: SymbolTable): void {
  console.log('\n📋 **SYMBOL TABLE:**');
  console.log('='.repeat(50));
  
  const symbols = symbolTable.getAllSymbols();
  if (symbols.length === 0) {
    console.log('  (No symbols declared)');
    return;
  }
  
  symbols.forEach(symbol => {
    const type = symbol.isFunction ? 'function' : 'variable';
    const params = symbol.parameters ? `(${symbol.parameters.join(', ')})` : '';
    const address = symbol.address !== undefined ? ` @${symbol.address}` : '';
    console.log(`  ${symbol.name.padEnd(15)} | ${type.padEnd(8)} | ${symbol.type.padEnd(8)}${params}${address}`);
  });
}

function printThreeAddressCode(instructions: any[]): void {
  console.log('\n🔧 **THREE-ADDRESS CODE:**');
  console.log('='.repeat(50));
  
  if (instructions.length === 0) {
    console.log('  (No instructions generated)');
    return;
  }
  
  instructions.forEach((instruction, index) => {
    const line = `${(index + 1).toString().padStart(3)}. `;
    
    switch (instruction.type) {
      case 'ASSIGN':
        console.log(`${line}${instruction.target} = ${instruction.source}`);
        break;
      case 'ADD':
        console.log(`${line}${instruction.target} = ${instruction.left} + ${instruction.right}`);
        break;
      case 'SUB':
        console.log(`${line}${instruction.target} = ${instruction.left} - ${instruction.right}`);
        break;
      case 'MUL':
        console.log(`${line}${instruction.target} = ${instruction.left} * ${instruction.right}`);
        break;
      case 'DIV':
        console.log(`${line}${instruction.target} = ${instruction.left} / ${instruction.right}`);
        break;
      case 'MOD':
        console.log(`${line}${instruction.target} = ${instruction.left} % ${instruction.right}`);
        break;
      case 'EQ':
        console.log(`${line}${instruction.target} = ${instruction.left} == ${instruction.right}`);
        break;
      case 'NE':
        console.log(`${line}${instruction.target} = ${instruction.left} != ${instruction.right}`);
        break;
      case 'LT':
        console.log(`${line}${instruction.target} = ${instruction.left} < ${instruction.right}`);
        break;
      case 'GT':
        console.log(`${line}${instruction.target} = ${instruction.left} > ${instruction.right}`);
        break;
      case 'LE':
        console.log(`${line}${instruction.target} = ${instruction.left} <= ${instruction.right}`);
        break;
      case 'GE':
        console.log(`${line}${instruction.target} = ${instruction.left} >= ${instruction.right}`);
        break;
      case 'AND':
        console.log(`${line}${instruction.target} = ${instruction.left} && ${instruction.right}`);
        break;
      case 'OR':
        console.log(`${line}${instruction.target} = ${instruction.left} || ${instruction.right}`);
        break;
      case 'NOT':
        console.log(`${line}${instruction.target} = !${instruction.source}`);
        break;
      case 'NEG':
        console.log(`${line}${instruction.target} = -${instruction.source}`);
        break;
      case 'LABEL':
        console.log(`${line}${instruction.name}:`);
        break;
      case 'JUMP':
        console.log(`${line}goto ${instruction.target}`);
        break;
      case 'JUMP_IF_FALSE':
        console.log(`${line}if (!${instruction.condition}) goto ${instruction.target}`);
        break;
      case 'JUMP_IF_TRUE':
        console.log(`${line}if (${instruction.condition}) goto ${instruction.target}`);
        break;
      case 'CALL':
        console.log(`${line}${instruction.target} = call ${instruction.function}(${instruction.args.join(', ')})`);
        break;
      case 'RETURN':
        if (instruction.value) {
          console.log(`${line}return ${instruction.value}`);
        } else {
          console.log(`${line}return`);
        }
        break;
      case 'PRINT':
        console.log(`${line}print ${instruction.value}`);
        break;
      case 'FUNCTION_START':
        console.log(`${line}function ${instruction.name}(${instruction.params.join(', ')}) {`);
        break;
      case 'FUNCTION_END':
        console.log(`${line}}`);
        break;
      default:
        console.log(`${line}${instruction.type}`);
    }
  });
}

function printCpuCode(instructions: any[]): void {
  console.log('\n💻 **CPU CODE (Assembly-like):**');
  console.log('='.repeat(50));
  
  if (instructions.length === 0) {
    console.log('  (No CPU instructions generated)');
    return;
  }
  
  instructions.forEach((instruction, index) => {
    const line = `${(index + 1).toString().padStart(3)}. `;
    
    switch (instruction.type) {
      case 'LOAD':
        console.log(`${line}LOAD ${instruction.reg}, ${instruction.value}`);
        break;
      case 'STORE':
        console.log(`${line}STORE ${instruction.reg}, ${instruction.address}`);
        break;
      case 'ADD':
        console.log(`${line}ADD ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'SUB':
        console.log(`${line}SUB ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'MUL':
        console.log(`${line}MUL ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'DIV':
        console.log(`${line}DIV ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'MOD':
        console.log(`${line}MOD ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'CMP':
        console.log(`${line}CMP ${instruction.left}, ${instruction.right}`);
        break;
      case 'JE':
        console.log(`${line}JE ${instruction.target}`);
        break;
      case 'JNE':
        console.log(`${line}JNE ${instruction.target}`);
        break;
      case 'JL':
        console.log(`${line}JL ${instruction.target}`);
        break;
      case 'JG':
        console.log(`${line}JG ${instruction.target}`);
        break;
      case 'JLE':
        console.log(`${line}JLE ${instruction.target}`);
        break;
      case 'JGE':
        console.log(`${line}JGE ${instruction.target}`);
        break;
      case 'JMP':
        console.log(`${line}JMP ${instruction.target}`);
        break;
      case 'CALL':
        console.log(`${line}CALL ${instruction.target}`);
        break;
      case 'RET':
        console.log(`${line}RET`);
        break;
      case 'PUSH':
        console.log(`${line}PUSH ${instruction.value}`);
        break;
      case 'POP':
        console.log(`${line}POP ${instruction.reg}`);
        break;
      case 'PRINT':
        console.log(`${line}PRINT ${instruction.reg}`);
        break;
      case 'LABEL':
        console.log(`${line}${instruction.name}:`);
        break;
      case 'FUNCTION_START':
        console.log(`${line}${instruction.name}:`);
        break;
      case 'FUNCTION_END':
        console.log(`${line}RET`);
        break;
      default:
        console.log(`${line}${instruction.type}`);
    }
  });
}

function compileProgram(input: string): void {
  console.log('\n🚀 **COMPILING PROGRAM:**');
  console.log('='.repeat(50));
  console.log(input);
  
  try {
    // 1. Lexical Analysis
    printTokens(input);
    
    // 2. Syntax Analysis
    console.log('\n🌳 **PARSING:**');
    console.log('='.repeat(50));
    
    const parseResult = parseProgram(input);
    
    if (parseResult.errors.length > 0) {
      console.log('❌ Parse Errors:');
      parseResult.errors.forEach(error => {
        console.log(`  ${error.message}`);
      });
      return;
    }
    
    console.log('✅ Parsing successful!');
    
    // 3. Symbol Table Construction
    const symbolTable = new SymbolTable();
    
    // 4. Intermediate Code Generation
    const intermediateGen = new IntermediateCodeGenerator(symbolTable);
    const threeAddressCode = intermediateGen.generate(parseResult.cst);
    
    printSymbolTable(symbolTable);
    printThreeAddressCode(threeAddressCode);
    
    // 5. CPU Code Generation
    const cpuGen = new CpuCodeGenerator(symbolTable);
    const cpuCode = cpuGen.generate(threeAddressCode);
    
    printCpuCode(cpuCode);
    
    console.log('\n✅ **COMPILATION COMPLETE!**');
    
  } catch (error: any) {
    console.log(`\n❌ **COMPILATION ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
}

function showExamples(): void {
  console.log('\n📚 **EXAMPLE PROGRAMS:**');
  console.log('='.repeat(50));
  
  const examples = [
    {
      name: "Simple Calculator",
      code: `let x = 10
let y = 5
let result = x + y * 2
print result`
    },
    {
      name: "Conditional Logic",
      code: `let age = 18
if (age >= 18) {
    print "Adult"
} else {
    print "Minor"
}`
    },
    {
      name: "Loop Example",
      code: `let i = 0
while (i < 5) {
    print i
    i = i + 1
}`
    },
    {
      name: "Function Definition",
      code: `function add(a, b) {
    return a + b
}
let sum = add(3, 4)
print sum`
    }
  ];
  
  examples.forEach((example, index) => {
    console.log(`\n${index + 1}. **${example.name}:**`);
    console.log('```');
    console.log(example.code);
    console.log('```');
  });
}

function main(): void {
  console.log('🎯 **ENHANCED COMPILER CLI**');
  console.log('='.repeat(50));
  console.log('Enter multiline programs to compile them step by step!');
  console.log('Commands:');
  console.log('  - Type your program and press Enter twice to compile');
  console.log('  - Type "examples" to see example programs');
  console.log('  - Type "quit" to exit');
  console.log('='.repeat(50));
  
  let inputBuffer = '';
  
  rl.on('line', (line) => {
    if (line.trim() === 'quit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      return;
    }
    
    if (line.trim() === 'examples') {
      showExamples();
      return;
    }
    
    if (line.trim() === '') {
      if (inputBuffer.trim()) {
        compileProgram(inputBuffer.trim());
        inputBuffer = '';
      }
    } else {
      inputBuffer += line + '\n';
    }
  });
  
  rl.on('close', () => {
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}
