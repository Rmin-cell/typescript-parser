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
  background: #1e293b;
  border-radius: 8px;
  border: 1px solid #334155;
  min-height: 200px;
`;

const Title = styled.div`
  color: #3b82f6;
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
    if (type.includes('variable')) return 'linear-gradient(135deg, #10b981, #059669)';
    if (type.includes('function')) return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    if (type.includes('parameter')) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (type.includes('constant')) return 'linear-gradient(135deg, #ef4444, #dc2626)';
    return 'linear-gradient(135deg, #475569, #334155)';
  }};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #334155;
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
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const SymbolType = styled.div`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const SymbolScope = styled.div`
  color: #e2e8f0;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const SymbolValue = styled.div`
  color: #ffffff;
  font-size: 11px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-weight: 600;
  background: rgba(37, 99, 235, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #334155;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 2px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px;
  background: #0f172a;
  border-radius: 6px;
  border: 1px solid #334155;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #f8fafc;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #3b82f6;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #94a3b8;
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
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
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