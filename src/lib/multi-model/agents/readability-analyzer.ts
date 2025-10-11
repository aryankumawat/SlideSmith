import { BaseAgent, AgentConfig } from '../base-agent';
import { z } from 'zod';

// ============================================================================
// READABILITY ANALYZER AGENT
// ============================================================================

export interface ReadabilityInput {
  slides: any[];
  audience: string;
  readingLevel?: 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
}

export interface ReadabilityOutput {
  overallScore: number;
  slideScores: Array<{
    slideId: string;
    score: number;
    issues: string[];
    suggestions: string[];
  }>;
  metrics: {
    averageSentenceLength: number;
    averageWordLength: number;
    complexWordRatio: number;
    passiveVoiceRatio: number;
    readabilityIndex: number;
  };
  recommendations: string[];
}

const ReadabilityInputSchema = z.object({
  slides: z.array(z.any()),
  audience: z.string(),
  readingLevel: z.enum(['elementary', 'middle', 'high', 'college', 'graduate']).optional(),
});

const ReadabilityOutputSchema = z.object({
  overallScore: z.number().min(0).max(1),
  slideScores: z.array(z.object({
    slideId: z.string(),
    score: z.number().min(0).max(1),
    issues: z.array(z.string()),
    suggestions: z.array(z.string()),
  })),
  metrics: z.object({
    averageSentenceLength: z.number(),
    averageWordLength: z.number(),
    complexWordRatio: z.number(),
    passiveVoiceRatio: z.number(),
    readabilityIndex: z.number(),
  }),
  recommendations: z.array(z.string()),
});

export class ReadabilityAnalyzerAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'readability-analyzer',
      description: 'Analyzes text readability and provides suggestions for improvement based on audience level',
      capabilities: ['text-analysis', 'readability-metrics', 'content-optimization'],
      maxRetries: 3,
      timeout: 30000,
    };
    super(config);
  }

  async execute(input: ReadabilityInput, context?: unknown): Promise<ReadabilityOutput> {
    try {
      console.log(`[${this.config.name}] Starting readability analysis...`);
      
      // Validate input
      this.validateInput(input, ReadabilityInputSchema);
      
      const analysis = await this.analyzeReadability(input);
      
      console.log(`[${this.config.name}] Readability analysis completed`);
      return analysis;
    } catch (error) {
      this.handleError(error, { input });
    }
  }

  private async analyzeReadability(input: ReadabilityInput): Promise<ReadabilityOutput> {
    const prompt = this.buildAnalysisPrompt(input);
    const response = await this.callLLM(prompt);
    const content = this.parseResponse(response);
    
    try {
      const parsed = JSON.parse(content);
      return ReadabilityOutputSchema.parse(parsed);
    } catch (error) {
      console.error(`[${this.config.name}] Failed to parse LLM response:`, content, error);
      throw new Error(`Failed to parse ReadabilityAnalyzer output: ${(error as Error).message}`);
    }
  }

  private buildAnalysisPrompt(input: ReadabilityInput): string {
    return `
You are a Readability Analyzer Agent. Your task is to analyze the readability of slide content and provide scores, metrics, and recommendations for improvement.

Input:
- Slides: ${JSON.stringify(input.slides, null, 2)}
- Target Audience: "${input.audience}"
- Reading Level: "${input.readingLevel || 'college'}"

Task:
1. Analyze each slide for readability issues
2. Calculate readability metrics (sentence length, word complexity, etc.)
3. Provide specific suggestions for improvement
4. Assign scores from 0-1 (1 being most readable)

Output MUST be a JSON object with this structure:
{
  "overallScore": 0.85,
  "slideScores": [
    {
      "slideId": "slide-1",
      "score": 0.9,
      "issues": ["Long sentences", "Technical jargon"],
      "suggestions": ["Break into shorter sentences", "Define technical terms"]
    }
  ],
  "metrics": {
    "averageSentenceLength": 15.2,
    "averageWordLength": 4.8,
    "complexWordRatio": 0.12,
    "passiveVoiceRatio": 0.08,
    "readabilityIndex": 78.5
  },
  "recommendations": [
    "Use shorter sentences for better comprehension",
    "Define technical terms on first use",
    "Use active voice where possible"
  ]
}

Focus on:
- Sentence length and complexity
- Word choice and technical jargon
- Passive vs active voice
- Overall clarity and flow
- Audience-appropriate language level
`;
  }
}
