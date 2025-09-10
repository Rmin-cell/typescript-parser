import { RegisterAllocation, AllocationStep, InterferenceGraph } from "./register-allocator";

export class RegisterAllocatorVisualizer {
  private svg: SVGElement | null = null;
  private currentStep = 0;
  private allocation: RegisterAllocation | null = null;

  render(container: HTMLElement, allocation: RegisterAllocation): void {
    this.allocation = allocation;
    this.currentStep = 0;
    
    // Clear container
    container.innerHTML = '';
    
    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'register-allocation-container';
    mainContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    `;

    // Create controls
    const controls = this.createControls();
    mainContainer.appendChild(controls);

    // Create visualization area
    const visualizationArea = document.createElement('div');
    visualizationArea.className = 'visualization-area';
    visualizationArea.style.cssText = `
      display: flex;
      gap: 20px;
      min-height: 400px;
    `;

    // Create graph container
    const graphContainer = document.createElement('div');
    graphContainer.className = 'graph-container';
    graphContainer.style.cssText = `
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    // Create legend
    const legend = this.createLegend();
    graphContainer.appendChild(legend);

    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.cssText = `
      width: 100%;
      height: 300px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    `;
    graphContainer.appendChild(this.svg);

    // Create allocation summary
    const summary = this.createAllocationSummary();
    graphContainer.appendChild(summary);

    visualizationArea.appendChild(graphContainer);

    // Create step details
    const stepDetails = this.createStepDetails();
    visualizationArea.appendChild(stepDetails);

    mainContainer.appendChild(visualizationArea);
    container.appendChild(mainContainer);

    // Render initial state
    this.renderCurrentStep();
  }

  private createControls(): HTMLElement {
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    const prevButton = document.createElement('button');
    prevButton.textContent = '← Previous';
    prevButton.className = 'btn btn-secondary';
    prevButton.onclick = () => this.previousStep();

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next →';
    nextButton.className = 'btn btn-primary';
    nextButton.onclick = () => this.nextStep();

    const playButton = document.createElement('button');
    playButton.textContent = '▶ Play';
    playButton.className = 'btn btn-success';
    playButton.onclick = () => this.playAnimation();

    const stepInfo = document.createElement('span');
    stepInfo.className = 'step-info';
    stepInfo.style.cssText = `
      margin-left: auto;
      font-weight: bold;
      color: #666;
    `;

    controls.appendChild(prevButton);
    controls.appendChild(nextButton);
    controls.appendChild(playButton);
    controls.appendChild(stepInfo);

    // Store references for updates
    (controls as any).stepInfo = stepInfo;
    (controls as any).prevButton = prevButton;
    (controls as any).nextButton = nextButton;

    return controls;
  }

  private createLegend(): HTMLElement {
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.style.cssText = `
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 12px;
    `;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    
    colors.forEach((color, index) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
      `;
      
      const colorBox = document.createElement('div');
      colorBox.style.cssText = `
        width: 12px;
        height: 12px;
        background: ${color};
        border-radius: 2px;
        border: 1px solid #ccc;
      `;
      
      const label = document.createElement('span');
      label.textContent = `r${index}`;
      
      item.appendChild(colorBox);
      item.appendChild(label);
      legend.appendChild(item);
    });

    return legend;
  }

  private createAllocationSummary(): HTMLElement {
    const summary = document.createElement('div');
    summary.className = 'allocation-summary';
    summary.style.cssText = `
      margin-top: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 12px;
    `;

    const title = document.createElement('div');
    title.textContent = 'Register Allocation Summary';
    title.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    `;

    const content = document.createElement('div');
    content.className = 'summary-content';

    summary.appendChild(title);
    summary.appendChild(content);

    return summary;
  }

  private createStepDetails(): HTMLElement {
    const details = document.createElement('div');
    details.className = 'step-details';
    details.style.cssText = `
      width: 300px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    const title = document.createElement('h3');
    title.textContent = 'Allocation Steps';
    title.style.cssText = `
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
    `;

    const stepsList = document.createElement('div');
    stepsList.className = 'steps-list';
    stepsList.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
    `;

    details.appendChild(title);
    details.appendChild(stepsList);

    return details;
  }

  private renderCurrentStep(): void {
    if (!this.allocation || !this.svg) return;

    const step = this.allocation.allocationSteps[this.currentStep];
    const graph = step ? step.graph : this.allocation.interferenceGraph;

    // Clear SVG
    this.svg.innerHTML = '';

    // Render graph
    this.renderInterferenceGraph(graph);

    // Update controls
    this.updateControls();

    // Update step details
    this.updateStepDetails();

    // Update allocation summary
    this.updateAllocationSummary();
  }

  private renderInterferenceGraph(graph: InterferenceGraph): void {
    if (!this.svg) return;

    const nodes = Array.from(graph.nodes);
    const width = this.svg.clientWidth || 400;
    const height = this.svg.clientHeight || 300;
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
        line.setAttribute('stroke', '#ccc');
        line.setAttribute('stroke-width', '2');
        this.svg.appendChild(line);
      }
    }

    // Render nodes
    for (const [node, pos] of nodePositions) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', '20');
      
      // Set color based on allocation
      const color = graph.nodeColors.get(node);
      if (color !== undefined) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        circle.setAttribute('fill', colors[color % colors.length]);
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', '#f0f0f0');
        circle.setAttribute('stroke', '#999');
        circle.setAttribute('stroke-width', '1');
      }
      
      this.svg.appendChild(circle);

      // Add text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', (pos.y + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#333');
      text.textContent = node;
      this.svg.appendChild(text);
    }
  }

  private updateControls(): void {
    const controls = document.querySelector('.controls') as any;
    if (!controls || !this.allocation) return;

    const stepInfo = controls.stepInfo;
    const prevButton = controls.prevButton;
    const nextButton = controls.nextButton;

    stepInfo.textContent = `Step ${this.currentStep + 1} of ${this.allocation.allocationSteps.length}`;
    
    prevButton.disabled = this.currentStep === 0;
    nextButton.disabled = this.currentStep >= this.allocation.allocationSteps.length - 1;
  }

  private updateStepDetails(): void {
    const stepsList = document.querySelector('.steps-list');
    if (!stepsList || !this.allocation) return;

    stepsList.innerHTML = '';

    this.allocation.allocationSteps.forEach((step, index) => {
      const stepDiv = document.createElement('div');
      stepDiv.style.cssText = `
        padding: 8px 12px;
        margin: 2px 0;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        ${index === this.currentStep ? 'background: #e3f2fd; border-left: 3px solid #2196f3;' : 'background: #f5f5f5;'}
      `;

      stepDiv.innerHTML = `
        <div style="font-weight: bold; color: #333;">Step ${step.step + 1}</div>
        <div style="color: #666; margin-top: 2px;">${step.description}</div>
      `;

      stepDiv.onclick = () => {
        this.currentStep = index;
        this.renderCurrentStep();
      };

      stepsList.appendChild(stepDiv);
    });
  }

  private updateAllocationSummary(): void {
    const summaryContent = document.querySelector('.summary-content');
    if (!summaryContent || !this.allocation) return;

    const allocated = Array.from(this.allocation.variableToRegister.entries())
      .map(([varName, reg]) => `${varName} → ${reg}`)
      .join(', ');

    const spilled = Array.from(this.allocation.spilledVariables).join(', ');

    summaryContent.innerHTML = `
      <div style="margin-bottom: 8px;">
        <strong>Allocated:</strong><br>
        <span style="color: #4caf50;">${allocated || 'None'}</span>
      </div>
      <div>
        <strong>Spilled:</strong><br>
        <span style="color: #f44336;">${spilled || 'None'}</span>
      </div>
    `;
  }

  private previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderCurrentStep();
    }
  }

  private nextStep(): void {
    if (this.allocation && this.currentStep < this.allocation.allocationSteps.length - 1) {
      this.currentStep++;
      this.renderCurrentStep();
    }
  }

  private playAnimation(): void {
    if (!this.allocation) return;

    this.currentStep = 0;
    const interval = setInterval(() => {
      if (this.currentStep < this.allocation!.allocationSteps.length - 1) {
        this.currentStep++;
        this.renderCurrentStep();
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }
}
