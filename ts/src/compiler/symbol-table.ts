export type DataType = "number" | "string" | "boolean" | "void";

export interface Symbol {
  name: string;
  type: DataType;
  scope: number;
  isFunction: boolean;
  parameters?: DataType[];
  address?: number; // For code generation
}

export class SymbolTable {
  private symbols: Map<string, Symbol> = new Map();
  private scopeStack: number[] = [0];
  private currentScope = 0;
  private nextAddress = 0;

  enterScope(): void {
    this.currentScope++;
    this.scopeStack.push(this.currentScope);
  }

  exitScope(): void {
    this.scopeStack.pop();
    this.currentScope = this.scopeStack[this.scopeStack.length - 1];
    
    // Remove symbols from exited scope
    for (const [name, symbol] of this.symbols.entries()) {
      if (symbol.scope > this.currentScope) {
        this.symbols.delete(name);
      }
    }
  }

  declareVariable(name: string, type: DataType): void {
    if (this.symbols.has(name)) {
      throw new Error(`Variable '${name}' already declared in current scope`);
    }
    
    this.symbols.set(name, {
      name,
      type,
      scope: this.currentScope,
      isFunction: false,
      address: this.nextAddress++
    });
  }

  declareFunction(name: string, returnType: DataType, parameters: DataType[]): void {
    if (this.symbols.has(name)) {
      throw new Error(`Function '${name}' already declared`);
    }
    
    this.symbols.set(name, {
      name,
      type: returnType,
      scope: this.currentScope,
      isFunction: true,
      parameters
    });
  }

  lookup(name: string): Symbol | undefined {
    // Search from current scope up to global scope
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      const scope = this.scopeStack[i];
      for (const [symbolName, symbol] of this.symbols.entries()) {
        if (symbolName === name && symbol.scope <= scope) {
          return symbol;
        }
      }
    }
    return undefined;
  }

  getVariableAddress(name: string): number {
    const symbol = this.lookup(name);
    if (!symbol || symbol.isFunction) {
      throw new Error(`Variable '${name}' not found`);
    }
    return symbol.address!;
  }

  getFunctionInfo(name: string): Symbol {
    const symbol = this.lookup(name);
    if (!symbol || !symbol.isFunction) {
      throw new Error(`Function '${name}' not found`);
    }
    return symbol;
  }

  getAllSymbols(): Symbol[] {
    return Array.from(this.symbols.values());
  }

  getCurrentScope(): number {
    return this.currentScope;
  }

  getNextAddress(): number {
    return this.nextAddress;
  }
}

