import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

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
  isRunning: boolean;
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
    isRunning: false
  });

  const [showInstallation, setShowInstallation] = useState(false);
  const [installationProgress, setInstallationProgress] = useState(0);
  const [installationStep, setInstallationStep] = useState(0);
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

  // Show installation simulation
  useEffect(() => {
    if (showInstallation) {
      const installationSteps = [
        { command: 'npm install @compiler/core', output: 'Installing core compiler modules...', duration: 1200 },
        { command: 'npm install @compiler/lexer', output: 'Installing lexical analyzer...', duration: 1000 },
        { command: 'npm install @compiler/parser', output: 'Installing parser engine...', duration: 1100 },
        { command: 'npm install @compiler/codegen', output: 'Installing code generator...', duration: 1000 },
        { command: 'npm install @compiler/visualizer', output: 'Installing visualization tools...', duration: 1300 },
        { command: 'compiler --init', output: 'Initializing compiler configuration...', duration: 800 }
      ];

      let stepIndex = 0;
      let totalDelay = 0;

      const executeStep = (step: typeof installationSteps[0]) => {
        setTimeout(() => {
          setInstallationStep(stepIndex);
          setInstallationProgress(((stepIndex + 1) / installationSteps.length) * 100);
          stepIndex++;
          if (stepIndex < installationSteps.length) {
            executeStep(installationSteps[stepIndex]);
          } else {
            setTimeout(() => {
              setShowInstallation(false);
            }, 1000);
          }
        }, totalDelay);
        totalDelay += step.duration;
      };

      executeStep(installationSteps[0]);
    }
  }, [showInstallation]);

  const handleRunCode = async () => {
    setState(prev => ({ ...prev, isRunning: true, errors: [] }));
    
    // Show installation simulation first
    setShowInstallation(true);
    
    try {
      // Import real compiler modules
      const { parseProgram } = await import('../compiler/parser');
      const { SymbolTable } = await import('../compiler/symbol-table');
      const { IntermediateCodeGenerator } = await import('../compiler/intermediate-code');
      const { CpuCodeGenerator } = await import('../compiler/cpu-code-gen');
      const { CFGGenerator } = await import('../compiler/cfg-generator');
      const { RegisterAllocator } = await import('../compiler/register-allocator');

      // Parse the code
      const parseResult = parseProgram(state.code);
      if (parseResult.errors.length > 0) {
        setState(prev => ({ ...prev, errors: parseResult.errors, isRunning: false }));
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

      setState(prev => ({
        ...prev,
        symbolTable: symTable,
        threeAddressCode,
        cpuCode,
        cfg,
        registerAllocation,
        isRunning: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [`Compiler error: ${error}`],
        isRunning: false
      }));
    }
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
          <RunButton onClick={handleRunCode} disabled={state.isRunning}>
            {state.isRunning ? '⏳ Running...' : '▶ Run Code'}
          </RunButton>
        </CodeSection>

        {/* Installation Simulation */}
        {showInstallation && (
          <CodeSection>
            <div style={{ color: '#4ec9b0', fontWeight: 600, marginBottom: '8px' }}>🔧 Compiler Installation</div>
            <div style={{ background: '#1e1e1e', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <div style={{ color: '#f0f6fc', marginBottom: '8px' }}>Installing compiler modules...</div>
              <div style={{ background: '#252526', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    background: 'linear-gradient(90deg, #4ec9b0, #58a6ff)', 
                    height: '100%', 
                    width: `${installationProgress}%`,
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
              <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '8px' }}>
                Step {installationStep + 1} of 6 - {Math.round(installationProgress)}% complete
              </div>
            </div>
          </CodeSection>
        )}

        {/* Results Section */}
        <ResultsSection>
          <div style={{ color: '#4ec9b0', fontWeight: 600, marginBottom: '8px' }}>Results</div>
          <ResultOutput>
            {state.isRunning ? 'Running compiler...' : 'Results will appear here...'}
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

        {/* Compiler Panels */}
        <CompilerPanels>
          <PanelDetails>
            <PanelSummary>🔍 Tokens</PanelSummary>
            <PanelContent>
              {state.tokens.length > 0 ? JSON.stringify(state.tokens, null, 2) : 'Tokens will appear here...'}
            </PanelContent>
          </PanelDetails>

          <PanelDetails>
            <PanelSummary>📊 Symbol Table</PanelSummary>
            <PanelContent>
              {formatSymbolTable(state.symbolTable)}
            </PanelContent>
          </PanelDetails>

          <PanelDetails>
            <PanelSummary>🔢 Three-Address Code</PanelSummary>
            <PanelContent>
              {formatThreeAddressCode(state.threeAddressCode)}
            </PanelContent>
          </PanelDetails>

          <PanelDetails>
            <PanelSummary>💻 CPU Code</PanelSummary>
            <PanelContent>
              {formatCpuCode(state.cpuCode)}
            </PanelContent>
          </PanelDetails>

          <PanelDetails>
            <PanelSummary>🔄 Control Flow Graph</PanelSummary>
            <PanelContent>
              {formatCFG(state.cfg)}
            </PanelContent>
          </PanelDetails>

          <PanelDetails>
            <PanelSummary>🎯 Register Allocation</PanelSummary>
            <PanelContent>
              {formatRegisterAllocation(state.registerAllocation)}
            </PanelContent>
          </PanelDetails>
        </CompilerPanels>
      </CompilerBody>
    </CompilerContainer>
  );
};

export default CompilerInterface;
