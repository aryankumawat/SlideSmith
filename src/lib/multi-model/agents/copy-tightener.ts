import { BaseAgent, AgentConfig } from '../base-agent';
import { Slide, SlideBlock } from '../schemas';
import { z } from 'zod';

// ============================================================================
// COPY TIGHTENER AGENT - TONE & CONSISTENCY PASS
// ============================================================================

export interface CopyTightenerInput {
  slides: Slide[];
  audience: string;
  tone: string;
  targetReadingLevel?: number;
}

export interface CopyTightenerOutput {
  slides: Slide[];
  qualityScore: number;
  changes: {
    slideId: string;
    changes: string[];
  }[];
}

export class CopyTightenerAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'copy-tightener',
      description: 'Normalizes tone and reading level without changing meaning',
      capabilities: ['text-editing', 'tone-consistency', 'readability-optimization'],
      maxRetries: 2,
      timeout: 10000,
    };
    super(config);
  }

  async execute(input: CopyTightenerInput, context?: unknown): Promise<CopyTightenerOutput> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validateInput(input, this.getInputSchema())) {
        throw new Error('Invalid input for Copy Tightener agent');
      }

      const changes: CopyTightenerOutput['changes'] = [];
      let totalQualityScore = 0;

      // Process each slide
      for (const slide of input.slides) {
        const slideChanges: string[] = [];
        let slideQualityScore = 0;

        // Process each block in the slide
        for (const block of slide.blocks) {
          const result = await this.tightenBlock(block, input);
          
          if (result.changed) {
            slideChanges.push(...result.changes);
            slideQualityScore += result.qualityScore;
          } else {
            slideQualityScore += 1.0; // Perfect if no changes needed
          }
        }

        if (slideChanges.length > 0) {
          changes.push({
            slideId: slide.id,
            changes: slideChanges,
          });
        }

        totalQualityScore += slideQualityScore / slide.blocks.length;
      }

      const overallQualityScore = totalQualityScore / input.slides.length;

      const output: CopyTightenerOutput = {
        slides: input.slides, // Slides are modified in place
        qualityScore: overallQualityScore,
        changes,
      };

      const duration = Date.now() - startTime;
      this.logExecution('copy-tightener-task', input, output, duration);

      return output;

    } catch (error) {
      this.handleError(error, { input, context });
    }
  }

  private async tightenBlock(block: SlideBlock, input: CopyTightenerInput): Promise<{
    changed: boolean;
    changes: string[];
    qualityScore: number;
  }> {
    const changes: string[] = [];
    let qualityScore = 1.0;

    if (block.type === 'Heading' && 'text' in block) {
      const result = await this.tightenHeading(block.text, input);
      if (result.changed) {
        block.text = result.text;
        changes.push(`Tightened heading: "${result.original}" → "${result.text}"`);
        qualityScore = result.qualityScore;
      }
    } else if (block.type === 'Subheading' && 'text' in block) {
      const result = await this.tightenSubheading(block.text, input);
      if (result.changed) {
        block.text = result.text;
        changes.push(`Tightened subheading: "${result.original}" → "${result.text}"`);
        qualityScore = result.qualityScore;
      }
    } else if (block.type === 'Bullets' && 'items' in block) {
      const result = await this.tightenBullets(block.items, input);
      if (result.changed) {
        block.items = result.items;
        changes.push(`Tightened ${result.items.length} bullet points`);
        qualityScore = result.qualityScore;
      }
    }

    return {
      changed: changes.length > 0,
      changes,
      qualityScore,
    };
  }

  private async tightenHeading(text: string, input: CopyTightenerInput): Promise<{
    changed: boolean;
    original: string;
    text: string;
    qualityScore: number;
  }> {
    const prompt = `Tighten this slide heading for a "${input.audience}" audience with a "${input.tone}" tone.

Original: "${text}"

Requirements:
- Keep it under 8 words
- Use active voice
- Be specific and compelling
- Match the tone exactly
- Don't change the core meaning

Return as JSON:
{
  "tightened": "New heading",
  "reason": "Why this is better",
  "wordCount": 5
}`;

    try {
      const response = await this.callLLM(prompt);
      const result = JSON.parse(response.content);
      
      if (result.tightened && result.tightened !== text && result.wordCount <= 8) {
        return {
          changed: true,
          original: text,
          text: result.tightened,
          qualityScore: this.calculateHeadingQuality(result.tightened, input),
        };
      }
    } catch (error) {
      console.warn('Heading tightening failed:', error);
    }

    return {
      changed: false,
      original: text,
      text,
      qualityScore: this.calculateHeadingQuality(text, input),
    };
  }

  private async tightenSubheading(text: string, input: CopyTightenerInput): Promise<{
    changed: boolean;
    original: string;
    text: string;
    qualityScore: number;
  }> {
    const prompt = `Tighten this slide subheading for a "${input.audience}" audience with a "${input.tone}" tone.

Original: "${text}"

Requirements:
- Keep it under 15 words
- Be clear and concise
- Support the main heading
- Match the tone exactly
- Don't change the core meaning

Return as JSON:
{
  "tightened": "New subheading",
  "reason": "Why this is better",
  "wordCount": 8
}`;

    try {
      const response = await this.callLLM(prompt);
      const result = JSON.parse(response.content);
      
      if (result.tightened && result.tightened !== text && result.wordCount <= 15) {
        return {
          changed: true,
          original: text,
          text: result.tightened,
          qualityScore: this.calculateSubheadingQuality(result.tightened, input),
        };
      }
    } catch (error) {
      console.warn('Subheading tightening failed:', error);
    }

    return {
      changed: false,
      original: text,
      text,
      qualityScore: this.calculateSubheadingQuality(text, input),
    };
  }

  private async tightenBullets(items: string[], input: CopyTightenerInput): Promise<{
    changed: boolean;
    items: string[];
    qualityScore: number;
  }> {
    const prompt = `Tighten these bullet points for a "${input.audience}" audience with a "${input.tone}" tone.

Original bullets:
${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Requirements:
- Keep each bullet under 12 words
- Use active voice
- Be specific and actionable
- Match the tone exactly
- Don't change the core meaning
- Remove redundancy

Return as JSON:
{
  "tightened": ["bullet1", "bullet2", "bullet3"],
  "changes": ["description of changes made"]
}`;

    try {
      const response = await this.callLLM(prompt);
      const result = JSON.parse(response.content);
      
      if (result.tightened && Array.isArray(result.tightened)) {
        // Validate that all bullets are under 12 words
        const validBullets = result.tightened.filter((bullet: string) => 
          bullet.split(' ').length <= 12
        );
        
        if (validBullets.length > 0) {
          return {
            changed: true,
            items: validBullets,
            qualityScore: this.calculateBulletsQuality(validBullets, input),
          };
        }
      }
    } catch (error) {
      console.warn('Bullets tightening failed:', error);
    }

    return {
      changed: false,
      items,
      qualityScore: this.calculateBulletsQuality(items, input),
    };
  }

  private calculateHeadingQuality(text: string, input: CopyTightenerInput): number {
    let score = 1.0;
    
    // Check word count
    const wordCount = text.split(' ').length;
    if (wordCount > 8) {
      score -= 0.3;
    } else if (wordCount <= 5) {
      score += 0.1;
    }
    
    // Check for active voice (simplified)
    if (text.toLowerCase().includes('ing') && !text.toLowerCase().includes('understanding')) {
      score -= 0.1; // Likely passive voice
    }
    
    // Check for specific words
    if (text.toLowerCase().includes('overview') || text.toLowerCase().includes('introduction')) {
      score -= 0.1; // Generic words
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private calculateSubheadingQuality(text: string, input: CopyTightenerInput): number {
    let score = 1.0;
    
    // Check word count
    const wordCount = text.split(' ').length;
    if (wordCount > 15) {
      score -= 0.3;
    } else if (wordCount <= 8) {
      score += 0.1;
    }
    
    // Check for clarity
    if (text.toLowerCase().includes('etc') || text.toLowerCase().includes('and so on')) {
      score -= 0.2; // Vague language
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private calculateBulletsQuality(items: string[], input: CopyTightenerInput): number {
    let totalScore = 0;
    
    for (const item of items) {
      let itemScore = 1.0;
      
      // Check word count
      const wordCount = item.split(' ').length;
      if (wordCount > 12) {
        itemScore -= 0.3;
      } else if (wordCount <= 8) {
        itemScore += 0.1;
      }
      
      // Check for active voice
      if (item.toLowerCase().startsWith('to ') || item.toLowerCase().startsWith('for ')) {
        itemScore -= 0.1; // Likely passive
      }
      
      // Check for specificity
      if (item.toLowerCase().includes('things') || item.toLowerCase().includes('stuff')) {
        itemScore -= 0.2; // Vague language
      }
      
      totalScore += Math.max(0, Math.min(1, itemScore));
    }
    
    return totalScore / items.length;
  }

  private getInputSchema() {
    return z.object({
      slides: z.array(z.any()),
      audience: z.string().min(1),
      tone: z.string().min(1),
      targetReadingLevel: z.number().min(1).max(20).optional(),
    });
  }

  protected validateOutput(output: CopyTightenerOutput): boolean {
    if (!output.slides || !Array.isArray(output.slides)) {
      return false;
    }

    if (typeof output.qualityScore !== 'number' || output.qualityScore < 0 || output.qualityScore > 1) {
      return false;
    }

    return true;
  }

  protected getQualityScore(output: CopyTightenerOutput): number {
    return output.qualityScore;
  }
}
