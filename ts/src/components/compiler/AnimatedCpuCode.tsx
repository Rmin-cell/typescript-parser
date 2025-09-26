import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface CpuInstruction {
  opcode: string;
  operands: string[];
  [key: string]: any;
}

interface AnimatedCpuCodeProps {
  cpuCode: CpuInstruction[];
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

const InstructionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const InstructionCard = styled(motion.div)<{ opcode: string }>`
  background: ${props => {
    const opcode = props.opcode.toLowerCase();
    if (opcode.includes('load') || opcode.includes('store')) return 'linear-gradient(135deg, #4ec9b0, #58a6ff)';
    if (opcode.includes('add') || opcode.includes('sub') || opcode.includes('mul') || opcode.includes('div')) return 'linear-gradient(135deg, #7c3aed, #58a6ff)';
    if (opcode.includes('cmp') || opcode.includes('test')) return 'linear-gradient(135deg, #ffcc02, #ff9500)';
    if (opcode.includes('jmp') || opcode.includes('call') || opcode.includes('ret')) return 'linear-gradient(135deg, #f85149, #ff6b6b)';
    if (opcode.includes('mov')) return 'linear-gradient(135deg, #58a6ff, #7c3aed)';
    return 'linear-gradient(135deg, #30363d, #21262d)';
  }};
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  
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

const InstructionNumber = styled.div`
  color: #8b949e;
  font-size: 12px;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
`;

const InstructionContent = styled.div`
  flex: 1;
  color: #f0f6fc;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
`;

const Opcode = styled.div`
  color: #58a6ff;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
`;

const Operands = styled.div`
  color: #8b949e;
  font-size: 12px;
  margin-top: 2px;
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

const OpcodeIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color || '#4ec9b0'};
  box-shadow: 0 0 8px ${props => props.color || '#4ec9b0'};
`;

const AssemblyView = styled.div`
  background: #1a1a1a;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #f0f6fc;
  max-height: 150px;
  overflow-y: auto;
`;

const AnimatedCpuCode: React.FC<AnimatedCpuCodeProps> = ({ cpuCode }) => {
  const [visibleInstructions, setVisibleInstructions] = useState<CpuInstruction[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!cpuCode || cpuCode.length === 0) {
      setVisibleInstructions([]);
      setProgress(0);
      setCurrentIndex(0);
      return;
    }

    // Reset state
    setVisibleInstructions([]);
    setProgress(0);
    setCurrentIndex(0);

    // Animate instructions appearing one by one
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex <= cpuCode.length) {
          setVisibleInstructions(cpuCode.slice(0, nextIndex));
          setProgress((nextIndex / cpuCode.length) * 100);
          return nextIndex;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [cpuCode]);

  const getOpcodeColor = (opcode: string) => {
    const op = opcode.toLowerCase();
    if (op.includes('load') || op.includes('store')) return '#4ec9b0';
    if (op.includes('add') || op.includes('sub') || op.includes('mul') || op.includes('div')) return '#7c3aed';
    if (op.includes('cmp') || op.includes('test')) return '#ffcc02';
    if (op.includes('jmp') || op.includes('call') || op.includes('ret')) return '#f85149';
    if (op.includes('mov')) return '#58a6ff';
    return '#6e7681';
  };

  const formatInstruction = (instruction: CpuInstruction, index: number) => {
    const { opcode, operands, ...rest } = instruction;
    const operandStr = operands ? operands.join(', ') : '';
    return `${opcode} ${operandStr}`.trim();
  };

  const opcodes = visibleInstructions.reduce((acc, instruction) => {
    acc[instruction.opcode] = (acc[instruction.opcode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!cpuCode || cpuCode.length === 0) {
    return (
      <Container>
        <Title>💻 CPU Code</Title>
        <div style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
          No CPU code generated
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>💻 CPU Code Generation</Title>
      
      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </ProgressBar>

      <InstructionsList>
        <AnimatePresence>
          {visibleInstructions.map((instruction, index) => (
            <InstructionCard
              key={index}
              opcode={instruction.opcode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <OpcodeIndicator color={getOpcodeColor(instruction.opcode)} />
              <InstructionNumber>{index}</InstructionNumber>
              <InstructionContent>
                <Opcode>{instruction.opcode}</Opcode>
                <Operands>{instruction.operands?.join(', ') || 'No operands'}</Operands>
              </InstructionContent>
            </InstructionCard>
          ))}
        </AnimatePresence>
      </InstructionsList>

      <AssemblyView>
        <div style={{ color: '#4ec9b0', marginBottom: '8px', fontWeight: '600' }}>
          Assembly Output:
        </div>
        {visibleInstructions.map((instruction, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#8b949e' }}>{index.toString().padStart(2, '0')}:</span>
            <span style={{ color: '#58a6ff', marginLeft: '8px' }}>{instruction.opcode}</span>
            <span style={{ color: '#f0f6fc', marginLeft: '8px' }}>
              {instruction.operands?.join(', ') || ''}
            </span>
          </div>
        ))}
      </AssemblyView>

      <StatsContainer>
        <StatItem>
          <StatValue>{visibleInstructions.length}</StatValue>
          <StatLabel>Instructions</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Object.keys(opcodes).length}</StatLabel>
          <StatLabel>Opcodes</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.round(progress)}%</StatValue>
          <StatLabel>Complete</StatLabel>
        </StatItem>
      </StatsContainer>

      {Object.keys(opcodes).length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>Opcode Distribution:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(opcodes).map(([opcode, count]) => (
              <div
                key={opcode}
                style={{
                  background: '#30363d',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#f0f6fc'
                }}
              >
                {opcode}: {count}
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default AnimatedCpuCode;
