import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Token {
  tokenType: {
    name: string;
  };
  image: string;
  startOffset: number;
  endOffset: number;
}

interface AnimatedTokensProps {
  tokens: Token[];
}

const Container = styled.div`
  padding: 16px;
  background: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
  min-height: 200px;
`;

const Title = styled.div`
  color: #4ec9b0;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 14px;
`;

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const TokenCard = styled(motion.div)<{ tokenType: string }>`
  background: ${props => {
    const type = props.tokenType.toLowerCase();
    if (type.includes('keyword')) return 'linear-gradient(135deg, #58a6ff, #7c3aed)';
    if (type.includes('identifier')) return 'linear-gradient(135deg, #4ec9b0, #58a6ff)';
    if (type.includes('literal')) return 'linear-gradient(135deg, #ffcc02, #ff9500)';
    if (type.includes('operator')) return 'linear-gradient(135deg, #f85149, #ff6b6b)';
    if (type.includes('punctuation')) return 'linear-gradient(135deg, #8b949e, #6e7681)';
    return 'linear-gradient(135deg, #30363d, #21262d)';
  }};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const TokenType = styled.div`
  color: #f0f6fc;
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TokenValue = styled.div`
  color: #f0f6fc;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  word-break: break-all;
`;

const TokenPosition = styled.div`
  color: #8b949e;
  font-size: 10px;
  margin-top: 4px;
  opacity: 0.7;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #30363d;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #4ec9b0, #58a6ff);
  border-radius: 2px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px;
  background: #252526;
  border-radius: 6px;
  border: 1px solid #3c3c3c;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #f0f6fc;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #4ec9b0;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #8b949e;
  margin-top: 2px;
`;

const AnimatedTokens: React.FC<AnimatedTokensProps> = ({ tokens }) => {
  const [visibleTokens, setVisibleTokens] = useState<Token[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (tokens.length === 0) {
      setVisibleTokens([]);
      setProgress(0);
      setCurrentIndex(0);
      return;
    }

    // Reset state
    setVisibleTokens([]);
    setProgress(0);
    setCurrentIndex(0);

    // Animate tokens appearing one by one
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex <= tokens.length) {
          setVisibleTokens(tokens.slice(0, nextIndex));
          setProgress((nextIndex / tokens.length) * 100);
          return nextIndex;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 150);

    return () => clearInterval(interval);
  }, [tokens]);

  const getTokenTypeColor = (tokenType: string) => {
    const type = tokenType.toLowerCase();
    if (type.includes('keyword')) return '#58a6ff';
    if (type.includes('identifier')) return '#4ec9b0';
    if (type.includes('literal')) return '#ffcc02';
    if (type.includes('operator')) return '#f85149';
    if (type.includes('punctuation')) return '#8b949e';
    return '#6e7681';
  };

  const getTokenCategory = (tokenType: string) => {
    const type = tokenType.toLowerCase();
    if (type.includes('keyword')) return 'Keywords';
    if (type.includes('identifier')) return 'Identifiers';
    if (type.includes('literal')) return 'Literals';
    if (type.includes('operator')) return 'Operators';
    if (type.includes('punctuation')) return 'Punctuation';
    return 'Other';
  };

  const tokenCategories = visibleTokens.reduce((acc, token) => {
    const category = getTokenCategory(token.tokenType.name);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (tokens.length === 0) {
    return (
      <Container>
        <Title>🔍 Tokens</Title>
        <div style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
          No tokens generated
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🔍 Lexical Analysis - Tokens</Title>
      
      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </ProgressBar>

      <TokenGrid>
        <AnimatePresence>
          {visibleTokens.map((token, index) => (
            <TokenCard
              key={`${token.startOffset}-${token.endOffset}`}
              tokenType={token.tokenType.name}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <TokenType>{token.tokenType.name}</TokenType>
              <TokenValue>"{token.image}"</TokenValue>
              <TokenPosition>
                Position: {token.startOffset}-{token.endOffset}
              </TokenPosition>
            </TokenCard>
          ))}
        </AnimatePresence>
      </TokenGrid>

      <StatsContainer>
        <StatItem>
          <StatValue>{visibleTokens.length}</StatValue>
          <StatLabel>Total Tokens</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Object.keys(tokenCategories).length}</StatValue>
          <StatLabel>Categories</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.round(progress)}%</StatValue>
          <StatLabel>Complete</StatLabel>
        </StatItem>
      </StatsContainer>

      {Object.keys(tokenCategories).length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>Token Categories:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(tokenCategories).map(([category, count]) => (
              <div
                key={category}
                style={{
                  background: '#30363d',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#f0f6fc'
                }}
              >
                {category}: {count}
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default AnimatedTokens;
