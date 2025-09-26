import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface Symbol {
  name: string;
  type: string;
  scope: string;
  value?: any;
}

interface AnimatedSymbolTableProps {
  symbolTable: any;
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

const SymbolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const SymbolCard = styled(motion.div)<{ symbolType: string }>`
  background: ${props => {
    const type = props.symbolType.toLowerCase();
    if (type.includes('variable')) return 'linear-gradient(135deg, #4ec9b0, #58a6ff)';
    if (type.includes('function')) return 'linear-gradient(135deg, #58a6ff, #7c3aed)';
    if (type.includes('parameter')) return 'linear-gradient(135deg, #ffcc02, #ff9500)';
    if (type.includes('constant')) return 'linear-gradient(135deg, #f85149, #ff6b6b)';
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

const SymbolName = styled.div`
  color: #f0f6fc;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
`;

const SymbolType = styled.div`
  color: #f0f6fc;
  font-size: 12px;
  margin-bottom: 4px;
  opacity: 0.8;
`;

const SymbolScope = styled.div`
  color: #8b949e;
  font-size: 10px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SymbolValue = styled.div`
  color: #4ec9b0;
  font-size: 11px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  background: rgba(78, 201, 176, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
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

const AnimatedSymbolTable: React.FC<AnimatedSymbolTableProps> = ({ symbolTable }) => {
  const [visibleSymbols, setVisibleSymbols] = useState<Symbol[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!symbolTable || Object.keys(symbolTable).length === 0) {
      setVisibleSymbols([]);
      setProgress(0);
      setCurrentIndex(0);
      return;
    }

    // Convert symbol table to array format
    const symbols: Symbol[] = Object.entries(symbolTable).map(([name, data]: [string, any]) => ({
      name,
      type: data.type || 'variable',
      scope: data.scope || 'global',
      value: data.value
    }));

    // Reset state
    setVisibleSymbols([]);
    setProgress(0);
    setCurrentIndex(0);

    // Animate symbols appearing one by one
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex <= symbols.length) {
          setVisibleSymbols(symbols.slice(0, nextIndex));
          setProgress((nextIndex / symbols.length) * 100);
          return nextIndex;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 200);

    return () => clearInterval(interval);
  }, [symbolTable]);

  const getSymbolTypeColor = (symbolType: string) => {
    const type = symbolType.toLowerCase();
    if (type.includes('variable')) return '#4ec9b0';
    if (type.includes('function')) return '#58a6ff';
    if (type.includes('parameter')) return '#ffcc02';
    if (type.includes('constant')) return '#f85149';
    return '#6e7681';
  };

  const getSymbolCategory = (symbolType: string) => {
    const type = symbolType.toLowerCase();
    if (type.includes('variable')) return 'Variables';
    if (type.includes('function')) return 'Functions';
    if (type.includes('parameter')) return 'Parameters';
    if (type.includes('constant')) return 'Constants';
    return 'Other';
  };

  const symbolCategories = visibleSymbols.reduce((acc, symbol) => {
    const category = getSymbolCategory(symbol.type);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!symbolTable || Object.keys(symbolTable).length === 0) {
    return (
      <Container>
        <Title>📊 Symbol Table</Title>
        <div style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
          No symbols found
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📊 Symbol Table Analysis</Title>
      
      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </ProgressBar>

      <SymbolGrid>
        <AnimatePresence>
          {visibleSymbols.map((symbol, index) => (
            <SymbolCard
              key={symbol.name}
              symbolType={symbol.type}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <SymbolName>{symbol.name}</SymbolName>
              <SymbolType>Type: {symbol.type}</SymbolType>
              <SymbolScope>Scope: {symbol.scope}</SymbolScope>
              {symbol.value !== undefined && (
                <SymbolValue>Value: {JSON.stringify(symbol.value)}</SymbolValue>
              )}
            </SymbolCard>
          ))}
        </AnimatePresence>
      </SymbolGrid>

      <StatsContainer>
        <StatItem>
          <StatValue>{visibleSymbols.length}</StatValue>
          <StatLabel>Total Symbols</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Object.keys(symbolCategories).length}</StatValue>
          <StatLabel>Categories</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.round(progress)}%</StatValue>
          <StatLabel>Complete</StatLabel>
        </StatItem>
      </StatsContainer>

      {Object.keys(symbolCategories).length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>Symbol Categories:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(symbolCategories).map(([category, count]) => (
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

export default AnimatedSymbolTable;