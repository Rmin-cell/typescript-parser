import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Space } from 'antd';
import { CodeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
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

const AboutModalContent = styled.div`
  text-align: left;
  max-width: 600px;
  line-height: 1.6;

  h2 {
    color: #58a6ff;
    margin-bottom: 20px;
    text-align: center;
  }

  h3 {
    color: #7c3aed;
    margin-bottom: 15px;
  }

  p {
    margin-bottom: 20px;
    color: #f0f6fc;
  }

  ul {
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
  }

  li {
    margin: 6px 0;
    padding-left: 20px;
    position: relative;
    color: #f0f6fc;

    &::before {
      content: "•";
      color: #4ec9b0;
      position: absolute;
      left: 0;
    }
  }

  code {
    background: #252526;
    padding: 2px 6px;
    border-radius: 4px;
    color: #58a6ff;
  }
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
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [floatingCodes, setFloatingCodes] = useState<FloatingCodeItem[]>([]);

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
    setLoadingMessage('Launching terminal...');
    setTimeout(() => {
      window.location.href = '/terminal.html';
    }, 1000);
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
        title="Compiler Visualizer v1.0.0"
        open={isAboutModalVisible}
        onCancel={handleAboutModalClose}
        footer={null}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{ 
          background: '#1e1e1e', 
          color: '#f0f6fc',
          border: '2px solid #30363d',
          borderRadius: '12px'
        }}
      >
        <AboutModalContent>
          <p>
            A comprehensive compiler implementation built with TypeScript, 
            featuring lexical analysis, parsing, intermediate code generation, and visualization tools.
          </p>
          
          <h3>🖥️ How to Use</h3>
          <p>Click "Terminal" to access the interactive terminal interface where you can:</p>
          
          <ul>
            <li>
              Type <code>help</code> to see all available commands
            </li>
            <li>
              Use <code>compiler</code> to start the full compiler mode
            </li>
            <li>
              Type <code>exit</code> to return to this page
            </li>
          </ul>
          
          <p style={{ marginBottom: 0, color: '#8b949e', fontSize: '0.9rem', textAlign: 'center' }}>
            Built with TypeScript and React,<br />
            Developed by Armin Momeni
          </p>
        </AboutModalContent>
      </Modal>
    </LandingContainer>
  );
};

export default LandingPage;
