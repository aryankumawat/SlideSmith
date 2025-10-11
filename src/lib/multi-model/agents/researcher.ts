import { BaseAgent, AgentConfig } from '../base-agent';
import { ResearchSnippet, ResearchSnippetSchema } from '../schemas';
import { z } from 'zod';

// ============================================================================
// RESEARCHER AGENT - EVIDENCE COLLECTOR
// ============================================================================

export interface ResearcherInput {
  topic: string;
  audience: string;
  tone: string;
  sources?: string[];
  urls?: string[];
  maxSnippets?: number;
  minConfidence?: number;
}

export interface ResearcherOutput {
  snippets: ResearchSnippet[];
  coverage: {
    subtopics: string[];
    timeRange: { start: string; end: string };
    sourceTypes: string[];
  };
  quality: {
    averageConfidence: number;
    highConfidenceCount: number;
    sourceDiversity: number;
  };
}

export class ResearcherAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'researcher',
      description: 'Gathers concise, citeable snippets that answer the topic',
      capabilities: ['web-search', 'content-analysis', 'source-verification'],
      maxRetries: 3,
      timeout: 30000,
    };
    super(config);
  }

  async execute(input: ResearcherInput, context?: unknown): Promise<ResearcherOutput> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validateInput(input, this.getInputSchema())) {
        throw new Error('Invalid input for Researcher agent');
      }

      // Extract key subtopics from the topic
      const subtopics = await this.extractSubtopics(input.topic);
      
      // Search for information on each subtopic
      const searchQueries = this.generateSearchQueries(input.topic, subtopics, input.audience);
      
      // Execute searches in parallel
      const searchResults = await Promise.all(
        searchQueries.map(query => this.searchForInformation(query, input))
      );

      // Process and deduplicate results
      const rawSnippets = this.processSearchResults(searchResults, input);
      
      // Filter by confidence and quality
      const filteredSnippets = this.filterSnippets(rawSnippets, input);
      
      // Generate final snippets with proper IDs and metadata
      const snippets = this.generateFinalSnippets(filteredSnippets, input);
      
      // Calculate coverage and quality metrics
      const coverage = this.calculateCoverage(snippets);
      const quality = this.calculateQuality(snippets);

      const output: ResearcherOutput = {
        snippets,
        coverage,
        quality,
      };

      const duration = Date.now() - startTime;
      this.logExecution('researcher-task', input, output, duration);

      return output;

    } catch (error) {
      this.handleError(error, { input, context });
    }
  }

  private async extractSubtopics(topic: string): Promise<string[]> {
    const prompt = `Extract 3-5 key subtopics for research on: "${topic}"

Return as a JSON array of strings. Each subtopic should be:
- Specific and focused
- Researchable
- Relevant to the main topic

Example: ["market trends", "key challenges", "success factors", "future outlook"]`;

    const response = await this.callLLM(prompt);
    const subtopics = JSON.parse(response.content);
    return Array.isArray(subtopics) ? subtopics : [topic];
  }

  private generateSearchQueries(topic: string, subtopics: string[], audience: string): string[] {
    const queries = [
      `${topic} overview`,
      `${topic} trends 2024`,
      `${topic} best practices`,
    ];

    // Add audience-specific queries
    if (audience.toLowerCase().includes('technical')) {
      queries.push(`${topic} technical implementation`);
      queries.push(`${topic} architecture patterns`);
    } else if (audience.toLowerCase().includes('business')) {
      queries.push(`${topic} business value`);
      queries.push(`${topic} ROI benefits`);
    }

    // Add subtopic-specific queries
    subtopics.forEach(subtopic => {
      queries.push(`${topic} ${subtopic}`);
    });

    return queries.slice(0, 8); // Limit to 8 queries
  }

  private async searchForInformation(query: string, input: ResearcherInput): Promise<Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }>> {
    // In a real implementation, this would use web search APIs
    // For now, we'll simulate with LLM-based research
    const prompt = `Research information about: "${query}"

Provide 2-3 concise, factual snippets that would be useful for a presentation on "${input.topic}" for a "${input.audience}" audience.

For each snippet, include:
- A factual statement or insight
- A source (real or simulated for demo)
- A confidence level (0-1)
- Relevant tags

Return as JSON array:
[
  {
    "text": "Factual statement here",
    "source": "Source name",
    "url": "https://example.com",
    "confidence": 0.8,
    "tags": ["tag1", "tag2"]
  }
]`;

    try {
      const response = await this.callLLM(prompt);
      console.log(`[researcher] Raw response for query "${query}":`, response.content.substring(0, 200) + '...');
      const results = JSON.parse(response.content);
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.warn(`Search failed for query: ${query}`, error);
      console.warn(`Response content:`, response?.content?.substring(0, 200) + '...');
      return [];
    }
  }

  private processSearchResults(searchResults: Array<Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }>>, input: ResearcherInput): Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }> {
    const allSnippets = searchResults.flat();
    
    // Remove duplicates based on text similarity
    const uniqueSnippets = this.deduplicateSnippets(allSnippets);
    
    // Normalize and clean snippets
    return uniqueSnippets.map(snippet => ({
      ...snippet,
      text: this.cleanText(snippet.text),
      confidence: Math.max(0, Math.min(1, snippet.confidence || 0.5)),
      tags: Array.isArray(snippet.tags) ? snippet.tags : [],
    }));
  }

  private deduplicateSnippets(snippets: Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }>): Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }> {
    const seen = new Set<string>();
    const unique: Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }> = [];

    for (const snippet of snippets) {
      const normalizedText = snippet.text.toLowerCase().trim();
      if (!seen.has(normalizedText)) {
        seen.add(normalizedText);
        unique.push(snippet);
      }
    }

    return unique;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500); // Limit to 500 characters
  }

  private filterSnippets(snippets: Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }>, input: ResearcherInput): Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }> {
    const minConfidence = input.minConfidence || 0.6;
    const maxSnippets = input.maxSnippets || 15;

    return snippets
      .filter(snippet => snippet.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSnippets);
  }

  private generateFinalSnippets(snippets: Array<{ text: string; source: string; url?: string; confidence: number; tags: string[] }>, input: ResearcherInput): ResearchSnippet[] {
    return snippets.map((snippet, index) => ({
      id: `snippet-${Date.now()}-${index}`,
      source: snippet.source || 'Research',
      url: snippet.url,
      text: snippet.text,
      tags: snippet.tags || [],
      confidence: snippet.confidence,
      timestamp: new Date().toISOString(),
      author: snippet.author,
      title: snippet.title,
    }));
  }

  private calculateCoverage(snippets: ResearchSnippet[]): ResearcherOutput['coverage'] {
    const allTags = snippets.flatMap(s => s.tags);
    const uniqueTags = [...new Set(allTags)];
    
    const sources = snippets.map(s => s.source);
    const uniqueSources = [...new Set(sources)];

    return {
      subtopics: uniqueTags,
      timeRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      sourceTypes: uniqueSources,
    };
  }

  private calculateQuality(snippets: ResearchSnippet[]): ResearcherOutput['quality'] {
    const confidences = snippets.map(s => s.confidence);
    const averageConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    
    const highConfidenceCount = confidences.filter(c => c >= 0.8).length;
    
    const sources = snippets.map(s => s.source);
    const uniqueSources = new Set(sources).size;
    const sourceDiversity = uniqueSources / Math.max(sources.length, 1);

    return {
      averageConfidence,
      highConfidenceCount,
      sourceDiversity,
    };
  }

  private getInputSchema() {
    return z.object({
      topic: z.string().min(1),
      audience: z.string().min(1),
      tone: z.string().min(1),
      sources: z.array(z.string()).optional(),
      urls: z.array(z.string().url()).optional(),
      maxSnippets: z.number().min(1).max(50).optional(),
      minConfidence: z.number().min(0).max(1).optional(),
    });
  }

  protected validateOutput(output: ResearcherOutput): boolean {
    if (!output.snippets || !Array.isArray(output.snippets)) {
      return false;
    }

    if (output.snippets.length === 0) {
      return false;
    }

    // Validate each snippet
    for (const snippet of output.snippets) {
      try {
        ResearchSnippetSchema.parse(snippet);
      } catch {
        return false;
      }
    }

    return true;
  }

  protected getQualityScore(output: ResearcherOutput): number {
    const { quality } = output;
    
    // Weighted quality score
    const confidenceScore = quality.averageConfidence;
    const diversityScore = quality.sourceDiversity;
    const highConfidenceScore = quality.highConfidenceCount / Math.max(output.snippets.length, 1);
    
    return (confidenceScore * 0.4 + diversityScore * 0.3 + highConfidenceScore * 0.3);
  }
}
