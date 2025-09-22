import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

interface Command {
  name: string;
  description: string;
  usage: string;
  action: () => void;
  aliases?: string[];
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
  id: string;
}

interface CommandHistory {
  commands: string[];
  currentIndex: number;
}

const typingAnimation = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TerminalContainer = styled.div`
  width: 100vw;
  height: 100vh;
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

const TerminalHeader = styled.div`
  background: linear-gradient(90deg, #21262d 0%, #30363d 100%);
  padding: 12px 20px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const TerminalButton = styled.div<{ color: string; hoverColor: string }>`
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

const TerminalTitle = styled.div`
  color: #8b949e;
  font-size: 13px;
  margin-left: 20px;
  font-weight: 500;
`;

const TerminalBody = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: 
    radial-gradient(circle at 20% 20%, rgba(88, 166, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
`;

const TerminalLine = styled.div<{ type: 'input' | 'output' | 'error' | 'system' }>`
  margin-bottom: 12px;
  color: ${props => {
    switch (props.type) {
      case 'input': return '#58a6ff';
      case 'output': return '#f0f6fc';
      case 'error': return '#f85149';
      case 'system': return '#7c3aed';
      default: return '#f0f6fc';
    }
  }};
  white-space: pre-wrap;
  word-wrap: break-word;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Prompt = styled.span`
  color: #7c3aed;
  font-weight: bold;
  margin-right: 8px;
`;

const User = styled.span`
  color: #58a6ff;
  font-weight: bold;
  margin-right: 4px;
`;

const Directory = styled.span`
  color: #a5a5a5;
  margin-right: 8px;
`;

const Cursor = styled.span<{ visible: boolean }>`
  background: #58a6ff;
  color: #0d1117;
  opacity: ${props => props.visible ? 1 : 0};
  animation: blink 1s infinite;
  margin-left: 2px;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const InputLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
`;

const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`;

const WelcomeMessage = styled.div`
  color: #7c3aed;
  font-size: 18px;
  margin-bottom: 24px;
  text-align: center;
  border: 2px solid #30363d;
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.6s ease-out;
`;

const HelpSection = styled.div`
  margin: 24px 0;
  padding: 20px;
  background: linear-gradient(135deg, rgba(88, 166, 255, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%);
  border: 1px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const CommandItem = styled.div`
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(88, 166, 255, 0.1);
  }
`;

const CommandName = styled.span`
  color: #58a6ff;
  font-weight: bold;
  min-width: 120px;
  font-size: 15px;
`;

const CommandDescription = styled.span`
  color: #f0f6fc;
  flex: 1;
  font-size: 14px;
`;

const CommandUsage = styled.span`
  color: #8b949e;
  font-size: 12px;
  font-family: 'Courier New', monospace;
`;

const StatusBar = styled.div`
  background: #21262d;
  padding: 8px 20px;
  border-top: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8b949e;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const AdvancedTerminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [commandHistory, setCommandHistory] = useState<CommandHistory>({
    commands: [],
    currentIndex: -1
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    {
      name: 'help',
      description: 'Show available commands and their usage',
      usage: 'help [command]',
      aliases: ['h', '?'],
      action: () => showHelp()
    },
    {
      name: 'calc',
      description: 'Calculator mode - Evaluate mathematical expressions',
      usage: 'calc',
      aliases: ['calculator', 'math'],
      action: () => navigateToMode('calc')
    },
    {
      name: 'simple',
      description: 'Simple parser mode - Parse basic data types (strings, numbers, booleans)',
      usage: 'simple',
      aliases: ['parse', 'basic'],
      action: () => navigateToMode('simple')
    },
    {
      name: 'compiler',
      description: 'Full compiler mode - Complete compilation pipeline with all features',
      usage: 'compiler',
      aliases: ['compile', 'full'],
      action: () => navigateToMode('compiler')
    },
    {
      name: 'clear',
      description: 'Clear terminal screen',
      usage: 'clear',
      aliases: ['cls', 'reset'],
      action: () => clearTerminal()
    },
    {
      name: 'about',
      description: 'Show detailed project information and features',
      usage: 'about',
      aliases: ['info', 'version'],
      action: () => showAbout()
    },
    {
      name: 'history',
      description: 'Show command history',
      usage: 'history',
      aliases: ['hist'],
      action: () => showHistory()
    },
    {
      name: 'exit',
      description: 'Exit the terminal (same as closing the tab)',
      usage: 'exit',
      aliases: ['quit', 'q'],
      action: () => exitTerminal()
    }
  ];

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Show welcome message with typing effect
    setTimeout(() => {
      typeText('system', '🚀 Compiler Visualizer Terminal v1.0.0');
      typeText('system', 'Interactive Compiler Development Environment');
      typeText('system', '');
      typeText('output', 'Welcome! Type "help" to see available commands.');
      typeText('output', 'Use ↑/↓ arrows to navigate command history.');
      typeText('output', '');
    }, 800);

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const typeText = (type: 'input' | 'output' | 'error' | 'system', text: string, delay: number = 50) => {
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        const currentText = text.substring(0, index + 1);
        addLine(type, currentText, true);
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, delay);
  };

  const addLine = (type: 'input' | 'output' | 'error' | 'system', content: string, replace: boolean = false) => {
    const newLine: TerminalLine = {
      type,
      content,
      timestamp: new Date(),
      id: Date.now().toString()
    };

    if (replace) {
      setLines(prev => {
        const newLines = [...prev];
        newLines[newLines.length - 1] = newLine;
        return newLines;
      });
    } else {
      setLines(prev => [...prev, newLine]);
    }
  };

  const clearTerminal = () => {
    setLines([]);
  };

  const showHelp = () => {
    addLine('output', '📚 Available Commands:');
    addLine('output', '');
    
    commands.forEach(cmd => {
      addLine('output', `  ${cmd.name.padEnd(12)} - ${cmd.description}`);
      addLine('output', `  ${' '.repeat(12)} Usage: ${cmd.usage}`);
      if (cmd.aliases && cmd.aliases.length > 0) {
        addLine('output', `  ${' '.repeat(12)} Aliases: ${cmd.aliases.join(', ')}`);
      }
      addLine('output', '');
    });
  };

  const showAbout = () => {
    addLine('output', '🔧 Compiler Visualizer v1.0.0');
    addLine('output', 'A comprehensive educational compiler implementation');
    addLine('output', 'Built with TypeScript, React, and modern web technologies');
    addLine('output', '');
    addLine('output', '✨ Features:');
    addLine('output', '  • Lexical Analysis (Tokenization)');
    addLine('output', '  • Syntax Analysis (Parsing)');
    addLine('output', '  • Abstract Syntax Tree (AST) Visualization');
    addLine('output', '  • Intermediate Code Generation');
    addLine('output', '  • Control Flow Graph (CFG)');
    addLine('output', '  • Register Allocation with Graph Coloring');
    addLine('output', '  • CPU Code Generation');
    addLine('output', '  • Symbol Table Management');
    addLine('output', '  • Interactive Web Interface');
    addLine('output', '');
    addLine('output', '🎯 Modes:');
    addLine('output', '  • Calculator: Mathematical expression evaluation');
    addLine('output', '  • Simple: Basic data type parsing');
    addLine('output', '  • Compiler: Full compilation pipeline');
    addLine('output', '');
  };

  const showHistory = () => {
    if (commandHistory.commands.length === 0) {
      addLine('output', 'No commands in history.');
      return;
    }
    
    addLine('output', '📜 Command History:');
    commandHistory.commands.forEach((cmd, index) => {
      addLine('output', `  ${index + 1}. ${cmd}`);
    });
    addLine('output', '');
  };

  const exitTerminal = () => {
    addLine('system', 'Goodbye! 👋');
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  const navigateToMode = (mode: string) => {
    addLine('output', `🚀 Starting ${mode} mode...`);
    addLine('output', 'Redirecting to compiler interface...');
    
    // Store the selected mode and redirect
    localStorage.setItem('selectedMode', mode);
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);
  };

  const handleCommand = (input: string) => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      addLine('input', '');
      return;
    }

    // Add to history
    setCommandHistory(prev => ({
      commands: [...prev.commands, trimmedInput],
      currentIndex: prev.commands.length
    }));

    // Add input line
    addLine('input', `$ ${trimmedInput}`);

    // Find and execute command
    const command = commands.find(cmd => 
      cmd.name === trimmedInput || 
      (cmd.aliases && cmd.aliases.includes(trimmedInput))
    );
    
    if (command) {
      command.action();
    } else {
      addLine('error', `❌ Command not found: ${trimmedInput}`);
      addLine('output', 'Type "help" to see available commands.');
    }

    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.currentIndex > 0) {
        const newIndex = commandHistory.currentIndex - 1;
        setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
        setCurrentInput(commandHistory.commands[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.currentIndex < commandHistory.commands.length - 1) {
        const newIndex = commandHistory.currentIndex + 1;
        setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
        setCurrentInput(commandHistory.commands[newIndex]);
      } else {
        setCurrentInput('');
        setCommandHistory(prev => ({ ...prev, currentIndex: commandHistory.commands.length }));
      }
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
        <TerminalButton color="#ff5f56" hoverColor="#ff3b30" />
        <TerminalButton color="#ffbd2e" hoverColor="#ff9500" />
        <TerminalButton color="#27ca3f" hoverColor="#30d158" />
        <TerminalTitle>Compiler Visualizer Terminal</TerminalTitle>
      </TerminalHeader>
      
      <TerminalBody ref={terminalRef}>
        <WelcomeMessage>
          🚀 Compiler Visualizer Terminal
          <br />
          <span style={{ fontSize: '14px', color: '#8b949e', marginTop: '8px', display: 'block' }}>
            Interactive Compiler Development Environment
          </span>
        </WelcomeMessage>

        {lines.map((line, index) => (
          <TerminalLine key={line.id} type={line.type}>
            {line.type === 'input' && (
              <>
                <Prompt>$</Prompt> <User>user</User>@<Directory>compiler-visualizer</Directory> {line.content}
              </>
            )}
            {line.type === 'output' && line.content}
            {line.type === 'error' && line.content}
            {line.type === 'system' && line.content}
          </TerminalLine>
        ))}

        <InputLine>
          <Prompt>$</Prompt> <User>user</User>@<Directory>compiler-visualizer</Directory> {currentInput}
          <Cursor visible={showCursor && !isTyping}>█</Cursor>
        </InputLine>

        <HiddenInput
          ref={inputRef}
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          autoFocus
        />
      </TerminalBody>

      <StatusBar>
        <StatusItem>
          <StatusDot color="#27ca3f" />
          <span>Online</span>
        </StatusItem>
        <StatusItem>
          <StatusDot color="#58a6ff" />
          <span>Ready</span>
        </StatusItem>
        <StatusItem>
          <span>Commands: {commandHistory.commands.length}</span>
        </StatusItem>
        <StatusItem>
          <span>Press ↑/↓ for history</span>
        </StatusItem>
      </StatusBar>
    </TerminalContainer>
  );
};

export default AdvancedTerminal;

