import { BaseAgent } from '../base-agent';
import { SpeakerNotesInput, SpeakerNotesOutput, SpeakerNote } from '../schemas';

export interface SpeakerNotesConfig {
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

export class SpeakerNotesGeneratorAgent extends BaseAgent {
  constructor(config: SpeakerNotesConfig) {
    super(config);
  }

  async execute(input: SpeakerNotesInput): Promise<SpeakerNotesOutput> {
    try {
      console.log(`[${this.config.name}] Generating speaker notes...`);
      
      const speakerNotes = await this.generateSpeakerNotes(input);
      
      const output: SpeakerNotesOutput = {
        notes: speakerNotes,
        metadata: {
          totalSlides: speakerNotes.length,
          averageDuration: this.calculateAverageDuration(speakerNotes),
          totalDuration: this.calculateTotalDuration(speakerNotes)
        }
      };

      console.log(`[${this.config.name}] Generated notes for ${speakerNotes.length} slides`);
      return output;
    } catch (error) {
      this.handleError(error, { input });
    }
  }

  private async generateSpeakerNotes(input: SpeakerNotesInput): Promise<SpeakerNote[]> {
    const notes: SpeakerNote[] = [];
    
    for (const slide of input.slides) {
      const prompt = this.buildSpeakerNotesPrompt(input, slide);
      const response = await this.callLLM(prompt);
      const note = this.parseSpeakerNote(response, slide.id);
      notes.push(note);
    }
    
    return notes;
  }

  private buildSpeakerNotesPrompt(input: SpeakerNotesInput, slide: any): string {
    return `
You are a presentation coach. Generate speaker notes for this slide.

Slide Information:
- ID: ${slide.id}
- Title: ${slide.title || 'Untitled'}
- Content: ${JSON.stringify(slide.blocks, null, 2)}
- Slide Type: ${slide.type || 'content'}

Presentation Context:
- Audience: ${input.audience}
- Tone: ${input.tone}
- Duration: ${input.estimatedDuration} minutes
- Purpose: ${input.purpose}

Guidelines:
1. Provide 30-60 seconds of speaking guidance
2. Complement, don't repeat the bullet points
3. Add transitions and emphasis points
4. Include timing cues
5. Suggest when to pause or engage audience
6. Mention key points to emphasize
7. Add context or background information
8. Include potential Q&A points

Generate speaker notes that help the presenter deliver effectively.
`;
  }

  private parseSpeakerNote(response: string, slideId: string): SpeakerNote {
    try {
      // Try to parse as JSON first
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        slideId,
        notes: parsed.notes || response,
        duration: parsed.duration || '30-45 seconds',
        keyPoints: parsed.keyPoints || [],
        transitions: parsed.transitions || [],
        audienceEngagement: parsed.audienceEngagement || [],
        timing: parsed.timing || 'Normal pace'
      };
    } catch (error) {
      // Fallback to plain text parsing
      return {
        slideId,
        notes: response,
        duration: '30-45 seconds',
        keyPoints: this.extractKeyPoints(response),
        transitions: [],
        audienceEngagement: [],
        timing: 'Normal pace'
      };
    }
  }

  private extractKeyPoints(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private calculateAverageDuration(notes: SpeakerNote[]): number {
    if (notes.length === 0) return 0;
    
    const totalSeconds = notes.reduce((sum, note) => {
      const duration = note.duration;
      const match = duration.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 30);
    }, 0);
    
    return Math.round(totalSeconds / notes.length);
  }

  private calculateTotalDuration(notes: SpeakerNote[]): number {
    return notes.reduce((sum, note) => {
      const duration = note.duration;
      const match = duration.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 30);
    }, 0);
  }
}
