import { BaseAgent } from '../base-agent';
import { MediaFinderInput, MediaFinderOutput, MediaSuggestion } from '../schemas';

export interface MediaFinderConfig {
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

export class MediaFinderAgent extends BaseAgent {
  constructor(config: MediaFinderConfig) {
    super(config);
  }

  async execute(input: MediaFinderInput): Promise<MediaFinderOutput> {
    try {
      console.log(`[${this.config.name}] Starting media search...`);
      
      const mediaSuggestions = await this.findMediaSuggestions(input);
      const altTexts = await this.generateAltTexts(input, mediaSuggestions);
      
      const output: MediaFinderOutput = {
        suggestions: mediaSuggestions.map((suggestion, index) => ({
          ...suggestion,
          altText: altTexts[index] || suggestion.altText
        })),
        metadata: {
          totalSuggestions: mediaSuggestions.length,
          imageCount: mediaSuggestions.filter(s => s.type === 'image').length,
          videoCount: mediaSuggestions.filter(s => s.type === 'video').length,
          diagramCount: mediaSuggestions.filter(s => s.type === 'diagram').length
        }
      };

      console.log(`[${this.config.name}] Found ${mediaSuggestions.length} media suggestions`);
      return output;
    } catch (error) {
      this.handleError(error, { input });
    }
  }

  private async findMediaSuggestions(input: MediaFinderInput): Promise<MediaSuggestion[]> {
    const prompt = this.buildMediaSearchPrompt(input);
    const response = await this.callLLM(prompt);
    return this.parseMediaSuggestions(response);
  }

  private async generateAltTexts(input: MediaFinderInput, suggestions: MediaSuggestion[]): Promise<string[]> {
    const altTexts: string[] = [];
    
    for (const suggestion of suggestions) {
      const prompt = this.buildAltTextPrompt(input, suggestion);
      const response = await this.callLLM(prompt);
      altTexts.push(response);
    }
    
    return altTexts;
  }

  private buildMediaSearchPrompt(input: MediaFinderInput): string {
    return `
You are a media research specialist. Find appropriate visual content for the given slide context.

Slide Context:
- Section: ${input.sectionContext}
- Keywords: ${input.keywords.join(', ')}
- Theme Style: ${input.themeStyle}
- Content Type: ${input.contentType}

Guidelines:
1. Prefer CC0/public domain or official assets
2. No identifiable people without consent
3. Match the theme and tone
4. Suggest both images and diagrams where appropriate
5. Include relevant icons and illustrations
6. Consider accessibility and readability

For each suggestion, provide:
- type: image, video, diagram, icon, illustration
- url: direct link if available, or null
- prompt: description for AI generation if no URL
- alt: basic alt text (will be enhanced)
- credit: attribution if needed
- relevance: 1-10 score
- description: what it shows and why it's relevant

Return as JSON array of media suggestions.
`;
  }

  private buildAltTextPrompt(input: MediaFinderInput, suggestion: MediaSuggestion): string {
    return `
Generate comprehensive alt text for this media suggestion:

Media Type: ${suggestion.type}
Description: ${suggestion.description}
Context: ${input.sectionContext}
Theme: ${input.themeStyle}

Guidelines:
1. Describe the function, not just appearance
2. Include relevant text if present
3. Mention colors only if important
4. Keep it concise but descriptive
5. Consider screen reader users

Generate a single, clear alt text description (max 125 characters).
`;
  }

  private parseMediaSuggestions(response: string): MediaSuggestion[] {
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      if (Array.isArray(parsed)) {
        return parsed.map(suggestion => ({
          type: suggestion.type || 'image',
          url: suggestion.url || null,
          prompt: suggestion.prompt || null,
          altText: suggestion.alt || 'Visual content',
          credit: suggestion.credit || null,
          relevance: suggestion.relevance || 5,
          description: suggestion.description || 'Media content'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to parse media suggestions:', error);
      return [{
        type: 'image',
        url: null,
        prompt: `Professional illustration related to ${input.keywords[0] || 'content'}`,
        altText: 'Relevant visual content',
        credit: null,
        relevance: 5,
        description: 'Visual content for slide'
      }];
    }
  }
}
