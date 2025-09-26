import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface ThreeAddressInstruction {
  type: string;
  op?: string;
  arg1?: string;
  arg2?: string;
  result?: string;
  label?: string;
}

interface AnimatedThreeAddressCodeProps {
  threeAddressCode: ThreeAddressInstruction[];
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

const InstructionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const InstructionCard = styled(motion.div)<{ instructionType: string }>`
  background: ${props => {
    const type = props.instructionType.toLowerCase();
    if (type.includes('assign')) return 'linear-gradient(135deg, #4ec9b0, #58a6ff)';
    if (type.includes('arithmetic')) return 'linear-gradient(135deg, #58a6ff, #7c3aed)';
    if (type.includes('jump')) return 'linear-gradient(135deg, #ffcc02, #ff9500)';
    if (type.includes('label')) return 'linear-gradient(135deg, #f85149, #ff6b6b)';
    if (type.includes('function')) return 'linear-gradient(135deg, #8b949e, #6e7681)';
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

const InstructionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const InstructionIndex = styled.div`
  color: #8b949e;
  font-size: 12px;
  font-weight: 600;
  background: rgba(139, 148, 158, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
`;

const InstructionType = styled.div`
  color: #f0f6fc;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InstructionContent = styled.div`
  color: #f0f6fc;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
`;

const InstructionDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const DetailTag = styled.div<{ type: string }>`
  background: ${props => {
    switch (props.type) {
      case 'op': return 'rgba(88, 166, 255, 0.2)';
      case 'arg': return 'rgba(78, 201, 176, 0.2)';
      case 'result': return 'rgba(255, 204, 2, 0.2)';
      case 'label': return 'rgba(248, 81, 73, 0.2)';
      default: return 'rgba(139, 148, 158, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'op': return '#58a6ff';
      case 'arg': return '#4ec9b0';
      case 'result': return '#ffcc02';
      case 'label': return '#f85149';
      default: return '#8b949e';
    }
  }};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
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

const AnimatedThreeAddressCode: React.FC<AnimatedThreeAddressCodeProps> = ({ threeAddressCode }) => {
  const [visibleInstructions, setVisibleInstructions] = useState<ThreeAddressInstruction[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!threeAddressCode || threeAddressCode.length === 0) {
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
        if (nextIndex <= threeAddressCode.length) {
          setVisibleInstructions(threeAddressCode.slice(0, nextIndex));
          setProgress((nextIndex / threeAddressCode.length) * 100);
          return nextIndex;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 300);

    return () => clearInterval(interval);
  }, [threeAddressCode]);

  const getInstructionType = (instruction: ThreeAddressInstruction) => {
    if (instruction.type === 'ASSIGN') return 'assign';
    if (instruction.type === 'ARITHMETIC') return 'arithmetic';
    if (instruction.type === 'JUMP') return 'jump';
    if (instruction.type === 'LABEL') return 'label';
    if (instruction.type === 'FUNCTION') return 'function';
    return 'other';
  };

  const formatInstruction = (instruction: ThreeAddressInstruction, index: number) => {
    const parts = [];
    
    if (instruction.label) {
      parts.push(`L${instruction.label}:`);
    }
    
    if (instruction.type === 'ASSIGN') {
      parts.push(`${instruction.result} = ${instruction.arg1}`);
    } else if (instruction.type === 'ARITHMETIC') {
      parts.push(`${instruction.result} = ${instruction.arg1} ${instruction.op} ${instruction.arg2}`);
    } else if (instruction.type === 'JUMP') {
      parts.push(`goto L${instruction.arg1}`);
    } else if (instruction.type === 'FUNCTION') {
      parts.push(`${instruction.op} ${instruction.arg1}`);
    }
    
    return parts.join(' ');
  };

  const getInstructionCategory = (instruction: ThreeAddressInstruction) => {
    if (instruction.type === 'ASSIGN') return 'Assignments';
    if (instruction.type === 'ARITHMETIC') return 'Arithmetic';
    if (instruction.type === 'JUMP') return 'Jumps';
    if (instruction.type === 'LABEL') return 'Labels';
    if (instruction.type === 'FUNCTION') return 'Functions';
    return 'Other';
  };

  const instructionCategories = visibleInstructions.reduce((acc, instruction) => {
    const category = getInstructionCategory(instruction);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!threeAddressCode || threeAddressCode.length === 0) {
    return (
      <Container>
        <Title>🔢 Three-Address Code</Title>
        <div style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
          No three-address code generated
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🔢 Three-Address Code Generation</Title>
      
      <ProgressBar>
        <ProgressFill
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </ProgressBar>

      <InstructionList>
        <AnimatePresence>
          {visibleInstructions.map((instruction, index) => (
            <InstructionCard
              key={index}
              instructionType={getInstructionType(instruction)}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
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
              <InstructionHeader>
                <InstructionIndex>{index}</InstructionIndex>
                <InstructionType>{instruction.type}</InstructionType>
              </InstructionHeader>
              
              <InstructionContent>
                {formatInstruction(instruction, index)}
              </InstructionContent>
              
              <InstructionDetails>
                {instruction.op && <DetailTag type="op">OP: {instruction.op}</DetailTag>}
                {instruction.arg1 && <DetailTag type="arg">ARG1: {instruction.arg1}</DetailTag>}
                {instruction.arg2 && <DetailTag type="arg">ARG2: {instruction.arg2}</DetailTag>}
                {instruction.result && <DetailTag type="result">RESULT: {instruction.result}</DetailTag>}
                {instruction.label && <DetailTag type="label">LABEL: {instruction.label}</DetailTag>}
              </InstructionDetails>
            </InstructionCard>
          ))}
        </AnimatePresence>
      </InstructionList>

      <StatsContainer>
        <StatItem>
          <StatValue>{visibleInstructions.length}</StatValue>
          <StatLabel>Instructions</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Object.keys(instructionCategories).length}</StatValue>
          <StatLabel>Categories</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.round(progress)}%</StatValue>
          <StatLabel>Complete</StatLabel>
        </StatItem>
      </StatsContainer>

      {Object.keys(instructionCategories).length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>Instruction Categories:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(instructionCategories).map(([category, count]) => (
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

export default AnimatedThreeAddressCode;