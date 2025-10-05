import { z } from 'zod';
import { LLMClient, createLLMClient } from './llm';

// Planning step schema
const PlanningStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  estimatedTime: z.string(),
  dependencies: z.array(z.string()),
});

// Presentation plan schema
const PresentationPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  overview: z.string(),
  totalSlides: z.number(),
  estimatedDuration: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  steps: z.array(PlanningStepSchema),
});

export type PresentationPlan = z.infer<typeof PresentationPlanSchema>;
export type PlanningStep = z.infer<typeof PlanningStepSchema>;

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
      
      // Clean the response and try to parse as JSON
      const cleanedResponse = response.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
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
    return `You are an expert presentation planner. Create a detailed plan for a ${request.tone.toLowerCase()} presentation about "${request.topic}".

Presentation Details:
- Topic: ${request.topic}
- Detail: ${request.detail}
- Tone: ${request.tone}
- Audience: ${request.audience}
- Length: ${request.length} slides
- Theme: ${request.theme}
- Include Live Widgets: ${request.includeLiveWidgets}

Create a JSON plan with this exact structure:
{
  "id": "plan_${Date.now()}",
  "title": "${request.topic} Presentation",
  "overview": "A ${request.tone} presentation about ${request.topic} for ${request.audience}",
  "totalSlides": ${request.length},
  "estimatedDuration": "${Math.ceil(request.length * 2)} minutes",
  "priority": "medium",
  "complexity": "${request.length <= 5 ? 'simple' : request.length <= 10 ? 'moderate' : 'complex'}",
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
      "description": "Create ${Math.max(1, request.length - 4)} content slides with key information",
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

Return only the JSON object, no additional text.`;
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
      complexity: request.length <= 5 ? 'simple' : request.length <= 10 ? 'moderate' : 'complex',
      steps: [
        {
          id: 'step_1',
          title: 'Research and Content Gathering',
          description: 'Collect relevant information and data for the presentation',
          status: 'pending',
          estimatedTime: '5-10 minutes',
          dependencies: [],
        },
        {
          id: 'step_2',
          title: 'Create Title Slide',
          description: 'Design engaging title slide with main topic and subtitle',
          status: 'pending',
          estimatedTime: '2-3 minutes',
          dependencies: ['step_1'],
        },
        {
          id: 'step_3',
          title: 'Build Agenda Slide',
          description: 'Create clear agenda outlining presentation structure',
          status: 'pending',
          estimatedTime: '2-3 minutes',
          dependencies: ['step_1'],
        },
        {
          id: 'step_4',
          title: 'Develop Content Slides',
          description: `Create ${Math.max(1, request.length - 4)} content slides with key information`,
          status: 'pending',
          estimatedTime: '10-15 minutes',
          dependencies: ['step_2', 'step_3'],
        },
        {
          id: 'step_5',
          title: 'Add Conclusion Slide',
          description: 'Summarize key points and provide next steps',
          status: 'pending',
          estimatedTime: '2-3 minutes',
          dependencies: ['step_4'],
        },
        {
          id: 'step_6',
          title: 'Apply Theme and Styling',
          description: `Apply ${request.theme} theme and ensure visual consistency`,
          status: 'pending',
          estimatedTime: '3-5 minutes',
          dependencies: ['step_5'],
        },
        {
          id: 'step_7',
          title: 'Add Live Widgets',
          description: request.includeLiveWidgets
            ? 'Integrate live data widgets and interactive elements'
            : 'Skip live widgets as requested',
          status: 'pending',
          estimatedTime: request.includeLiveWidgets ? '5-8 minutes' : '0 minutes',
          dependencies: ['step_6'],
        },
        {
          id: 'step_8',
          title: 'Final Review and Polish',
          description: 'Review all slides for consistency and quality',
          status: 'pending',
          estimatedTime: '3-5 minutes',
          dependencies: ['step_7'],
        },
      ],
    };
  }
}
