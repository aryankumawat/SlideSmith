import { BaseAgent } from '../base-agent';
import { AudienceAdapterInput, AudienceAdapterOutput } from '../schemas';

export interface AudienceAdapterConfig {
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

export class AudienceAdapterAgent extends BaseAgent {
  constructor(config: AudienceAdapterConfig) {
    super(config);
  }

  async execute(input: AudienceAdapterInput): Promise<AudienceAdapterOutput> {
    try {
      console.log(`[${this.config.name}] Adapting presentation for new audience...`);
      
      const adaptedDeck = await this.adaptPresentation(input);
      const changeLog = await this.generateChangeLog(input, adaptedDeck);
      
      const output: AudienceAdapterOutput = {
        adaptedDeck,
        changeLog,
        metadata: {
          originalSlides: input.deck.slides.length,
          adaptedSlides: adaptedDeck.slides.length,
          slidesRemoved: input.deck.slides.length - adaptedDeck.slides.length,
          slidesAdded: adaptedDeck.slides.length - input.deck.slides.length,
          toneChanged: input.originalTone !== input.targetTone,
          durationChanged: input.originalDuration !== input.targetDuration
        }
      };

      console.log(`[${this.config.name}] Adapted presentation from ${input.originalAudience} to ${input.targetAudience}`);
      return output;
    } catch (error) {
      this.handleError(error, { input });
    }
  }

  private async adaptPresentation(input: AudienceAdapterInput): Promise<any> {
    const prompt = this.buildAdaptationPrompt(input);
    const response = await this.callLLM(prompt);
    return this.parseAdaptedDeck(response, input.deck);
  }

  private async generateChangeLog(input: AudienceAdapterInput, adaptedDeck: any): Promise<string[]> {
    const prompt = this.buildChangeLogPrompt(input, adaptedDeck);
    const response = await this.callLLM(prompt);
    return this.parseChangeLog(response);
  }

  private buildAdaptationPrompt(input: AudienceAdapterInput): string {
    return `
You are adapting a presentation for a new audience and time constraints.

Original Presentation:
- Title: ${input.deck.title}
- Original Audience: ${input.originalAudience}
- Original Tone: ${input.originalTone}
- Original Duration: ${input.originalDuration} minutes

Target Requirements:
- Target Audience: ${input.targetAudience}
- Target Tone: ${input.targetTone}
- Target Duration: ${input.targetDuration} minutes

Current Slides:
${input.deck.slides.map((slide, i) => `${i + 1}. ${slide.title || 'Untitled'}: ${this.extractSlideContent(slide)}`).join('\n')}

Adaptation Guidelines:
1. Preserve core claims and citations
2. Adjust tone and language for target audience
3. Trim or merge slides to fit time constraint
4. Don't drop critical caveats or important details
5. Maintain logical flow and narrative
6. Update examples and references for target audience
7. Adjust technical level if needed
8. Keep essential data and evidence

For each slide, decide to:
- Keep as-is
- Modify content/tone
- Merge with next slide
- Remove (if not critical)
- Split into multiple slides

Return the adapted deck structure as JSON.
`;
  }

  private buildChangeLogPrompt(input: AudienceAdapterInput, adaptedDeck: any): string {
    return `
Generate a change log for the presentation adaptation.

Original: ${input.originalAudience} audience, ${input.originalDuration}min, ${input.originalTone} tone
Target: ${input.targetAudience} audience, ${input.targetDuration}min, ${input.targetTone} tone

Changes Made:
- Original slides: ${input.deck.slides.length}
- Adapted slides: ${adaptedDeck.slides.length}
- Slides removed: ${input.deck.slides.length - adaptedDeck.slides.length}
- Slides added: ${adaptedDeck.slides.length - input.deck.slides.length}

Provide a concise list of the main changes made during adaptation.
`;
  }

  private extractSlideContent(slide: any): string {
    if (slide.blocks && slide.blocks.length > 0) {
      const textBlocks = slide.blocks.filter((block: any) => 
        block.type === 'heading' || block.type === 'bullets' || block.type === 'text'
      );
      return textBlocks.map((block: any) => 
        block.content || block.text || block.title || ''
      ).join(' ').substring(0, 150) + '...';
    }
    return 'Content slide';
  }

  private parseAdaptedDeck(response: string, originalDeck: any): any {
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        ...originalDeck,
        title: parsed.title || originalDeck.title,
        slides: parsed.slides || originalDeck.slides,
        meta: {
          ...originalDeck.meta,
          audience: parsed.audience || originalDeck.meta?.audience,
          tone: parsed.tone || originalDeck.meta?.tone,
          duration: parsed.duration || originalDeck.meta?.duration
        }
      };
    } catch (error) {
      console.error('Failed to parse adapted deck:', error);
      return originalDeck;
    }
  }

  private parseChangeLog(response: string): string[] {
    try {
      // Try to parse as JSON array
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // Fallback to text parsing
      const lines = response.split('\n').filter(line => line.trim().length > 0);
      return lines.map(line => line.replace(/^[-*]\s*/, '').trim());
    }
    
    return ['Presentation adapted for new audience and time constraints'];
  }
}
