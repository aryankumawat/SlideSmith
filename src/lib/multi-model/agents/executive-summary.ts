import { BaseAgent } from '../base-agent';
import { ExecutiveSummaryInput, ExecutiveSummaryOutput } from '../schemas';

export interface ExecutiveSummaryConfig {
  name: string;
  description: string;
  model: {
    provider: 'ollama' | 'openai' | 'demo';
    apiKey: string;
    baseUrl: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

export class ExecutiveSummaryAgent extends BaseAgent {
  constructor(config: ExecutiveSummaryConfig) {
    super(config);
  }

  async execute(input: ExecutiveSummaryInput): Promise<ExecutiveSummaryOutput> {
    try {
      console.log(`[${this.config.name}] Generating executive summary...`);
      
      const summarySlide = await this.generateSummarySlide(input);
      const emailSummary = await this.generateEmailSummary(input);
      
      const output: ExecutiveSummaryOutput = {
        summarySlide,
        emailSummary,
        metadata: {
          keyPoints: this.extractKeyPoints(input.deck),
          totalSlides: input.deck.slides.length,
          estimatedReadTime: this.calculateReadTime(emailSummary)
        }
      };

      console.log(`[${this.config.name}] Generated executive summary and email`);
      return output;
    } catch (error) {
      this.handleError(error, { input });
    }
  }

  private async generateSummarySlide(input: ExecutiveSummaryInput): Promise<any> {
    const prompt = this.buildSummarySlidePrompt(input);
    const response = await this.callLLM(prompt);
    return this.parseSummarySlide(response);
  }

  private async generateEmailSummary(input: ExecutiveSummaryInput): Promise<string> {
    const prompt = this.buildEmailSummaryPrompt(input);
    const response = await this.callLLM(prompt);
    return response;
  }

  private buildSummarySlidePrompt(input: ExecutiveSummaryInput): string {
    return `
You are creating an executive summary slide for this presentation.

Presentation Details:
- Title: ${input.deck.title}
- Audience: ${input.audience}
- Tone: ${input.tone}
- Total Slides: ${input.deck.slides.length}

Key Content:
${input.deck.slides.map((slide, i) => `${i + 1}. ${slide.title || 'Untitled'}: ${this.extractSlideSummary(slide)}`).join('\n')}

Create a single summary slide that includes:
1. Main title: "Executive Summary" or similar
2. 3-5 key takeaways (bullet points)
3. Key outcomes or next steps
4. Contact information if relevant

Guidelines:
- No new facts, only summarize existing content
- Keep it concise and impactful
- Use clear, action-oriented language
- Match the presentation tone
- Focus on outcomes and value

Return as JSON object with slide structure.
`;
  }

  private buildEmailSummaryPrompt(input: ExecutiveSummaryInput): string {
    return `
Write a professional email summary of this presentation.

Presentation: ${input.deck.title}
Audience: ${input.audience}
Tone: ${input.tone}

Key Points:
${this.extractKeyPoints(input.deck).map(point => `- ${point}`).join('\n')}

Requirements:
- 100-120 words
- Professional email format
- Include subject line
- Highlight key outcomes
- Mention next steps if applicable
- Match the presentation tone

Format:
Subject: [Compelling subject line]

[Email body with key points and outcomes]

Return the complete email text.
`;
  }

  private extractSlideSummary(slide: any): string {
    if (slide.blocks && slide.blocks.length > 0) {
      const textBlocks = slide.blocks.filter((block: any) => 
        block.type === 'heading' || block.type === 'bullets' || block.type === 'text'
      );
      return textBlocks.map((block: any) => 
        block.content || block.text || block.title || ''
      ).join(' ').substring(0, 100) + '...';
    }
    return 'Content slide';
  }

  private extractKeyPoints(deck: any): string[] {
    const keyPoints: string[] = [];
    
    deck.slides.forEach((slide: any) => {
      if (slide.blocks) {
        slide.blocks.forEach((block: any) => {
          if (block.type === 'bullets' && block.items) {
            keyPoints.push(...block.items.slice(0, 2));
          } else if (block.type === 'heading' && block.text) {
            keyPoints.push(block.text);
          }
        });
      }
    });
    
    return keyPoints.slice(0, 5);
  }

  private parseSummarySlide(response: string): any {
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        id: 'executive-summary',
        title: parsed.title || 'Executive Summary',
        blocks: parsed.blocks || [
          {
            type: 'heading',
            text: 'Executive Summary',
            level: 1
          },
          {
            type: 'bullets',
            items: parsed.keyPoints || ['Key takeaway 1', 'Key takeaway 2', 'Key takeaway 3']
          }
        ],
        notes: parsed.notes || 'Summary of key points and outcomes'
      };
    } catch (error) {
      console.error('Failed to parse summary slide:', error);
      return {
        id: 'executive-summary',
        title: 'Executive Summary',
        blocks: [
          {
            type: 'heading',
            text: 'Executive Summary',
            level: 1
          },
          {
            type: 'bullets',
            items: ['Key takeaway 1', 'Key takeaway 2', 'Key takeaway 3']
          }
        ],
        notes: 'Summary of key points and outcomes'
      };
    }
  }

  private calculateReadTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}
