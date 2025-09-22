import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface Command {
  name: string;
  description: string;
  usage: string;
  action: () => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

const TerminalContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #0d1117;
  color: #f0f6fc;
  font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  position: relative;
`;

const TerminalHeader = styled.div`
  background: #21262d;
  padding: 8px 16px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TerminalButton = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const TerminalTitle = styled.div`
  color: #8b949e;
  font-size: 12px;
  margin-left: 16px;
`;

const TerminalBody = styled.div`
  padding: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
`;

const TerminalLine = styled.div<{ type: 'input' | 'output' | 'error' }>`
  margin-bottom: 8px;
  color: ${props => {
    switch (props.type) {
      case 'input': return '#58a6ff';
      case 'output': return '#f0f6fc';
      case 'error': return '#f85149';
      default: return '#f0f6fc';
    }
  }};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const Prompt = styled.span`
  color: #7c3aed;
  font-weight: bold;
`;

const User = styled.span`
  color: #58a6ff;
  font-weight: bold;
`;

const Directory = styled.span`
  color: #a5a5a5;
`;

const Cursor = styled.span<{ visible: boolean }>`
  background: #58a6ff;
  color: #0d1117;
  opacity: ${props => props.visible ? 1 : 0};
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const InputLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`;

const WelcomeMessage = styled.div`
  color: #7c3aed;
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #30363d;
  padding: 20px;
  border-radius: 8px;
  background: rgba(88, 166, 255, 0.1);
`;

const HelpSection = styled.div`
  margin: 20px 0;
  padding: 16px;
  background: rgba(88, 166, 255, 0.05);
  border: 1px solid #30363d;
  border-radius: 8px;
`;

const CommandItem = styled.div`
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CommandName = styled.span`
  color: #58a6ff;
  font-weight: bold;
  min-width: 100px;
`;

const CommandDescription = styled.span`
  color: #f0f6fc;
  flex: 1;
`;

const CommandUsage = styled.span`
  color: #8b949e;
  font-size: 12px;
`;

const TerminalLanding: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    {
      name: 'help',
      description: 'Show available commands',
      usage: 'help',
      action: () => showHelp()
    },
    {
      name: 'calc',
      description: 'Calculator mode - Evaluate mathematical expressions',
      usage: 'calc',
      action: () => navigateToMode('calc')
    },
    {
      name: 'simple',
      description: 'Simple parser mode - Parse basic data types',
      usage: 'simple',
      action: () => navigateToMode('simple')
    },
    {
      name: 'compiler',
      description: 'Full compiler mode - Complete compilation pipeline',
      usage: 'compiler',
      action: () => navigateToMode('compiler')
    },
    {
      name: 'clear',
      description: 'Clear terminal screen',
      usage: 'clear',
      action: () => clearTerminal()
    },
    {
      name: 'about',
      description: 'Show project information',
      usage: 'about',
      action: () => showAbout()
    }
  ];

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Show welcome message
    setTimeout(() => {
      addLine('output', 'Welcome to Compiler Visualizer Terminal!');
      addLine('output', 'Type "help" to see available commands.');
      addLine('output', '');
    }, 500);

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const addLine = (type: 'input' | 'output' | 'error', content: string) => {
    setLines(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const clearTerminal = () => {
    setLines([]);
  };

  const showHelp = () => {
    addLine('output', 'Available commands:');
    addLine('output', '');
    
    commands.forEach(cmd => {
      addLine('output', `${cmd.name.padEnd(12)} - ${cmd.description}`);
      addLine('output', `             Usage: ${cmd.usage}`);
      addLine('output', '');
    });
  };

  const showAbout = () => {
    addLine('output', 'Compiler Visualizer v1.0.0');
    addLine('output', 'A comprehensive educational compiler implementation');
    addLine('output', 'Built with TypeScript, React, and modern web technologies');
    addLine('output', '');
    addLine('output', 'Features:');
    addLine('output', '  • Lexical Analysis (Tokenization)');
    addLine('output', '  • Syntax Analysis (Parsing)');
    addLine('output', '  • Abstract Syntax Tree (AST) Visualization');
    addLine('output', '  • Intermediate Code Generation');
    addLine('output', '  • Control Flow Graph (CFG)');
    addLine('output', '  • Register Allocation');
    addLine('output', '  • CPU Code Generation');
    addLine('output', '');
  };

  const navigateToMode = (mode: string) => {
    addLine('output', `Starting ${mode} mode...`);
    addLine('output', 'Redirecting to compiler interface...');
    
    // Store the selected mode and redirect
    localStorage.setItem('selectedMode', mode);
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  };

  const handleCommand = (input: string) => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      addLine('input', '');
      return;
    }

    // Add input line
    addLine('input', `$ ${trimmedInput}`);

    // Find and execute command
    const command = commands.find(cmd => cmd.name === trimmedInput);
    
    if (command) {
      command.action();
    } else {
      addLine('error', `Command not found: ${trimmedInput}`);
      addLine('output', 'Type "help" to see available commands.');
    }

    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalButton color="#ff5f56" />
        <TerminalButton color="#ffbd2e" />
        <TerminalButton color="#27ca3f" />
        <TerminalTitle>Compiler Visualizer Terminal</TerminalTitle>
      </TerminalHeader>
      
      <TerminalBody ref={terminalRef}>
        <WelcomeMessage>
          🚀 Compiler Visualizer Terminal
          <br />
          <span style={{ fontSize: '12px', color: '#8b949e' }}>
            Interactive Compiler Development Environment
          </span>
        </WelcomeMessage>

        {lines.map((line, index) => (
          <TerminalLine key={index} type={line.type}>
            {line.type === 'input' && (
              <>
                <Prompt>$</Prompt> <User>user</User>@<Directory>compiler-visualizer</Directory> {line.content}
              </>
            )}
            {line.type === 'output' && line.content}
            {line.type === 'error' && line.content}
          </TerminalLine>
        ))}

        <InputLine>
          <Prompt>$</Prompt> <User>user</User>@<Directory>compiler-visualizer</Directory> {currentInput}
          <Cursor visible={showCursor}>█</Cursor>
        </InputLine>

        <HiddenInput
          ref={inputRef}
          value={currentInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          autoFocus
        />
      </TerminalBody>
    </TerminalContainer>
  );
};

export default TerminalLanding;

