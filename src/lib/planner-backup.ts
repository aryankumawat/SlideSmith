import { z } from 'zod';
import { LLMClient, createLLMClient } from './llm';

export const PlanningStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  estimatedTime: z.string(),
  dependencies: z.array(z.string()).optional(),
});

export const PresentationPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  overview: z.string(),
  totalSlides: z.number(),
  estimatedDuration: z.string(),
  steps: z.array(PlanningStepSchema),
  priority: z.enum(['low', 'medium', 'high']),
  complexity: z.enum(['simple', 'moderate', 'complex']),
});

export type PlanningStep = z.infer<typeof PlanningStepSchema>;
export type PresentationPlan = z.infer<typeof PresentationPlanSchema>;

export class PresentationPlanner {
  private llm: LLMClient;

  constructor() {
    this.llm = createLLMClient();
  }

  async generatePlan(request: {
    topic: string;
    detail: string;
    tone: string;
    audience: string;
    length: number;
    theme: string;
    includeLiveWidgets: boolean;
  }): Promise<PresentationPlan> {
    try {
      // Try to use LLM to generate plan
      const prompt = this.createPlanningPrompt(request);
      const response = await this.llm.generateContent(prompt);
      
      // Try to parse the response as JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return PresentationPlanSchema.parse(parsed);
      }
    } catch (error) {
      console.warn('Failed to generate plan with LLM, falling back to demo plan:', error);
    }
    
    // Fallback to demo plan
    return this.createDemoPlan(request);
  }

  private createPlanningPrompt(request: {
    topic: string;
    detail: string;
    tone: string;
    audience: string;
    length: number;
    theme: string;
    includeLiveWidgets: boolean;
  }): string {
    return `Create a detailed presentation plan for the following request:

Topic: ${request.topic}
Details: ${request.detail}
Tone: ${request.tone}
Audience: ${request.audience}
Length: ${request.length} slides
Theme: ${request.theme}
Live Widgets: ${request.includeLiveWidgets ? 'Yes' : 'No'}

Generate a structured plan with the following format:
{
  "id": "plan_${Date.now()}",
  "title": "Presentation Title",
  "overview": "Brief overview of the presentation",
  "totalSlides": ${request.length},
  "estimatedDuration": "X minutes",
  "priority": "medium",
  "complexity": "moderate",
  "steps": [
    {
      "id": "step_1",
      "title": "Research and Content Gathering",
      "description": "Collect relevant information and data for the presentation",
      "status": "pending",
      "estimatedTime": "5-10 minutes",
      "dependencies": []
    },
    {
      "id": "step_2", 
      "title": "Create Title Slide",
      "description": "Design engaging title slide with main topic and subtitle",
      "status": "pending",
      "estimatedTime": "2-3 minutes",
      "dependencies": ["step_1"]
    },
    {
      "id": "step_3",
      "title": "Build Agenda Slide",
      "description": "Create clear agenda outlining presentation structure",
      "status": "pending", 
      "estimatedTime": "2-3 minutes",
      "dependencies": ["step_1"]
    },
    {
      "id": "step_4",
      "title": "Develop Content Slides",
      "description": "Create ${request.length - 4} content slides with key information",
      "status": "pending",
      "estimatedTime": "10-15 minutes",
      "dependencies": ["step_2", "step_3"]
    },
    {
      "id": "step_5",
      "title": "Add Conclusion Slide",
      "description": "Summarize key points and provide next steps",
      "status": "pending",
      "estimatedTime": "2-3 minutes",
      "dependencies": ["step_4"]
    },
    {
      "id": "step_6",
      "title": "Apply Theme and Styling",
      "description": "Apply ${request.theme} theme and ensure visual consistency",
      "status": "pending",
      "estimatedTime": "3-5 minutes",
      "dependencies": ["step_5"]
    },
    {
      "id": "step_7",
      "title": "Add Live Widgets",
      "description": "${request.includeLiveWidgets ? 'Integrate live data widgets and interactive elements' : 'Skip live widgets as requested'}",
      "status": "pending",
      "estimatedTime": "${request.includeLiveWidgets ? '5-8 minutes' : '0 minutes'}",
      "dependencies": ["step_6"]
    },
    {
      "id": "step_8",
      "title": "Final Review and Polish",
      "description": "Review all slides for consistency and quality",
      "status": "pending",
      "estimatedTime": "3-5 minutes",
      "dependencies": ["step_7"]
    }
  ]
}

Make sure the plan is realistic and follows a logical sequence. Each step should build upon the previous ones.`;
  }

  private createDemoPlan(request: {
    topic: string;
    detail: string;
    tone: string;
    audience: string;
    length: number;
    theme: string;
    includeLiveWidgets: boolean;
  }): PresentationPlan {
    return {
      id: `plan_${Date.now()}`,
      title: `${request.topic} Presentation`,
      overview: `A ${request.tone} presentation about ${request.topic} for ${request.audience}`,
      totalSlides: request.length,
      estimatedDuration: `${Math.ceil(request.length * 2)} minutes`,
      priority: 'medium',
      complexity: request.length > 10 ? 'complex' : request.length > 6 ? 'moderate' : 'simple',
      steps: [
        {
          id: 'step_1',
          title: 'Research and Content Gathering',
          description: 'Collect relevant information and data for the presentation',
          status: 'pending',
          estimatedTime: '5-10 minutes',
          dependencies: []
        },
        {
          id: 'step_2',
          title: 'Create Title Slide',
          description: 'Design engaging title slide with main topic and subtitle',
          status: 'pending',
          estimatedTime: '2-3 minutes',
          dependencies: ['step_1']
        },
        {
          id: 'step_3',
          title: 'Build Agenda Slide',
          description: 'Create clear agenda outlining presentation structure',
          status: 'pending',
          estimatedTime: '2-3 minutes',
          dependencies: ['step_1']
        },
        {
          id: 'step_4',
          title: 'Develop Content Slides',
          description: `Create ${request.length - 4} content slides with key information`,
          status: 'pending',
          estimatedTime: '10-15 minutes',
          dependencies: ['step_2', 'step_3']
        },
        {
          id: 'step_5',
          title: 'Add Conclusion Slide',
          description: 'Summarize key points and provide next steps',
          status: 'pending',
          estimatedTime: '2-3 minutes',
          dependencies: ['step_4']
        },
        {
          id: 'step_6',
          title: 'Apply Theme and Styling',
          description: `Apply ${request.theme} theme and ensure visual consistency`,
          status: 'pending',
          estimatedTime: '3-5 minutes',
          dependencies: ['step_5']
        },
        {
          id: 'step_7',
          title: 'Add Live Widgets',
          description: request.includeLiveWidgets ? 'Integrate live data widgets and interactive elements' : 'Skip live widgets as requested',
          status: 'pending',
          estimatedTime: request.includeLiveWidgets ? '5-8 minutes' : '0 minutes',
          dependencies: ['step_6']
        },
        {
          id: 'step_8',
          title: 'Final Review and Polish',
          description: 'Review all slides for consistency and quality',
          status: 'pending',
          estimatedTime: '3-5 minutes',
          dependencies: ['step_7']
        }
      ]
    };
  }

  async executeStep(plan: PresentationPlan, stepId: string): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    const step = plan.steps.find(s => s.id === stepId);
    if (!step) {
      return { success: false, error: 'Step not found' };
    }

    // Mark step as in progress
    step.status = 'in_progress';

    try {
      // Simulate step execution with realistic delays
      const delay = this.getStepDelay(step.estimatedTime);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Mark step as completed
      step.status = 'completed';

      return {
        success: true,
        result: {
          stepId,
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      step.status = 'pending';
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getStepDelay(estimatedTime: string): number {
    // Convert estimated time to milliseconds for simulation
    const timeStr = estimatedTime.toLowerCase();
    if (timeStr.includes('0 minutes')) return 0;
    if (timeStr.includes('2-3 minutes')) return 2000;
    if (timeStr.includes('3-5 minutes')) return 3000;
    if (timeStr.includes('5-8 minutes')) return 5000;
    if (timeStr.includes('5-10 minutes')) return 5000;
    if (timeStr.includes('10-15 minutes')) return 8000;
    return 3000; // Default delay
  }

  getNextExecutableStep(plan: PresentationPlan): PlanningStep | null {
    return plan.steps.find(step => 
      step.status === 'pending' && 
      step.dependencies?.every(depId => 
        plan.steps.find(s => s.id === depId)?.status === 'completed'
      )
    ) || null;
  }

  getPlanProgress(plan: PresentationPlan): {
    completed: number;
    total: number;
    percentage: number;
    currentStep: PlanningStep | null;
  } {
    const completed = plan.steps.filter(s => s.status === 'completed').length;
    const total = plan.steps.length;
    const percentage = Math.round((completed / total) * 100);
    const currentStep = this.getNextExecutableStep(plan);

    return {
      completed,
      total,
      percentage,
      currentStep
    };
  }
}
