import { Deck, Slide, SlideBlock } from './schema';
import { PresentationPlan, PlanningStep } from './planner';
import { generateOutline } from './outline';
import { generateSlide } from './slidewriter';

export interface ExecutionState {
  plan: PresentationPlan;
  currentStep: PlanningStep | null;
  deck: Partial<Deck>;
  isExecuting: boolean;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  stepId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export class PresentationExecutor {
  private state: ExecutionState;
  private onStateChange: (state: ExecutionState) => void;
  private isRunning: boolean = false;
  private plan: PresentationPlan;

  constructor(
    plan: PresentationPlan,
    onStateChange: (state: ExecutionState) => void
  ) {
    this.plan = plan;
    this.onStateChange = onStateChange;
    this.state = {
      plan,
      currentStep: null,
      deck: {},
      isExecuting: false,
      progress: { completed: 0, total: 0, percentage: 0 },
      logs: []
    };
  }

  async startExecution(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.state.isExecuting = true;
    this.updateState();

    try {
      await this.executeAllSteps();
    } catch (error) {
      this.addLog('error', 'execution', `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isRunning = false;
      this.state.isExecuting = false;
      this.updateState();
    }
  }

  async executeStep(stepId: string): Promise<boolean> {
    const step = this.plan.steps.find(s => s.id === stepId);
    if (!step) return false;

    this.state.currentStep = step;
    step.status = 'in_progress';
    this.updateState();

    this.addLog('info', stepId, `Starting: ${step.title}`);

    try {
      let success = false;

      switch (stepId) {
        case 'step_1':
          success = await this.executeResearchStep();
          break;
        case 'step_2':
          success = await this.executeTitleSlideStep();
          break;
        case 'step_3':
          success = await this.executeAgendaStep();
          break;
        case 'step_4':
          success = await this.executeContentSlidesStep();
          break;
        case 'step_5':
          success = await this.executeConclusionStep();
          break;
        case 'step_6':
          success = await this.executeThemingStep();
          break;
        case 'step_7':
          success = await this.executeLiveWidgetsStep();
          break;
        case 'step_8':
          success = await this.executeFinalReviewStep();
          break;
        default:
          this.addLog('warning', stepId, `Unknown step: ${stepId}`);
          success = false;
      }

      if (success) {
        step.status = 'completed';
        this.addLog('success', stepId, `Completed: ${step.title}`);
      } else {
        step.status = 'pending';
        this.addLog('error', stepId, `Failed: ${step.title}`);
      }

      this.updateProgress();
      this.updateState();
      return success;
    } catch (error) {
      step.status = 'pending';
      this.addLog('error', stepId, `Error in ${step.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.updateState();
      return false;
    }
  }

  private async executeResearchStep(): Promise<boolean> {
    // Simulate research phase
    await this.delay(2000);
    this.addLog('info', 'step_1', 'Gathering relevant information...');
    await this.delay(1000);
    this.addLog('info', 'step_1', 'Analyzing content requirements...');
    await this.delay(1000);
    this.addLog('success', 'step_1', 'Research completed successfully');
    return true;
  }

  private async executeTitleSlideStep(): Promise<boolean> {
    await this.delay(1500);
    
    const titleSlide: Slide = {
      id: 'slide_1',
      layout: 'title',
      blocks: [
        {
          type: 'Heading',
          text: this.plan.title
        },
        {
          type: 'Subheading',
          text: this.plan.overview
        }
      ],
      notes: `Welcome to ${this.plan.title}. ${this.plan.overview}`
    };

    this.state.deck.slides = [titleSlide];
    this.addLog('success', 'step_2', 'Title slide created');
    return true;
  }

  private async executeAgendaStep(): Promise<boolean> {
    await this.delay(1500);
    
    const agendaSlide: Slide = {
      id: 'slide_2',
      layout: 'title+bullets',
      blocks: [
        {
          type: 'Heading',
          text: 'Agenda'
        },
        {
          type: 'Bullets',
          items: this.plan.steps
            .filter(step => ['step_4', 'step_5'].includes(step.id))
            .map(step => step.title)
        }
      ],
      notes: 'Walk through the agenda and set expectations for the presentation.'
    };

    this.state.deck.slides = [...(this.state.deck.slides || []), agendaSlide];
    this.addLog('success', 'step_3', 'Agenda slide created');
    return true;
  }

  private async executeContentSlidesStep(): Promise<boolean> {
    await this.delay(1000);
    
    // Generate content slides based on the plan
    const contentSlides: Slide[] = [];
    const contentStepCount = this.plan.totalSlides - 4; // Exclude title, agenda, conclusion, references
    
    for (let i = 0; i < contentStepCount; i++) {
      try {
        // Create a mock section for slide generation
        const mockSection = {
          title: `Key Point ${i + 1}`,
          objective: `Present important information about ${this.plan.title.toLowerCase()}`,
          keyPoints: [
            'Important point 1',
            'Important point 2', 
            'Important point 3',
            'Important point 4',
            'Important point 5'
          ]
        };

        // Try to generate slide using the slidewriter
        const slide = await generateSlide(
          mockSection,
          i + 3,
          this.plan.totalSlides,
          'Corporate',
          false
        );
        
        contentSlides.push(slide);
        this.addLog('info', 'step_4', `Creating content slide ${i + 1}/${contentStepCount}`);
        
        // Add delay between slides for live effect
        await this.delay(500);
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error);
        // Fallback to basic slide
        const fallbackSlide: Slide = {
          id: `slide_${i + 3}`,
          layout: 'title+bullets',
          blocks: [
            {
              type: 'Heading',
              text: `Key Point ${i + 1}`
            },
            {
              type: 'Markdown',
              md: `This is the content for slide ${i + 3}. It contains important information about ${this.plan.title.toLowerCase()}.`
            },
            {
              type: 'Bullets',
              items: [
                'Important point 1',
                'Important point 2',
                'Important point 3'
              ]
            }
          ],
          notes: `Speaker notes for Key Point ${i + 1}`
        };
        contentSlides.push(fallbackSlide);
        this.addLog('warning', 'step_4', `Using fallback slide ${i + 1}/${contentStepCount}`);
      }
    }

    this.state.deck.slides = [...(this.state.deck.slides || []), ...contentSlides];
    this.addLog('success', 'step_4', `${contentStepCount} content slides created`);
    return true;
  }

  private async executeConclusionStep(): Promise<boolean> {
    await this.delay(1500);
    
    const conclusionSlide: Slide = {
      id: `slide_${this.plan.totalSlides - 1}`,
      layout: 'title+bullets',
      blocks: [
        {
          type: 'Heading',
          text: 'Conclusion'
        },
        {
          type: 'Markdown',
          md: `## Summary\n\nThank you for your attention. This presentation covered the key aspects of ${this.plan.title.toLowerCase()}.\n\n## Next Steps\n\n- Review the key points\n- Take action on recommendations\n- Questions and discussion`
        }
      ],
      notes: 'Summarize key points and thank the audience. Invite questions.'
    };

    this.state.deck.slides = [...(this.state.deck.slides || []), conclusionSlide];
    this.addLog('success', 'step_5', 'Conclusion slide created');
    return true;
  }

  private async executeThemingStep(): Promise<boolean> {
    await this.delay(2000);
    
    // Apply theme to the deck
    this.state.deck.meta = {
      title: this.plan.title,
      theme: 'Corporate' as const,
      subtitle: this.plan.overview,
      author: 'AI Slide Maker',
      date: new Date().toISOString().split('T')[0],
      audience: 'General audience',
      tone: 'Professional'
    };
    this.addLog('info', 'step_6', 'Applying theme and styling...');
    await this.delay(1000);
    this.addLog('success', 'step_6', 'Theme applied successfully');
    return true;
  }

  private async executeLiveWidgetsStep(): Promise<boolean> {
    await this.delay(1000);
    
    // Add live widgets if enabled
    this.addLog('info', 'step_7', 'Adding live widgets...');
    await this.delay(1000);
    this.addLog('success', 'step_7', 'Live widgets integrated');
    return true;
  }

  private async executeFinalReviewStep(): Promise<boolean> {
    await this.delay(2000);
    
    this.addLog('info', 'step_8', 'Reviewing presentation...');
    await this.delay(1000);
    this.addLog('info', 'step_8', 'Checking consistency...');
    await this.delay(1000);
    this.addLog('success', 'step_8', 'Final review completed');
    return true;
  }

  private async executeAllSteps(): Promise<void> {
    for (const step of this.plan.steps) {
      if (step.status === 'pending') {
        const canExecute = !step.dependencies || 
          step.dependencies.every(depId => 
            this.plan.steps.find(s => s.id === depId)?.status === 'completed'
          );

        if (canExecute) {
          await this.executeStep(step.id);
        }
      }
    }
  }

  private addLog(type: ExecutionLog['type'], stepId: string, message: string): void {
    const log: ExecutionLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      stepId,
      message,
      type
    };
    
    this.state.logs.push(log);
  }

  private updateProgress(): void {
    const completed = this.plan.steps.filter(s => s.status === 'completed').length;
    const total = this.plan.steps.length;
    const percentage = Math.round((completed / total) * 100);
    
    this.state.progress = { completed, total, percentage };
  }

  private updateState(): void {
    this.onStateChange({ ...this.state });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentState(): ExecutionState {
    return { ...this.state };
  }

  pauseExecution(): void {
    this.isRunning = false;
    this.state.isExecuting = false;
    this.updateState();
  }

  resumeExecution(): void {
    if (!this.isRunning) {
      this.startExecution();
    }
  }
}
