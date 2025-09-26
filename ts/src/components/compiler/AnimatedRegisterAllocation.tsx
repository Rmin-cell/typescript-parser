import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface RegisterAllocation {
  variableToRegister: Map<string, string>;
  spilledVariables: Set<string>;
  interferenceGraph: {
    nodes: Set<string>;
    edges: Array<{ from: string; to: string; weight?: number }>;
    nodeColors?: Map<string, number>;
    nodeDegrees?: Map<string, number>;
  };
  allocationSteps: Array<{
    step: number;
    description: string;
    graph?: any;
    color?: number;
    register?: string;
  }>;
}

interface AnimatedRegisterAllocationProps {
  registerAllocation: RegisterAllocation | null;
}

const Container = styled.div`
  padding: 16px;
  background: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
  min-height: 400px;
`;

const Title = styled.div`
  color: #4ec9b0;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 14px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #252526;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
`;

const ControlButton = styled(motion.button)<{ variant: 'primary' | 'secondary' | 'success' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #58a6ff, #7c3aed);
          color: #f0f6fc;
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, #6e7681, #8b949e);
          color: #f0f6fc;
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #4ec9b0, #58a6ff);
          color: #f0f6fc;
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StepInfo = styled.div`
  margin-left: auto;
  font-weight: 600;
  color: #8b949e;
  font-size: 12px;
`;

const VisualizationArea = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 300px;
`;

const GraphContainer = styled.div`
  flex: 1;
  background: #252526;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #3c3c3c;
  position: relative;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #1a1a1a;
  border-radius: 6px;
  border: 1px solid #3c3c3c;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #f0f6fc;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.color};
  border-radius: 2px;
  border: 1px solid #3c3c3c;
`;

const SVGContainer = styled.div`
  width: 100%;
  height: 250px;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
`;

const AllocationSummary = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #252526;
  border-radius: 6px;
  border: 1px solid #3c3c3c;
`;

const SummaryTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #4ec9b0;
  font-size: 12px;
`;

const SummaryContent = styled.div`
  font-size: 11px;
  color: #f0f6fc;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
`;

const StepDetails = styled.div`
  width: 300px;
  background: #252526;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #3c3c3c;
`;

const StepTitle = styled.div`
  font-weight: 600;
  margin-bottom: 12px;
  color: #4ec9b0;
  font-size: 14px;
`;

const StepsList = styled.div`
  max-height: 250px;
  overflow-y: auto;
`;

const StepItem = styled(motion.div)<{ isActive: boolean }>`
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isActive ? 'rgba(78, 201, 176, 0.2)' : '#1a1a1a'};
  border-left: ${props => props.isActive ? '3px solid #4ec9b0' : '3px solid transparent'};
  
  &:hover {
    background: rgba(78, 201, 176, 0.1);
  }
`;

const StepNumber = styled.div`
  font-weight: 600;
  color: #f0f6fc;
  margin-bottom: 2px;
`;

const StepDescription = styled.div`
  color: #8b949e;
  line-height: 1.4;
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

const AnimatedRegisterAllocation: React.FC<AnimatedRegisterAllocationProps> = ({ registerAllocation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];

  useEffect(() => {
    if (registerAllocation) {
      setCurrentStep(0);
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
  }, [registerAllocation]);

  useEffect(() => {
    if (registerAllocation && svgRef.current) {
      renderInterferenceGraph();
    }
  }, [registerAllocation, currentStep]);

  const renderInterferenceGraph = () => {
    if (!registerAllocation || !svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = '';

    const step = registerAllocation.allocationSteps[currentStep];
    const graph = step?.graph || registerAllocation.interferenceGraph;
    
    if (!graph) return;

    const nodes = Array.from(graph.nodes);
    const width = 400;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // Calculate node positions
    const nodePositions = new Map<string, { x: number; y: number }>();
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions.set(node, { x, y });
    });

    // Render edges
    for (const edge of graph.edges) {
      const fromPos = nodePositions.get(edge.from);
      const toPos = nodePositions.get(edge.to);
      
      if (fromPos && toPos) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromPos.x.toString());
        line.setAttribute('y1', fromPos.y.toString());
        line.setAttribute('x2', toPos.x.toString());
        line.setAttribute('y2', toPos.y.toString());
        line.setAttribute('stroke', '#4ec9b0');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.6');
        svg.appendChild(line);
      }
    }

    // Render nodes
    for (const [node, pos] of nodePositions) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', '18');
      
      // Set color based on allocation
      const color = graph.nodeColors?.get(node);
      if (color !== undefined) {
        circle.setAttribute('fill', colors[color % colors.length]);
        circle.setAttribute('stroke', '#f0f6fc');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', '#30363d');
        circle.setAttribute('stroke', '#8b949e');
        circle.setAttribute('stroke-width', '1');
      }
      
      svg.appendChild(circle);

      // Add text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', (pos.y + 4).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#f0f6fc');
      text.textContent = node;
      svg.appendChild(text);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const nextStep = () => {
    if (registerAllocation && currentStep < registerAllocation.allocationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const playAnimation = () => {
    if (!registerAllocation) return;

    setIsPlaying(true);
    setCurrentStep(0);
    
    playIntervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < registerAllocation.allocationSteps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
          }
          return prev;
        }
      });
    }, 1000);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!registerAllocation) {
    return (
      <Container>
        <Title>🎯 Register Allocation</Title>
        <div style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
          No register allocation data
        </div>
      </Container>
    );
  }

  const allocatedVars = Array.from(registerAllocation.variableToRegister.entries());
  const spilledVars = Array.from(registerAllocation.spilledVariables);

  return (
    <Container>
      <Title>🎯 Register Allocation Analysis</Title>
      
      <Controls>
        <ControlButton
          variant="secondary"
          onClick={previousStep}
          disabled={currentStep === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Previous
        </ControlButton>
        
        <ControlButton
          variant="primary"
          onClick={nextStep}
          disabled={currentStep >= registerAllocation.allocationSteps.length - 1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next →
        </ControlButton>
        
        <ControlButton
          variant="success"
          onClick={isPlaying ? stopAnimation : playAnimation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? '⏸ Stop' : '▶ Play'}
        </ControlButton>
        
        <StepInfo>
          Step {currentStep + 1} of {registerAllocation.allocationSteps.length}
        </StepInfo>
      </Controls>

      <VisualizationArea>
        <GraphContainer>
          <Legend>
            {colors.map((color, index) => (
              <LegendItem key={index}>
                <ColorBox color={color} />
                <span>r{index}</span>
              </LegendItem>
            ))}
          </Legend>
          
          <SVGContainer>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 400 200"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </SVGContainer>
          
          <AllocationSummary>
            <SummaryTitle>Allocation Summary</SummaryTitle>
            <SummaryContent>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#4ec9b0' }}>Allocated:</strong><br />
                <span style={{ color: '#4ec9b0' }}>
                  {allocatedVars.length > 0 
                    ? allocatedVars.map(([varName, reg]) => `${varName} → ${reg}`).join(', ')
                    : 'None'
                  }
                </span>
              </div>
              <div>
                <strong style={{ color: '#f85149' }}>Spilled:</strong><br />
                <span style={{ color: '#f85149' }}>
                  {spilledVars.length > 0 ? spilledVars.join(', ') : 'None'}
                </span>
              </div>
            </SummaryContent>
          </AllocationSummary>
        </GraphContainer>

        <StepDetails>
          <StepTitle>Allocation Steps</StepTitle>
          <StepsList>
            <AnimatePresence>
              {registerAllocation.allocationSteps.map((step, index) => (
                <StepItem
                  key={step.step}
                  isActive={index === currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => goToStep(index)}
                  whileHover={{ scale: 1.02 }}
                >
                  <StepNumber>Step {step.step + 1}</StepNumber>
                  <StepDescription>{step.description}</StepDescription>
                </StepItem>
              ))}
            </AnimatePresence>
          </StepsList>
        </StepDetails>
      </VisualizationArea>

      <StatsContainer>
        <StatItem>
          <StatValue>{allocatedVars.length}</StatValue>
          <StatLabel>Allocated</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{spilledVars.length}</StatValue>
          <StatLabel>Spilled</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{registerAllocation.allocationSteps.length}</StatValue>
          <StatLabel>Steps</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.round(((currentStep + 1) / registerAllocation.allocationSteps.length) * 100)}%</StatValue>
          <StatLabel>Progress</StatLabel>
        </StatItem>
      </StatsContainer>
    </Container>
  );
};

export default AnimatedRegisterAllocation;
