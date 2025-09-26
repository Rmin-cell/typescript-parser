import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import CompilerInterface from './CompilerInterface';

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
  color: #f0f6fc;
  font-weight: 600;
  font-size: 14px;
  margin-left: 8px;
`;

const TerminalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: transparent;
  position: relative;
`;

const WelcomeMessage = styled.div`
  color: #58a6ff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
`;

const TerminalLine = styled.div<{ type: string }>`
  margin-bottom: 8px;
  animation: ${fadeIn} 0.3s ease-out;
  
  ${props => props.type === 'input' && `
    color: #f0f6fc;
  `}
  
  ${props => props.type === 'output' && `
    color: #8b949e;
  `}
  
  ${props => props.type === 'error' && `
    color: #f85149;
  `}
  
  ${props => props.type === 'system' && `
    color: #4ec9b0;
  `}
`;

const Prompt = styled.span`
  color: #58a6ff;
  font-weight: 600;
`;

const User = styled.span`
  color: #f0f6fc;
  font-weight: 600;
`;

const Directory = styled.span`
  color: #4ec9b0;
  font-weight: 600;
`;

const InputLine = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

const Cursor = styled.span<{ visible: boolean }>`
  display: inline-block;
  width: 8px;
  height: 16px;
  background: ${props => props.visible ? '#f0f6fc' : 'transparent'};
  animation: ${props => props.visible ? 'blink 1s infinite' : 'none'};
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
`;

const StatusBar = styled.div`
  background: linear-gradient(90deg, #21262d 0%, #30363d 100%);
  padding: 8px 20px;
  border-top: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 20px;
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

const MainContainer = styled.div`
  display: flex;
  height: calc(100vh - 40px);
  width: 100%;
`;

const TerminalSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  cursor: text;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const CompilerSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-left: 1px solid #30363d;
`;

const AdvancedTerminal: React.FC = () => {
  console.log('AdvancedTerminal component rendering...');
  const navigate = useNavigate();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [commandHistory, setCommandHistory] = useState<CommandHistory>({
    commands: [],
    currentIndex: -1
  });
  const [showCompiler, setShowCompiler] = useState(false);
  const [username, setUsername] = useState('user');
  const [currentDirectory, setCurrentDirectory] = useState('/home/user/compiler-visualizer');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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
    addLine('output', '• help - Show this help message');
    addLine('output', '• clear - Clear the terminal');
    addLine('output', '• compiler - Enter compiler mode');
    addLine('output', '• exit - Exit compiler mode');
    addLine('output', '• ls - List directory contents');
    addLine('output', '• pwd - Print working directory');
    addLine('output', '• whoami - Show current user');
    addLine('output', '• date - Show current date and time');
    addLine('output', '• uptime - Show system uptime');
    addLine('output', '• rename - Change username');
    addLine('output', '• home - Return to landing page');
    addLine('output', '');
  };

  const navigateToMode = (mode: string) => {
    addLine('output', `🚀 Starting ${mode} mode...`);
    addLine('output', 'Loading compiler modules...');
    
    if (mode === 'compiler') {
      setTimeout(() => {
        addLine('output', '✅ Compiler interface loaded successfully!');
        addLine('output', 'Switching to compiler mode...');
        setTimeout(() => {
          setShowCompiler(true);
        }, 1000);
      }, 1000);
    } else {
      setTimeout(() => {
        addLine('output', '⚠️  This mode is not available in React terminal yet');
        addLine('output', 'Use "compiler" for full compiler functionality');
      }, 1000);
    }
  };

  const handleBackToTerminal = () => {
    setShowCompiler(false);
    addLine('output', 'Returned to terminal mode');
  };

  // File system simulation
  const fileSystem = {
    '/home/user/compiler-visualizer': {
      type: 'directory',
      contents: {
        'src': { type: 'directory' },
        'dist': { type: 'directory' },
        'node_modules': { type: 'directory' },
        'package.json': { type: 'file', size: '2.1KB' },
        'tsconfig.json': { type: 'file', size: '1.2KB' },
        'vite.config.ts': { type: 'file', size: '0.8KB' },
        'README.md': { type: 'file', size: '15.3KB' },
        'index.html': { type: 'file', size: '1.0KB' }
      }
    },
    '/home/user/compiler-visualizer/src': {
      type: 'directory',
      contents: {
        'components': { type: 'directory' },
        'compiler': { type: 'directory' },
        'calc': { type: 'directory' },
        'simple': { type: 'directory' },
        'App.tsx': { type: 'file', size: '0.5KB' },
        'main.tsx': { type: 'file', size: '0.3KB' }
      }
    }
  };

  const listFiles = () => {
    const currentPath = currentDirectory;
    const dir = fileSystem[currentPath as keyof typeof fileSystem];
    
    if (!dir || dir.type !== 'directory') {
      addLine('error', `ls: cannot access '${currentPath}': No such file or directory`);
      return;
    }
    
    const contents = dir.contents;
    const items = Object.entries(contents).map(([name, info]) => {
      const icon = info.type === 'directory' ? '📁' : '📄';
      const size = info.type === 'file' && 'size' in info ? ` (${info.size})` : '';
      return `${icon} ${name}${size}`;
    });

    addLine('output', items.join('\n'));
  };

  const printWorkingDirectory = () => {
    addLine('output', currentDirectory);
  };

  const whoAmI = () => {
    addLine('output', username);
  };

  const showDate = () => {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    addLine('output', `${dateString} ${timeString}`);
  };

  const showUptime = () => {
    const uptime = Math.floor(Date.now() / 1000) - Math.floor(Date.now() / 1000) % 3600; // Simulate uptime
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    addLine('output', `up ${hours}h ${minutes}m ${seconds}s`);
    addLine('output', `load average: 0.15, 0.08, 0.05`);
  };

  const renameUser = (newName?: string) => {
    if (!newName) {
      addLine('output', 'Usage: rename <new-username>');
      addLine('output', 'Example: rename john');
      return;
    }

    const oldName = username;
    setUsername(newName);
    addLine('output', `Username changed from '${oldName}' to '${newName}'`);
  };

  const goHome = () => {
    addLine('output', '🏠 Returning to home page...');
    addLine('output', 'Saving terminal session...');
    addLine('output', 'Navigating to home page...');
    
    // Simple delay then navigate to trigger landing page return loader
    setTimeout(() => {
      navigate('/?from=terminal');
    }, 1500);
  };

  const commands: Command[] = [
    {
      name: 'help',
      description: 'Show available commands and their usage',
      usage: 'help [command]',
      aliases: ['h', '?'],
      action: () => showHelp()
    },
    {
      name: 'clear',
      description: 'Clear the terminal screen',
      usage: 'clear',
      aliases: ['cls', 'c'],
      action: () => clearTerminal()
    },
    {
      name: 'compiler',
      description: 'Enter compiler mode with full functionality',
      usage: 'compiler',
      aliases: ['comp', 'c'],
      action: () => navigateToMode('compiler')
    },
    {
      name: 'exit',
      description: 'Exit compiler mode and return to terminal',
      usage: 'exit',
      action: () => {
        setShowCompiler(false);
        addLine('output', 'Exited compiler mode');
      }
    },
    {
      name: 'ls',
      description: 'List directory contents',
      usage: 'ls',
      aliases: ['list', 'dir'],
      action: () => listFiles()
    },
    {
      name: 'pwd',
      description: 'Print working directory',
      usage: 'pwd',
      action: () => printWorkingDirectory()
    },
    {
      name: 'whoami',
      description: 'Show current user',
      usage: 'whoami',
      action: () => whoAmI()
    },
    {
      name: 'date',
      description: 'Show current date and time',
      usage: 'date',
      action: () => showDate()
    },
    {
      name: 'uptime',
      description: 'Show system uptime',
      usage: 'uptime',
      action: () => showUptime()
    },
    {
      name: 'rename',
      description: 'Change username',
      usage: 'rename <new-username>',
      action: () => renameUser()
    },
    {
      name: 'home',
      description: 'Return to landing page',
      usage: 'home',
      aliases: ['exit', 'quit'],
      action: () => goHome()
    }
  ];

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    addLine('input', trimmedCommand);
    
    // Add to command history
    setCommandHistory(prev => ({
      commands: [...prev.commands, trimmedCommand],
      currentIndex: -1
    }));

    const [cmd, ...args] = trimmedCommand.split(' ');
    const foundCommand = commands.find(c => 
      c.name === cmd || (c.aliases && c.aliases.includes(cmd))
    );

    if (foundCommand) {
      if (cmd === 'rename') {
        renameUser(args[0]);
      } else {
        foundCommand.action();
      }
    } else {
      addLine('error', `Command not found: ${cmd}. Type 'help' for available commands.`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.currentIndex < commandHistory.commands.length - 1) {
        const newIndex = commandHistory.currentIndex + 1;
        setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
        setCurrentInput(commandHistory.commands[commandHistory.commands.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.currentIndex > 0) {
        const newIndex = commandHistory.currentIndex - 1;
        setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
        setCurrentInput(commandHistory.commands[commandHistory.commands.length - 1 - newIndex]);
      } else {
        setCurrentInput('');
        setCommandHistory(prev => ({ ...prev, currentIndex: -1 }));
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

  // Ensure terminal input remains focused when compiler is open
  useEffect(() => {
    if (inputRef.current && !showCompiler) {
      inputRef.current.focus();
    }
  }, [showCompiler]);

  // Focus terminal input when clicking on terminal section
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalButton color="#ff5f56" hoverColor="#ff3b30" />
        <TerminalButton color="#ffbd2e" hoverColor="#ff9500" />
        <TerminalButton color="#27ca3f" hoverColor="#30d158" />
        <TerminalTitle>Compiler Visualizer Terminal</TerminalTitle>
      </TerminalHeader>
      
      <MainContainer>
        <TerminalSection onClick={handleTerminalClick}>
      <TerminalBody ref={terminalRef}>
        {lines.map((line, index) => (
          <TerminalLine key={line.id} type={line.type}>
            {line.type === 'input' && (
              <>
                    <Prompt>$</Prompt> <User>{username}</User>@<Directory>compiler-visualizer</Directory> {line.content}
              </>
            )}
            {line.type === 'output' && line.content}
            {line.type === 'error' && line.content}
            {line.type === 'system' && line.content}
          </TerminalLine>
        ))}

        <InputLine>
          <Prompt>$</Prompt> <User>{username}</User>@<Directory>compiler-visualizer</Directory> {currentInput}
          <Cursor visible={showCursor && !isTyping}>█</Cursor>
          {showCompiler && (
            <div style={{ 
              color: '#d97706', 
              fontSize: '10px', 
              marginLeft: '8px',
              opacity: 0.7 
            }}>
            </div>
          )}
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
          <StatusDot color={showCompiler ? "#d97706" : "#58a6ff"} />
          <span>{showCompiler ? "Compiler Mode" : "Ready"}</span>
        </StatusItem>
        <StatusItem>
          <span>Commands: {commandHistory.commands.length}</span>
        </StatusItem>
        <StatusItem>
          <span>{showCompiler ? "Type 'exit' to close compiler" : "Press ↑/↓ for history"}</span>
        </StatusItem>
      </StatusBar>
        </TerminalSection>

        {showCompiler && (
          <CompilerSection>
            <CompilerInterface onBack={handleBackToTerminal} />
          </CompilerSection>
        )}
      </MainContainer>
    </TerminalContainer>
  );
};

export default AdvancedTerminal;