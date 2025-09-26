import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface CFGBlock {
  id: string;
  instructions: any[];
  successors: string[];
  predecessors: string[];
}

interface AnimatedCFGProps {
  cfg: any;
}

const Container = styled.div`
  padding: 16px;
  background: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
  min-height: 300px;
`;

const Title = styled.div`
  color: #4ec9b0;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 14px;
`;

const CFGVisualization = styled.div`
  position: relative;
  background: #252526;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  min-height: 200px;
  overflow: hidden;
`;

const BlockNode = styled(motion.div)<{ isEntry: boolean; isExit: boolean }>`
  position: absolute;
  background: ${props => {
    if (props.isEntry) return 'linear-gradient(135deg, #4ec9b0, #58a6ff)';
    if (props.isExit) return 'linear-gradient(135deg, #f85149, #ff6b6b)';
    return 'linear-gradient(135deg, #58a6ff, #7c3aed)';
  }};
  border-radius: 8px;
  padding: 12px;
  min-width: 120px;
  min-height: 60px;
  border: 2px solid ${props => {
    if (props.isEntry) return '#4ec9b0';
    if (props.isExit) return '#f85149';
    return '#58a6ff';
  }};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
`;

const BlockId = styled.div`
  color: #f0f6fc;
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 4px;
  text-align: center;
`;

const BlockInstructions = styled.div`
  color: #f0f6fc;
  font-size: 10px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  text-align: center;
  opacity: 0.8;
`;

const Edge = styled(motion.line)`
  stroke: #4ec9b0;
  stroke-width: 2;
  fill: none;
  marker-end: url(#arrowhead);
`;

const ArrowMarker = styled.defs`
  marker {
    viewBox: "0 0 10 10";
    refX: "9";
    refY: "3";
    markerWidth: "6";
    markerHeight: "6";
    orient: "auto";
  }
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

const BlockDetails = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #252526;
  border-radius: 6px;
  border: 1px solid #3c3c3c;
`;

const AnimatedCFG: React.FC<AnimatedCFGProps> = ({ cfg }) => {
  const [visibleBlocks, setVisibleBlocks] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!cfg || !cfg.blocks || cfg.blocks.size === 0) {
      setVisibleBlocks([]);
      setProgress(0);
      setCurrentIndex(0);
      return;
    }

    const blockIds = Array.from(cfg.blocks.keys());
    
    // Reset state
    setVisibleBlocks([]);
    setProgress(0);
    setCurrentIndex(0);

    // Animate blocks appearing one by one
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex <= blockIds.length) {
          setVisibleBlocks(blockIds.slice(0, nextIndex));
          setProgress((nextIndex / blockIds.length) * 100);
          return nextIndex;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 400);

    return () => clearInterval(interval);
  }, [cfg]);

  const getBlockPosition = (blockId: string, index: number) => {
    const totalBlocks = cfg?.blocks?.size || 0;
    const cols = Math.ceil(Math.sqrt(totalBlocks));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      x: 50 + col * 180,
      y: 50 + row * 120
    };
  };

  const renderEdges = () => {
    if (!cfg?.edges) return null;

    return cfg.edges.map((edge: any, index: number) => {
      const fromBlock = cfg.blocks.get(edge.from);
      const toBlock = cfg.blocks.get(edge.to);
      
      if (!fromBlock || !toBlock) return null;

      const fromIndex = Array.from(cfg.blocks.keys()).indexOf(edge.from);
      const toIndex = Array.from(cfg.blocks.keys()).indexOf(edge.to);
      
      const fromPos = getBlockPosition(edge.from, fromIndex);
      const toPos = getBlockPosition(edge.to, toIndex);

      return (
        <Edge
          key={`${edge.from}-${edge.to}`}
          x1={fromPos.x + 60}
          y1={fromPos.y + 30}
          x2={toPos.x + 60}
          y2={toPos.y + 30}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
        />
      );
    });
  };

  if (!cfg || !cfg.blocks || cfg.blocks.size === 0) {
    return (
      <Container>
        <Title>🔄 Control Flow Graph</Title>
        <div style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
          No CFG generated
        </div>
      </Container>
    );
  }

  const blocks = Array.from(cfg.blocks.entries());
  const totalBlocks = blocks.length;
  const totalEdges = cfg.edges?.length || 0;

  return (
    <Container>
      <Title>🔄 Control Flow Graph Analysis</Title>
      
      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </ProgressBar>

      <CFGVisualization>
        <svg
          ref={svgRef}
          width="100%"
          height="300"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <ArrowMarker>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#4ec9b0"
                />
              </marker>
            </defs>
          </ArrowMarker>
          {renderEdges()}
        </svg>

        <AnimatePresence>
          {blocks.map(([blockId, block], index) => {
            if (!visibleBlocks.includes(blockId)) return null;
            
            const position = getBlockPosition(blockId, index);
            const isEntry = blockId === cfg.entryBlock;
            const isExit = cfg.exitBlocks?.includes(blockId);
            
            return (
              <BlockNode
                key={blockId}
                isEntry={isEntry}
                isExit={isExit}
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                onClick={() => setSelectedBlock(selectedBlock === blockId ? null : blockId)}
                style={{
                  left: position.x,
                  top: position.y,
                  zIndex: isEntry ? 10 : isExit ? 10 : 5
                }}
              >
                <BlockId>
                  {isEntry && '🚀 '}
                  {isExit && '🏁 '}
                  Block {blockId}
                </BlockId>
                <BlockInstructions>
                  {block.instructions?.length || 0} instructions
                </BlockInstructions>
              </BlockNode>
            );
          })}
        </AnimatePresence>
      </CFGVisualization>

      {selectedBlock && (
        <BlockDetails>
          <div style={{ color: '#4ec9b0', fontWeight: '600', marginBottom: '8px' }}>
            Block {selectedBlock} Details:
          </div>
          <div style={{ color: '#f0f6fc', fontSize: '12px', fontFamily: "'Fira Code', monospace" }}>
            {JSON.stringify(cfg.blocks.get(selectedBlock), null, 2)}
          </div>
        </BlockDetails>
      )}

      <StatsContainer>
        <StatItem>
          <StatValue>{visibleBlocks.length}</StatValue>
          <StatLabel>Blocks</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{totalEdges}</StatValue>
          <StatLabel>Edges</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.round(progress)}%</StatValue>
          <StatLabel>Complete</StatLabel>
        </StatItem>
      </StatsContainer>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>CFG Properties:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{
            background: '#30363d',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#f0f6fc'
          }}>
            Entry: {cfg.entryBlock || 'N/A'}
          </div>
          <div style={{
            background: '#30363d',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#f0f6fc'
          }}>
            Exits: {cfg.exitBlocks?.join(', ') || 'N/A'}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AnimatedCFG;