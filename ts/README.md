# 🚀 TypeScript Compiler Project

A comprehensive educational compiler implementation built with TypeScript, featuring lexical analysis, parsing, intermediate code generation, and visualization tools.

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Language Syntax](#-language-syntax)
- [Code Examples](#-code-examples)
- [Web Interface](#-web-interface)
- [Architecture](#-architecture)
- [Known Limitations](#-known-limitations)

## ✨ Features

- **Lexical Analysis**: Tokenization with Flex-like regex patterns
- **Syntax Analysis**: Parser with Chevrotain (Bison-like)
- **Abstract Syntax Tree (AST)**: Visual tree representation
- **Intermediate Code Generation**: Three-address code
- **CPU Code Generation**: Assembly-like instructions
- **Control Flow Graph (CFG)**: Visual program flow representation
- **Register Allocation**: Graph coloring algorithm with visualization
- **Symbol Table**: Variable and function management
- **Web Interface**: Interactive GUI with real-time compilation
- **Multiple Modes**: Calculator, Simple Parser, Full Compiler

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
cd ts
npm install
```

### Running the Project
```bash
# Development server (web interface)
npm run dev

# CLI calculator
npm run calc

# CLI simple parser
npm run simple

# CLI compiler
npm run compiler

# Build for production
npm run build
```

## 📝 Language Syntax

### Supported Data Types
- **Numbers**: `42`, `3.14`, `-10`
- **Strings**: `"hello"`, `"world"`
- **Booleans**: `true`, `false`

### Keywords
- `let` - Variable declaration
- `if` / `else` - Conditional statements
- `while` - Loop statements
- `function` - Function declaration
- `return` - Return statement
- `print` - Output statement

### Operators

#### Arithmetic
- `+` (addition)
- `-` (subtraction)
- `*` (multiplication)
- `/` (division)
- `%` (modulo)

#### Comparison
- `==` (equal)
- `!=` (not equal)
- `<` (less than)
- `>` (greater than)
- `<=` (less than or equal)
- `>=` (greater than or equal)

#### Logical
- `&&` (and)
- `||` (or)
- `!` (not)

## 💻 Code Examples

### 1. Basic Arithmetic
```javascript
let x = 10
let y = 5
let result = x + y * 2
print result
```
**Expected Output**: `20`

### 2. Conditional Statements
```javascript
let age = 18
if (age >= 18) {
    print "You are an adult"
} else {
    print "You are a minor"
}
```
**Expected Output**: `You are an adult`

### 3. Loops
```javascript
let counter = 0
while (counter < 5) {
    print counter
    counter = counter + 1
}
```
**Expected Output**: 
```
0
1
2
3
4
```

### 4. Functions
```javascript
function add(a, b) {
    return a + b
}

let sum = add(10, 20)
print sum
```
**Expected Output**: `30`

### 5. Complex Expressions
```javascript
let a = 10
let b = 5
let c = 2

let result = (a + b) * c - 10
print result

if (result > 20) {
    print "Result is greater than 20"
} else {
    print "Result is 20 or less"
}
```
**Expected Output**: 
```
20
Result is 20 or less
```

### 6. String Operations
```javascript
let name = "Alice"
let greeting = "Hello, " + name + "!"
print greeting

if (name == "Alice") {
    print "Welcome back, Alice!"
}
```
**Expected Output**: 
```
Hello, Alice!
Welcome back, Alice!
```

### 7. Boolean Logic
```javascript
let isStudent = true
let hasID = false
let canEnter = isStudent && hasID

if (canEnter) {
    print "Access granted"
} else {
    print "Access denied"
}
```
**Expected Output**: `Access denied`

### 8. Nested Control Flow
```javascript
let score = 85

if (score >= 90) {
    print "Grade: A"
} else {
    if (score >= 80) {
        print "Grade: B"
    } else {
        if (score >= 70) {
            print "Grade: C"
        } else {
            print "Grade: F"
        }
    }
}
```
**Expected Output**: `Grade: B`

### 9. Function with Multiple Parameters
```javascript
function calculate(a, b, operation) {
    if (operation == "add") {
        return a + b
    } else {
        if (operation == "multiply") {
            return a * b
        } else {
            return 0
        }
    }
}

let result1 = calculate(5, 3, "add")
let result2 = calculate(5, 3, "multiply")
print result1
print result2
```
**Expected Output**: 
```
8
15
```

### 10. Complex Program with All Features
```javascript
function factorial(n) {
    if (n <= 1) {
        return 1
    } else {
        return n * factorial(n - 1)
    }
}

function isEven(num) {
    return num % 2 == 0
}

let number = 5
let fact = factorial(number)
print "Factorial of " + number + " is " + fact

if (isEven(number)) {
    print number + " is even"
} else {
    print number + " is odd"
}

let i = 1
while (i <= 3) {
    print "Iteration " + i
    i = i + 1
}
```
**Expected Output**: 
```
Factorial of 5 is 120
5 is odd
Iteration 1
Iteration 2
Iteration 3
```

## 🌐 Web Interface

The project includes a modern web interface accessible at `http://localhost:5173` with:

- **Mode Selector**: Switch between Calculator, Simple Parser, and Compiler
- **Code Editor**: Input area for your programs
- **Real-time Compilation**: Instant feedback on your code
- **Visualizations**:
  - **Tokens**: Lexical analysis results
  - **AST (JSON)**: Abstract syntax tree structure
  - **AST Diagram**: Visual tree representation
  - **Symbol Table**: Variables and functions
  - **Three-Address Code**: Intermediate representation
  - **CPU Code**: Assembly-like instructions
  - **Control Flow Graph**: Program flow visualization
  - **Register Allocation**: Graph coloring visualization

## 🏗️ Architecture

### Compiler Pipeline
```
Source Code → Lexer → Parser → AST → Intermediate Code → CPU Code
     ↓           ↓        ↓      ↓           ↓              ↓
   Input    Tokens   CST/AST  Symbol   3-Address      Assembly
                        Table    Code      Code
```

### Key Components

- **`lexer.ts`**: Token definitions and lexical analysis
- **`parser.ts`**: Grammar rules and syntax analysis
- **`interpreter.ts`**: Runtime execution engine
- **`intermediate-code.ts`**: Three-address code generation
- **`cpu-code-gen.ts`**: Assembly code generation
- **`symbol-table.ts`**: Variable and function management
- **`cfg-generator.ts`**: Control flow graph generation
- **`register-allocator.ts`**: Register allocation algorithm

## ⚠️ Known Limitations

### Language Features Not Supported
- **Arrays/Lists**: No collection data types
- **Objects/Structs**: No user-defined data structures
- **Scoping**: All variables are global
- **Type System**: No static type checking
- **Standard Library**: No built-in functions (max, min, sqrt, etc.)
- **Advanced Control Flow**: No `for` loops, `switch` statements, `break`, `continue`
- **Error Handling**: No try-catch or exception handling
- **Modules**: No import/export system

### Technical Limitations
- **No Optimization**: No constant folding, dead code elimination
- **Simple Memory Model**: No stack/heap management
- **Basic Error Messages**: Limited error reporting
- **No Debugging**: No step-through debugging
- **Performance**: Not optimized for large programs

### Testing Limitations
- **No Unit Tests**: Limited test coverage
- **No Integration Tests**: End-to-end testing needed
- **No Error Case Testing**: Edge cases not fully tested

## 🧪 Testing Your Code

### Valid Syntax Examples
```javascript
// Simple arithmetic
let x = 10 + 5 * 2

// String concatenation
let msg = "Hello" + " " + "World"

// Boolean expressions
let flag = true && false || true

// Function calls
let result = add(1, 2)
```

### Invalid Syntax (Will Cause Errors)
```javascript
// Missing semicolons (optional but recommended)
let x = 10
let y = 20

// Undefined variables
print undefinedVariable

// Wrong operator precedence (use parentheses)
let result = 10 + 5 * 2  // Should be: (10 + 5) * 2

// Missing function parameters
let result = add(1)  // If add expects 2 parameters
```

## 🎯 Getting Help

### Common Issues
1. **"Variable not found"**: Make sure to declare variables with `let`
2. **"Function not found"**: Define functions before calling them
3. **"Parse error"**: Check syntax against supported grammar
4. **"Type error"**: Ensure correct data types for operations

### Debugging Tips
1. Use the **Symbol Table** to see declared variables
2. Check the **Three-Address Code** to understand compilation
3. View the **Control Flow Graph** to understand program flow
4. Use the **Register Allocation** to see variable assignments

## 📚 Educational Value

This project demonstrates:
- **Compiler Design**: Complete compilation pipeline
- **Lexical Analysis**: Regular expressions and tokenization
- **Syntax Analysis**: Context-free grammars and parsing
- **Code Generation**: Intermediate and target code
- **Optimization**: Register allocation and graph coloring
- **Visualization**: AST, CFG, and register allocation graphs

Perfect for learning compiler construction, language design, and program analysis!

---

**Happy Compiling! 🚀**