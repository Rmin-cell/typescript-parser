import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import AnimatedTokens from './compiler/AnimatedTokens';
import AnimatedSymbolTable from './compiler/AnimatedSymbolTable';
import AnimatedThreeAddressCode from './compiler/AnimatedThreeAddressCode';
import AnimatedCFG from './compiler/AnimatedCFG';
import AnimatedRegisterAllocation from './compiler/AnimatedRegisterAllocation';
import AnimatedCpuCode from './compiler/AnimatedCpuCode';

interface CompilerInterfaceProps {
  onBack: () => void;
}

interface CompilerState {
  code: string;
  tokens: any[];
  symbolTable: any;
  threeAddressCode: any[];
  cpuCode: any[];
  cfg: any;
  registerAllocation: any;
  errors: string[];
  executionOutput: string;
}

const CompilerContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  color: #f0f6fc;
  font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const CompilerHeader = styled.div`
  background: linear-gradient(90deg, #21262d 0%, #30363d 100%);
  padding: 12px 20px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const CompilerButton = styled.div<{ color: string; hoverColor: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${props => props.color};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.hoverColor};
    transform: scale(1.1);
  }
`;

const CompilerTitle = styled.div`
  color: #4ec9b0;
  font-size: 16px;
  margin-left: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModeIndicator = styled.span`
  background: #4ec9b0;
  color: #0d1117;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
`;

const CompilerBody = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: 
    radial-gradient(circle at 20% 20%, rgba(88, 166, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
`;

const CodeSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: #252526;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
`;

const CodeEditorContainer = styled.div`
  margin-bottom: 16px;
`;

const CodeEditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #4ec9b0;
  font-weight: 600;
`;

const EditorStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #8b949e;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const CodeEditorWrapper = styled.div`
  .CodeMirror {
    height: 300px;
    font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    background: #1e1e1e !important;
    color: #f0f6fc !important;
    border: 1px solid #3c3c3c;
    border-radius: 6px;
  }
  
  .CodeMirror-gutters {
    background: #252526 !important;
    border-right: 1px solid #3c3c3c !important;
  }
  
  .CodeMirror-linenumber {
    color: #8b949e !important;
  }
  
  .CodeMirror-cursor {
    border-left: 1px solid #4ec9b0 !important;
  }
  
  .CodeMirror-selected {
    background: rgba(78, 201, 176, 0.2) !important;
  }
  
  .CodeMirror-focused .CodeMirror-selected {
    background: rgba(78, 201, 176, 0.3) !important;
  }
  
  .CodeMirror-hints {
    background: #252526 !important;
    border: 1px solid #3c3c3c !important;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .CodeMirror-hint {
    color: #f0f6fc !important;
    background: transparent !important;
    border: none !important;
    padding: 8px 12px !important;
  }
  
  .CodeMirror-hint-active {
    background: #4ec9b0 !important;
    color: #0d1117 !important;
  }
  
  .CodeMirror-lint-markers {
    width: 16px;
  }
  
  .CodeMirror-lint-marker-error {
    background: #f85149;
    border-radius: 50%;
  }
  
  .CodeMirror-lint-marker-warning {
    background: #ffcc02;
    border-radius: 50%;
  }
  
  .CodeMirror-lint-tooltip {
    background: #252526 !important;
    border: 1px solid #3c3c3c !important;
    border-radius: 6px;
    color: #f0f6fc !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const RunButton = styled.button`
  background: linear-gradient(135deg, #4ec9b0 0%, #58a6ff 100%);
  color: #0d1117;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(78, 201, 176, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ResultsSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: #252526;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
`;

const ResultOutput = styled.div`
  background: #1e1e1e;
  border-radius: 6px;
  padding: 16px;
  min-height: 100px;
  color: #f0f6fc;
  white-space: pre-wrap;
  font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
`;

const CompilerPanels = styled.div`
  margin-top: 16px;
`;

const PanelDetails = styled.details`
  margin: 8px 0;
  background: #1e1e1e;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const PanelSummary = styled.summary`
  padding: 16px 20px;
  background: #2d2d30;
  cursor: pointer;
  font-weight: 600;
  color: #4ec9b0;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #3c3c3c;
  }
  
  &::before {
    content: "▶";
    transition: transform 0.2s ease;
    color: #4ec9b0;
  }
`;

const PanelContent = styled.div`
  padding: 16px;
  background: #1e1e1e;
  color: #f0f6fc;
  font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

const ErrorContainer = styled.div`
  background: #2d1b1b;
  border: 1px solid #f85149;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  color: #f85149;
`;

const ErrorTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #f85149;
`;

const ErrorItem = styled.div`
  margin: 4px 0;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
  border-left: 3px solid #f85149;
`;

const CompilerInterface: React.FC<CompilerInterfaceProps> = ({ onBack }) => {
  const [state, setState] = useState<CompilerState>({
    code: 'let x = 10\nprint x',
    tokens: [],
    symbolTable: null,
    threeAddressCode: [],
    cpuCode: [],
    cfg: null,
    registerAllocation: null,
    errors: [],
    executionOutput: ''
  });

  const editorRef = useRef<any>(null);

  const handleCodeChange = (editor: any, data: any, value: string) => {
    setState(prev => ({ ...prev, code: value }));
    // Auto-save to localStorage
    localStorage.setItem('compiler-code', value);
  };

  // Load saved code on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('compiler-code');
    if (savedCode) {
      setState(prev => ({ ...prev, code: savedCode }));
    }
  }, []);


  const handleRunCode = async () => {
    setState(prev => ({ ...prev, errors: [] }));
    
    try {
      // Import real compiler modules
      const { parseProgram } = await import('../compiler/parser');
      const { compilerLexer } = await import('../compiler/lexer');
      const { SymbolTable } = await import('../compiler/symbol-table');
      const { IntermediateCodeGenerator } = await import('../compiler/intermediate-code');
      const { CpuCodeGenerator } = await import('../compiler/cpu-code-gen');
      const { CFGGenerator } = await import('../compiler/cfg-generator');
      const { RegisterAllocator } = await import('../compiler/register-allocator');
      const { interpretCompilerCode } = await import('../compiler/interpreter');

      // Tokenize the code
      const lexResult = compilerLexer.tokenize(state.code);
      if (lexResult.errors.length > 0) {
        setState(prev => ({ 
          ...prev, 
          errors: lexResult.errors.map(error => 
            `Lexical error: ${error.message} at line ${error.line}, column ${error.column}`
          )
        }));
        return;
      }

      // Parse the code
      const parseResult = parseProgram(state.code);
      if (parseResult.errors.length > 0) {
        setState(prev => ({ 
          ...prev, 
          errors: parseResult.errors.map(error => 
            typeof error === 'string' ? error : `Parse error: ${error.message || error}`
          )
        }));
        return;
      }

      // Generate symbol table and intermediate code
      const symTable = new SymbolTable();
      const intermediateGen = new IntermediateCodeGenerator(symTable);
      const threeAddressCode = intermediateGen.generate(parseResult.cst);

      // Generate CPU code
      const cpuGen = new CpuCodeGenerator(symTable);
      const cpuCode = cpuGen.generate(threeAddressCode);

      // Generate CFG
      const cfgGen = new CFGGenerator();
      const cfg = cfgGen.generate(threeAddressCode);

      // Generate register allocation
      const regAlloc = new RegisterAllocator(cfg, threeAddressCode);
      const registerAllocation = regAlloc.allocate();

      // Execute the code to get actual output
      const executionOutput = interpretCompilerCode(state.code);

      setState(prev => ({
        ...prev,
        tokens: lexResult.tokens,
        symbolTable: symTable,
        threeAddressCode,
        cpuCode,
        cfg,
        registerAllocation,
        executionOutput
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [`Compiler error: ${error}`]
      }));
    }
  };

  const formatTokens = (tokens: any[]) => {
    if (!tokens || tokens.length === 0) return 'No tokens generated';
    return tokens.map((token, index) => 
      `${(index + 1).toString().padStart(2)}. ${token.tokenType.name.padEnd(15)} | "${token.image}"`
    ).join('\n');
  };

  const formatSymbolTable = (symTable: any) => {
    if (!symTable) return 'No symbol table data';
    return JSON.stringify(symTable, null, 2);
  };

  const formatThreeAddressCode = (tac: any[]) => {
    if (!tac || tac.length === 0) return 'No three-address code generated';
    return tac.map((instruction, index) => `${index}: ${instruction}`).join('\n');
  };

  const formatCpuCode = (cpuCode: any[]) => {
    if (!cpuCode || cpuCode.length === 0) return 'No CPU code generated';
    return cpuCode.map((instruction, index) => `${index}: ${instruction}`).join('\n');
  };

  const formatCFG = (cfg: any) => {
    if (!cfg) return 'No CFG generated';
    
    // Convert blocks Map to array for display
    const blocksArray = cfg.blocks ? Array.from(cfg.blocks.values()) : [];
    const nodesCount = blocksArray.length;
    const edgesCount = cfg.edges?.length || 0;
    
    return `Blocks: ${nodesCount}\nEdges: ${edgesCount}\nEntry Block: ${cfg.entryBlock || 'N/A'}\nExit Blocks: ${cfg.exitBlocks?.join(', ') || 'N/A'}\n\n${JSON.stringify({
      blocks: blocksArray,
      entryBlock: cfg.entryBlock,
      exitBlocks: cfg.exitBlocks,
      edges: cfg.edges
    }, null, 2)}`;
  };

  const formatRegisterAllocation = (allocation: any) => {
    if (!allocation) return 'No register allocation data';
    return JSON.stringify(allocation, null, 2);
  };

  return (
    <CompilerContainer>
      <CompilerHeader>
        <CompilerButton color="#ff5f56" hoverColor="#ff3b30" onClick={onBack} />
        <CompilerButton color="#ffbd2e" hoverColor="#ff9500" />
        <CompilerButton color="#27ca3f" hoverColor="#30d158" />
        <CompilerTitle>
          Compiler Visualizer
          <ModeIndicator>COMPILER</ModeIndicator>
        </CompilerTitle>
      </CompilerHeader>
      
      <CompilerBody>
        {/* Code Editor Section */}
        <CodeSection>
          <CodeEditorContainer>
            <CodeEditorHeader>
              <span>Code Editor</span>
              <EditorStatus>
                <StatusIndicator>
                  <StatusDot color={state.errors.length > 0 ? "#f85149" : "#27ca3f"} />
                  <span>{state.errors.length > 0 ? `${state.errors.length} errors` : 'No issues'}</span>
                </StatusIndicator>
                <span>{state.code.split('\n').length} lines</span>
                <div>Auto-saved</div>
              </EditorStatus>
            </CodeEditorHeader>
            <CodeEditorWrapper>
              <textarea
                value={state.code}
                onChange={(e) => handleCodeChange(null, null, e.target.value)}
                placeholder="Enter your code here...&#10;Example: let x = 10&#10;print x"
                style={{
                  width: '100%',
                  minHeight: '300px',
                  background: '#1e1e1e',
                  color: '#f0f6fc',
                  border: 'none',
                  padding: '16px',
                  fontFamily: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  outline: 'none',
                  borderRadius: '6px'
                }}
              />
            </CodeEditorWrapper>
          </CodeEditorContainer>
          <RunButton onClick={handleRunCode}>
            ▶ Run Code
          </RunButton>
        </CodeSection>


        {/* Results Section */}
        <ResultsSection>
          <div style={{ color: '#4ec9b0', fontWeight: 600, marginBottom: '8px' }}>Results</div>
          <ResultOutput>
            {state.errors.length > 0 ? (
              <div style={{ color: '#f85149' }}>
                ❌ Compilation failed with {state.errors.length} error(s). Check the details below.
              </div>
            ) : state.symbolTable ? (
              <div>
                <div style={{ color: '#4ec9b0', marginBottom: '16px' }}>
                  ✅ Compilation successful! Generated:
                  <br />• {state.tokens.length} tokens
                  <br />• {Object.keys(state.symbolTable).length} symbols
                  <br />• {state.threeAddressCode.length} three-address instructions
                  <br />• {state.cpuCode.length} CPU instructions
                  <br />• {state.cfg?.blocks?.size || 0} CFG blocks
                  <br />• Register allocation completed
                </div>
                {state.executionOutput && (
                  <div style={{ 
                    background: '#1a1a1a', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    border: '1px solid #3c3c3c',
                    marginTop: '12px'
                  }}>
                    <div style={{ color: '#58a6ff', fontWeight: '600', marginBottom: '8px' }}>
                      🚀 Program Output:
                    </div>
                    <div style={{ 
                      color: '#f0f6fc', 
                      fontFamily: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
                      whiteSpace: 'pre-wrap'
                    }}>
                      {state.executionOutput}
                    </div>
                  </div>
                )}
                <div style={{ color: '#8b949e', marginTop: '12px', fontSize: '12px' }}>
                  📋 Detailed compiler analysis is available in the panels below.
                </div>
              </div>
            ) : (
              'Results will appear here after running the compiler...'
            )}
          </ResultOutput>
        </ResultsSection>

        {/* Error Display */}
        {state.errors.length > 0 && (
          <ErrorContainer>
            <ErrorTitle>Compilation Errors:</ErrorTitle>
            {state.errors.map((error, index) => (
              <ErrorItem key={index}>{error}</ErrorItem>
            ))}
          </ErrorContainer>
        )}

        {/* Animated Compiler Panels */}
        <CompilerPanels>
          <AnimatedTokens tokens={state.tokens} />
          <AnimatedSymbolTable symbolTable={state.symbolTable} />
          <AnimatedThreeAddressCode threeAddressCode={state.threeAddressCode} />
          <AnimatedCFG cfg={state.cfg} />
          <AnimatedRegisterAllocation registerAllocation={state.registerAllocation} />
          <AnimatedCpuCode cpuCode={state.cpuCode} />
        </CompilerPanels>
      </CompilerBody>
    </CompilerContainer>
  );
};

export default CompilerInterface;
