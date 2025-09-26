import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Space, List, Divider } from 'antd';
import { CodeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import NeonCubeScene from './NeonCubeScene';

const { Title, Text } = Typography;

// Styled components for the landing page
const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  text-align: center;
  max-width: 1200px;
  width: 100%;
  padding: 60px 40px;
  position: relative;
  z-index: 2;
`;

const Logo = styled(Title)`
  &.ant-typography {
    color: #58a6ff !important;
    font-size: 3.5rem !important;
    font-weight: bold !important;
    margin-bottom: 20px !important;
    text-shadow: 0 0 20px rgba(88, 166, 255, 0.5);
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from {
      text-shadow: 0 0 20px rgba(88, 166, 255, 0.5);
    }
    to {
      text-shadow: 0 0 30px rgba(88, 166, 255, 0.8);
    }
  }
`;

const Subtitle = styled(Text)`
  font-size: 1.3rem;
  color: #8b949e;
  margin-bottom: 30px;
  line-height: 1.6;
  display: block;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const StyledButton = styled(Button)`
  background: linear-gradient(135deg, #58a6ff 0%, #7c3aed 100%);
  border: none;
  height: 50px;
  padding: 0 28px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 12px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(88, 166, 255, 0.3);
  min-width: 160px;
  flex: 1;
  max-width: 200px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(88, 166, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(StyledButton)`
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  }
`;

const BackgroundEffects = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const FloatingCode = styled(motion.div)`
  position: absolute;
  font-family: "Fira Code", monospace;
  white-space: nowrap;
  pointer-events: none;
  font-weight: 500;
  font-size: 13px;
  opacity: 0.8;
  text-shadow: 0 0 8px rgba(88, 166, 255, 0.3);
`;

const LoadingText = styled.div`
  margin-top: 20px;
  color: #8b949e;
  display: none;

  &.show {
    display: block;
  }

  &::after {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #30363d;
    border-radius: 50%;
    border-top-color: #58a6ff;
    animation: spin 1s ease-in-out infinite;
    margin-left: 10px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const TerminalBootContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
`;

const TerminalBootWindow = styled.div`
  width: 80%;
  max-width: 800px;
  height: 60%;
  background: #0d1117;
  border: 2px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(88, 166, 255, 0.3);
  overflow: hidden;
  font-family: 'Fira Code', monospace;
`;

const TerminalHeader = styled.div`
  background: #21262d;
  padding: 12px 20px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TerminalButtons = styled.div`
  display: flex;
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
  font-size: 14px;
  margin-left: 20px;
`;

const TerminalBody = styled.div`
  padding: 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
  background: #0d1117;
`;

const TerminalLine = styled(motion.div)`
  color: #58a6ff;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const TerminalPrompt = styled.span`
  color: #4ec9b0;
  font-weight: bold;
`;

const TerminalCommand = styled.span`
  color: #f0f6fc;
`;

const TerminalOutput = styled.span<{ type: 'success' | 'info' | 'warning' | 'error' }>`
  color: ${props => {
    switch (props.type) {
      case 'success': return '#4ec9b0';
      case 'info': return '#58a6ff';
      case 'warning': return '#ffcc02';
      case 'error': return '#f85149';
      default: return '#8b949e';
    }
  }};
`;

const TerminalCursor = styled.span`
  color: #58a6ff;
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background: #21262d;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 20px;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #58a6ff, #7c3aed, #4ec9b0);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(88, 166, 255, 0.5);
`;

const LoadingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const LoadingStep = styled(motion.div)<{ completed: boolean; active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: ${props => props.active ? 'rgba(88, 166, 255, 0.1)' : 'rgba(33, 38, 45, 0.5)'};
  border: 1px solid ${props => props.active ? '#58a6ff' : props.completed ? '#4ec9b0' : '#30363d'};
  border-radius: 6px;
  transition: all 0.3s ease;
`;

const StepIcon = styled.div<{ completed: boolean; active: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => 
    props.completed ? '#4ec9b0' : 
    props.active ? '#58a6ff' : '#30363d'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  box-shadow: ${props => props.active ? '0 0 8px rgba(88, 166, 255, 0.5)' : 'none'};
`;

const StepText = styled.span<{ completed: boolean; active: boolean }>`
  color: ${props => 
    props.completed ? '#4ec9b0' : 
    props.active ? '#58a6ff' : '#8b949e'
  };
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 13px;
`;

const AboutModalContent = styled.div`
  max-width: 600px;
`;

interface FloatingCodeItem {
  id: number;
  text: string;
  x: number;
  color: string;
  size: number;
  rotation: number;
  lane: number; // Track which lane this code is in
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [floatingCodes, setFloatingCodes] = useState<FloatingCodeItem[]>([]);
  
  // Terminal boot sequence state
  const [showTerminalBoot, setShowTerminalBoot] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  // Return from terminal state
  const [showReturnLoader, setShowReturnLoader] = useState(false);
  const [returnSteps, setReturnSteps] = useState<string[]>([]);
  const [returnProgress, setReturnProgress] = useState(0);

  // Check if returning from terminal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromTerminal = urlParams.get('from') === 'terminal';
    
    if (fromTerminal) {
      setShowReturnLoader(true);
      setReturnProgress(0);
      
      const returnSequence = [
        'Saving terminal session...',
        'Clearing compiler cache...',
        'Preparing landing page...',
        'Loading 3D animations...',
        'Ready to continue...'
      ];
      
      setReturnSteps(returnSequence);
      
      // Simulate return sequence
      returnSequence.forEach((step, index) => {
        setTimeout(() => {
          setReturnProgress(((index + 1) / returnSequence.length) * 100);
        }, index * 600);
      });
      
      // Hide loader after sequence
      setTimeout(() => {
        setShowReturnLoader(false);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }, returnSequence.length * 600 + 1000);
    }
  }, []);

  // Floating code animation with Framer Motion
  useEffect(() => {
    const codeSnippets = [
      "function add(a, b) { return a + b; }",
      "let x = 10;",
      "if (condition) { ... }",
      "while (i < n) { ... }",
      "class Compiler { ... }",
      "const tokens = lexer(input);",
      "const ast = parser(tokens);",
      "const code = generate(ast);",
      "let result = (a + b) * 2;",
      'print "Hello World";',
      "for (let i = 0; i < n; i++)",
      "const variable = value;",
      "function parse() { ... }",
      "return expression;",
      "if (x > 0) { ... }",
      "const array = [1, 2, 3];",
      "class Token { ... }",
      "const node = new Node();",
      "while (true) { ... }",
      "let sum = 0;",
    ];

    // Fixed positions to prevent overlapping
    const fixedPositions = [
      { x: 100, lane: 0 },
      { x: 300, lane: 1 },
      { x: 500, lane: 2 },
      { x: 700, lane: 3 },
    ];
    
    let id = 0;
    let currentLane = 0;
    
    const spawnFloatingCode = () => {
      // Limit maximum number of floating codes
      if (floatingCodes.length >= 6) return;
      
      const colors = [
        'rgba(88, 166, 255, 0.5)',   // Blue - increased opacity
        'rgba(124, 58, 237, 0.5)',   // Purple - increased opacity
        'rgba(78, 201, 176, 0.5)',    // Teal - increased opacity
        'rgba(86, 156, 214, 0.5)',   // Light blue - increased opacity
        'rgba(255, 204, 2, 0.5)',    // Yellow - increased opacity
      ];
      
      // Use fixed positions in sequence
      const position = fixedPositions[currentLane % fixedPositions.length];
      currentLane++;
      
      const newCode: FloatingCodeItem = {
        id: id++,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        x: position.x,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 12 + Math.random() * 4, // Increased size variation
        rotation: Math.random() > 0.5 ? 360 : -360, // Full rotation
        lane: position.lane,
      };

      setFloatingCodes(prev => [...prev, newCode]);

      // Remove after animation completes
      const animationDuration = 25000; // Match the new duration
      setTimeout(() => {
        setFloatingCodes(prev => prev.filter(code => code.id !== newCode.id));
      }, animationDuration);
    };

    const interval = setInterval(spawnFloatingCode, 4000); // Faster spawning for more codes
    return () => clearInterval(interval);
  }, [floatingCodes.length]);

  const handleLaunchTerminal = () => {
    setLoading(true);
    setShowTerminalBoot(true);
    setTerminalLines([]);
    setCurrentStep(0);
    setProgress(0);
    
    // Terminal boot sequence steps
    const bootSteps = [
      {
        command: 'systemctl start compiler-service',
        output: '✓ Compiler service started successfully',
        type: 'success' as const,
        delay: 800
      },
      {
        command: 'export COMPILER_MODE=interactive',
        output: '✓ Environment configured for interactive mode',
        type: 'success' as const,
        delay: 600
      },
      {
        command: './compiler --init',
        output: 'Initializing compiler modules...',
        type: 'info' as const,
        delay: 1000
      },
      {
        command: 'lexer --version',
        output: 'Lexical Analyzer v2.1.0 loaded',
        type: 'info' as const,
        delay: 700
      },
      {
        command: 'parser --version',
        output: 'Parser Engine v1.8.3 loaded',
        type: 'info' as const,
        delay: 700
      },
      {
        command: 'codegen --version',
        output: 'Code Generator v3.2.1 loaded',
        type: 'info' as const,
        delay: 700
      },
      {
        command: 'terminal --start',
        output: 'Terminal interface ready',
        type: 'success' as const,
        delay: 500
      }
    ];

    let stepIndex = 0;
    let totalDelay = 0;

    const executeStep = (step: typeof bootSteps[0]) => {
      setTimeout(() => {
        // Add command line
        setTerminalLines(prev => [...prev, `user@compiler:~$ ${step.command}`]);
        setIsTyping(true);
        
        // Add output after typing delay
        setTimeout(() => {
          setTerminalLines(prev => [...prev, step.output]);
          setIsTyping(false);
          setCurrentStep(stepIndex);
          setProgress(((stepIndex + 1) / bootSteps.length) * 100);
          
          stepIndex++;
          if (stepIndex < bootSteps.length) {
            executeStep(bootSteps[stepIndex]);
          } else {
            // Boot sequence complete
            setTimeout(() => {
              setTerminalLines(prev => [...prev, 'user@compiler:~$ Ready for commands...']);
              setTimeout(() => {
                console.log('Navigating to terminal...');
                try {
                  navigate('/terminal');
                } catch (error) {
                  console.error('Navigation error:', error);
                  // Fallback to window.location
                  window.location.href = '/terminal';
                }
              }, 1000);
            }, 500);
          }
        }, step.delay);
      }, totalDelay);
      
      totalDelay += step.delay + 200;
    };

    // Start the boot sequence
    executeStep(bootSteps[0]);
  };

  const handleShowAbout = () => {
    setIsAboutModalVisible(true);
  };

  const handleAboutModalClose = () => {
    setIsAboutModalVisible(false);
  };

  return (
    <LandingContainer>
      <NeonCubeScene />
      
      {/* Terminal Boot Sequence */}
      <AnimatePresence>
        {showTerminalBoot && (
          <TerminalBootContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TerminalBootWindow>
              <TerminalHeader>
                <TerminalButtons>
                  <TerminalButton color="#f85149" />
                  <TerminalButton color="#ffcc02" />
                  <TerminalButton color="#4ec9b0" />
                </TerminalButtons>
                <TerminalTitle>Compiler Terminal - Boot Sequence</TerminalTitle>
              </TerminalHeader>
              
              <TerminalBody>
                {terminalLines.map((line, index) => (
                  <TerminalLine
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {line.includes('user@compiler:~$') ? (
                      <>
                        <TerminalPrompt>user@compiler:~$</TerminalPrompt>
                        <TerminalCommand>{line.replace('user@compiler:~$ ', '')}</TerminalCommand>
                      </>
                    ) : line.includes('✓') ? (
                      <TerminalOutput type="success">{line}</TerminalOutput>
                    ) : line.includes('Initializing') || line.includes('loaded') ? (
                      <TerminalOutput type="info">{line}</TerminalOutput>
                    ) : (
                      <TerminalOutput type="info">{line}</TerminalOutput>
                    )}
                  </TerminalLine>
                ))}
                
                {isTyping && (
                  <TerminalLine>
                    <TerminalCursor>█</TerminalCursor>
                  </TerminalLine>
                )}
              </TerminalBody>
              
              <ProgressContainer>
                <ProgressBar
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </ProgressContainer>
              
              <LoadingSteps>
                {[
                  'Starting compiler service',
                  'Configuring environment',
                  'Loading lexical analyzer',
                  'Initializing parser engine',
                  'Setting up code generator',
                  'Preparing terminal interface'
                ].map((step, index) => (
                  <LoadingStep
                    key={index}
                    completed={index < currentStep}
                    active={index === currentStep}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StepIcon 
                      completed={index < currentStep} 
                      active={index === currentStep}
                    >
                      {index < currentStep ? '✓' : index + 1}
                    </StepIcon>
                    <StepText 
                      completed={index < currentStep} 
                      active={index === currentStep}
                    >
                      {step}
                    </StepText>
                  </LoadingStep>
                ))}
              </LoadingSteps>
            </TerminalBootWindow>
          </TerminalBootContainer>
        )}
      </AnimatePresence>
      
      {/* Return from Terminal Loader */}
      <AnimatePresence>
        {showReturnLoader && (
          <TerminalBootContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TerminalBootWindow>
              <TerminalHeader>
                <TerminalButtons>
                  <TerminalButton color="#f85149" />
                  <TerminalButton color="#ffcc02" />
                  <TerminalButton color="#4ec9b0" />
                </TerminalButtons>
                <TerminalTitle>Returning to Landing Page</TerminalTitle>
              </TerminalHeader>
              
              <TerminalBody>
                <TerminalLine>
                  <TerminalPrompt>user@compiler:~$</TerminalPrompt>
                  <TerminalCommand>exit</TerminalCommand>
                </TerminalLine>
                <TerminalLine>
                  <TerminalOutput type="success">✓ Terminal session saved</TerminalOutput>
                </TerminalLine>
                <TerminalLine>
                  <TerminalPrompt>user@compiler:~$</TerminalPrompt>
                  <TerminalCommand>home</TerminalCommand>
                </TerminalLine>
                <TerminalLine>
                  <TerminalOutput type="info">🏠 Returning to landing page...</TerminalOutput>
                </TerminalLine>
                <TerminalLine>
                  <TerminalOutput type="info">Loading 3D animations...</TerminalOutput>
                </TerminalLine>
                <TerminalLine>
                  <TerminalOutput type="success">✓ Landing page ready</TerminalOutput>
                </TerminalLine>
              </TerminalBody>
              
              <ProgressContainer>
                <ProgressBar
                  initial={{ width: 0 }}
                  animate={{ width: `${returnProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </ProgressContainer>
              
              <LoadingSteps>
                {returnSteps.map((step, index) => (
                  <LoadingStep
                    key={index}
                    completed={index < Math.floor((returnProgress / 100) * returnSteps.length)}
                    active={index === Math.floor((returnProgress / 100) * returnSteps.length)}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StepIcon 
                      completed={index < Math.floor((returnProgress / 100) * returnSteps.length)} 
                      active={index === Math.floor((returnProgress / 100) * returnSteps.length)}
                    >
                      {index < Math.floor((returnProgress / 100) * returnSteps.length) ? '✓' : index + 1}
                    </StepIcon>
                    <StepText 
                      completed={index < Math.floor((returnProgress / 100) * returnSteps.length)} 
                      active={index === Math.floor((returnProgress / 100) * returnSteps.length)}
                    >
                      {step}
                    </StepText>
                  </LoadingStep>
                ))}
              </LoadingSteps>
            </TerminalBootWindow>
          </TerminalBootContainer>
        )}
      </AnimatePresence>
      
      <BackgroundEffects>
        <AnimatePresence>
          {floatingCodes.map(code => (
            <FloatingCode
              key={code.id}
              style={{ 
                left: code.x,
                color: code.color,
                fontSize: `${code.size}px`,
                textShadow: `0 0 10px ${code.color.replace('0.4)', '0.3)')}`,
              }}
              initial={{ 
                y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
                rotate: 0,
                opacity: 0,
              }}
              animate={{ 
                y: -100,
                rotate: code.rotation,
                opacity: [0, 0.7, 0.7, 0],
                transition: {
                  duration: 25,
                  ease: "linear",
                  opacity: {
                    times: [0, 0.15, 0.85, 1],
                    duration: 25,
                  }
                }
              }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0.5 }
              }}
            >
              {code.text}
            </FloatingCode>
          ))}
        </AnimatePresence>
      </BackgroundEffects>
      
      <ContentWrapper>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Logo level={1}>Compiler Visualizer</Logo>
            <Subtitle>Interactive Compiler Development Environment</Subtitle>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <ButtonContainer>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <StyledButton 
                  type="primary" 
                  icon={<CodeOutlined />}
                  onClick={handleLaunchTerminal}
                  size="large"
                >
                  Terminal
                </StyledButton>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <SecondaryButton 
                  icon={<InfoCircleOutlined />}
                  onClick={handleShowAbout}
                  size="large"
                >
                  About
                </SecondaryButton>
              </motion.div>
            </ButtonContainer>
          </motion.div>

          <LoadingText className={loading ? 'show' : ''}>
            {loadingMessage}
          </LoadingText>
        </Space>
      </ContentWrapper>

      <Modal
        title="🚀 Compiler Visualizer v1.0.0"
        open={isAboutModalVisible}
        onCancel={handleAboutModalClose}
        footer={null}
        width={600}
      >
        <AboutModalContent>
          <Typography.Paragraph>
            An interactive compiler visualization tool built with TypeScript and React. 
            Experience the full compiler pipeline with real-time animations and educational insights.
          </Typography.Paragraph>
          
          <Typography.Title level={4}>🚀 Getting Started</Typography.Title>
          
          <Typography.Paragraph>
            Click "Terminal" to access the interactive interface:
          </Typography.Paragraph>
          
          <List
            size="small"
            dataSource={[
              'Type help to see all available commands',
              'Use compiler to start the full compiler mode', 
              'Type exit to return to this page'
            ]}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text code>{item.split(' ')[0]}</Typography.Text>
                <span style={{ marginLeft: '8px' }}>{item.substring(item.indexOf(' ') + 1)}</span>
              </List.Item>
            )}
          />
          
          <Divider />
          
          <Typography.Text type="secondary">
            <strong>Compiler Visualizer v1.0.0</strong><br />
            Built with TypeScript and React
            Developed by Armin Momeni
          </Typography.Text>
        </AboutModalContent>
      </Modal>
    </LandingContainer>
  );
};

export default LandingPage;
