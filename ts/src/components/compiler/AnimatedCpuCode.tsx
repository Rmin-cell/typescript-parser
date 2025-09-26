import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface CpuInstruction {
  type: string;
  reg?: string;
  value?: string;
  address?: string;
  left?: string;
  right?: string;
  target?: string;
  name?: string;
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

const InstructionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const InstructionCard = styled(motion.div)<{ instructionType: string }>`
  background: ${props => {
    const type = props.instructionType.toLowerCase();
    if (type.includes('load') || type.includes('store')) return 'linear-gradient(135deg, #4ec9b0, #58a6ff)';
    if (type.includes('add') || type.includes('sub') || type.includes('mul') || type.includes('div')) return 'linear-gradient(135deg, #58a6ff, #7c3aed)';
    if (type.includes('jmp') || type.includes('je') || type.includes('jne') || type.includes('jl') || type.includes('jg')) return 'linear-gradient(135deg, #ffcc02, #ff9500)';
    if (type.includes('call') || type.includes('ret')) return 'linear-gradient(135deg, #f85149, #ff6b6b)';
    if (type.includes('label') || type.includes('function')) return 'linear-gradient(135deg, #8b949e, #6e7681)';
    if (type.includes('print')) return 'linear-gradient(135deg, #96ceb4, #4ecdc4)';
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
  margin-bottom: 8px;
`;

const InstructionDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const DetailTag = styled.div<{ type: string }>`
  background: ${props => {
    switch (props.type) {
      case 'register': return 'rgba(78, 201, 176, 0.2)';
      case 'value': return 'rgba(88, 166, 255, 0.2)';
      case 'address': return 'rgba(255, 204, 2, 0.2)';
      case 'target': return 'rgba(248, 81, 73, 0.2)';
      case 'operand': return 'rgba(139, 148, 158, 0.2)';
      default: return 'rgba(139, 148, 158, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'register': return '#4ec9b0';
      case 'value': return '#58a6ff';
      case 'address': return '#ffcc02';
      case 'target': return '#f85149';
      case 'operand': return '#8b949e';
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
  font-size: 16px;
  font-weight: 600;
  color: #4ec9b0;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #8b949e;
  margin-top: 2px;
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
    }, 200);

    return () => clearInterval(interval);
  }, [cpuCode]);

  const formatInstruction = (instruction: CpuInstruction, index: number) => {
    const parts = [];
    
    switch (instruction.type) {
      case 'LOAD':
        parts.push(`LOAD ${instruction.reg}, ${instruction.value}`);
        break;
      case 'STORE':
        parts.push(`STORE ${instruction.reg}, ${instruction.address}`);
        break;
      case 'ADD':
        parts.push(`ADD ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'SUB':
        parts.push(`SUB ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'MUL':
        parts.push(`MUL ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'DIV':
        parts.push(`DIV ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'MOD':
        parts.push(`MOD ${instruction.reg}, ${instruction.left}, ${instruction.right}`);
        break;
      case 'CMP':
        parts.push(`CMP ${instruction.left}, ${instruction.right}`);
        break;
      case 'JE':
        parts.push(`JE ${instruction.target}`);
        break;
      case 'JNE':
        parts.push(`JNE ${instruction.target}`);
        break;
      case 'JL':
        parts.push(`JL ${instruction.target}`);
        break;
      case 'JG':
        parts.push(`JG ${instruction.target}`);
        break;
      case 'JLE':
        parts.push(`JLE ${instruction.target}`);
        break;
      case 'JGE':
        parts.push(`JGE ${instruction.target}`);
        break;
      case 'JMP':
        parts.push(`JMP ${instruction.target}`);
        break;
      case 'CALL':
        parts.push(`CALL ${instruction.target}`);
        break;
      case 'RET':
        parts.push('RET');
        break;
      case 'PUSH':
        parts.push(`PUSH ${instruction.value}`);
        break;
      case 'POP':
        parts.push(`POP ${instruction.reg}`);
        break;
      case 'PRINT':
        parts.push(`PRINT ${instruction.reg}`);
        break;
      case 'LABEL':
        parts.push(`${instruction.name}:`);
        break;
      case 'FUNCTION_START':
        parts.push(`FUNCTION ${instruction.name}:`);
        break;
      case 'FUNCTION_END':
        parts.push('FUNCTION_END');
        break;
      default:
        parts.push(instruction.type);
    }
    
    return parts.join(' ');
  };

  const getInstructionCategory = (instruction: CpuInstruction) => {
    const type = instruction.type.toLowerCase();
    if (type.includes('load') || type.includes('store')) return 'Memory';
    if (type.includes('add') || type.includes('sub') || type.includes('mul') || type.includes('div') || type.includes('mod')) return 'Arithmetic';
    if (type.includes('jmp') || type.includes('je') || type.includes('jne') || type.includes('jl') || type.includes('jg') || type.includes('jle') || type.includes('jge')) return 'Control Flow';
    if (type.includes('call') || type.includes('ret') || type.includes('push') || type.includes('pop')) return 'Function';
    if (type.includes('label') || type.includes('function')) return 'Labels';
    if (type.includes('print')) return 'I/O';
    return 'Other';
  };

  const instructionCategories = visibleInstructions.reduce((acc, instruction) => {
    const category = getInstructionCategory(instruction);
    acc[category] = (acc[category] || 0) + 1;
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

      <InstructionList>
        <AnimatePresence>
          {visibleInstructions.map((instruction, index) => (
            <InstructionCard
              key={index}
              instructionType={instruction.type}
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
                {instruction.reg && <DetailTag type="register">REG: {instruction.reg}</DetailTag>}
                {instruction.value && <DetailTag type="value">VAL: {instruction.value}</DetailTag>}
                {instruction.address && <DetailTag type="address">ADDR: {instruction.address}</DetailTag>}
                {instruction.left && <DetailTag type="operand">LEFT: {instruction.left}</DetailTag>}
                {instruction.right && <DetailTag type="operand">RIGHT: {instruction.right}</DetailTag>}
                {instruction.target && <DetailTag type="target">TARGET: {instruction.target}</DetailTag>}
                {instruction.name && <DetailTag type="operand">NAME: {instruction.name}</DetailTag>}
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

export default AnimatedCpuCode;