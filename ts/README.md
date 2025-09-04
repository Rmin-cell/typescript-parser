# TypeScript Parsers (Chevrotain)

This directory re-implements the C Flex/Bison examples in TypeScript using Chevrotain.

- `calc`: arithmetic expression evaluator with + - * / and parentheses.
- `simple`: minimal demo recognizing STRING, NUM and printing messages.

## Setup

```bash
cd ts
npm install
```

## Run (with ts-node)

- Calculator:

```bash
npm run calc
# then type: 3 + 5 * (10 - 4)
```

- Simple statements:

```bash
npm run simple
# then type: hello; 123; x
```

## Build

```bash
npm run build
```


