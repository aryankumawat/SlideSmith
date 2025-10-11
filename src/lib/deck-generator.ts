import { LLMClient, LLMConfig } from './llm';

// Initialize LLM client with environment variables
const getLLMConfig = (): LLMConfig => {
  const provider = (process.env.LLM_PROVIDER || 'ollama') as 'openai' | 'ollama' | 'demo';
  const apiKey = process.env.LLM_API_KEY || 'ollama';
  const baseUrl = process.env.LLM_BASE_URL || 'http://localhost:11434';
  const model = process.env.LLM_MODEL || 'gemma3:4b';
  
  return {
    provider,
    apiKey,
    baseUrl,
    model
  };
};

const llmClient = new LLMClient(getLLMConfig());

// Helper function to clean markdown-wrapped JSON from LLM responses
function cleanJSONResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  return cleaned.trim();
}

export async function generateOutline(params: {
  slide_count: number;
  audience: string;
  tone: string;
  topic_or_prompt_or_instructions: string;
  doc_summary_or_empty: string;
}): Promise<{
  title: string;
  sections: Array<{
    name: string;
    slides: Array<{
      title: string;
      layout: string;
    }>;
  }>;
}> {
  const prompt = `You are a world-class presentation planner.
Goal: Turn the USER_INPUT into a clear slide outline.

Constraints:
- Max slides: ${params.slide_count}
- Audience: ${params.audience}
- Tone: ${params.tone}
- If DOCUMENT_SUMMARY is present, preserve its section order unless the user says otherwise.
- Prefer concise titles (<50 chars) and 3–5 bullets per slide (<9 words each).
- Include at least one data/visual slide if tables/data exist.

Inputs:
USER_INPUT: """${params.topic_or_prompt_or_instructions}"""
DOCUMENT_SUMMARY: """${params.doc_summary_or_empty}"""

Output JSON with fields:
{
  "title": "...",
  "sections": [
    {"name": "...", "slides": [{"title":"...", "layout":"title|title_bullets|two_column|chart|image_full|quote"}]}
  ]
}
Return ONLY valid JSON.`;

  try {
    const response = await llmClient.generateContent(prompt);
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Outline generation failed:', error);
    // Fallback outline
    return {
      title: 'Generated Presentation',
      sections: [
        {
          name: 'Introduction',
          slides: [
            { title: 'Welcome', layout: 'title' },
            { title: 'Agenda', layout: 'title_bullets' }
          ]
        },
        {
          name: 'Main Content',
          slides: [
            { title: 'Key Points', layout: 'title_bullets' },
            { title: 'Data Overview', layout: 'chart' }
          ]
        },
        {
          name: 'Conclusion',
          slides: [
            { title: 'Summary', layout: 'title_bullets' },
            { title: 'Thank You', layout: 'title' }
          ]
        }
      ]
    };
  }
}

export async function generateSlide(params: {
  slide_context: any;
  per_slide_extracted_text_or_empty: string;
}): Promise<{
  title: string;
  bullets: string[];
  notes: string;
  chart_spec: any;
  citations: string[];
}> {
  const prompt = `You write crisp, high-signal slide content from an outline.
Rules:
- 3–5 bullets, each < 9 words.
- No fluff, no repetition.
- Add "notes" for speaker (~40-90 words).
- If layout is "chart", propose "chart_spec" with type and fields.

Inputs:
SLIDE_CONTEXT: ${JSON.stringify(params.slide_context)}
DOCUMENT_FACTS: """${params.per_slide_extracted_text_or_empty}"""

Output JSON schema:
{ "title":"", "bullets":[], "notes":"", "chart_spec":null, "citations":[] }
Return ONLY JSON.`;

  try {
    const response = await llmClient.generateContent(prompt);
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Slide generation failed:', error);
    // Fallback slide
    return {
      title: params.slide_context.title || 'Sample Slide',
      bullets: ['Key point 1', 'Key point 2', 'Key point 3'],
      notes: 'Speaker notes for this slide',
      chart_spec: null,
      citations: []
    };
  }
}

export async function generateVisual(params: {
  title: string;
  bullets: string[];
  theme_style: string;
}): Promise<{
  prompt: string;
  alt: string;
}> {
  const prompt = `Task: Produce an image prompt for a slide.
Style: ${params.theme_style} (e.g., "Deep Space: dark, subtle stars, neon accents, high contrast, minimalist").
Avoid text inside images.

Input:
SLIDE_TITLE: "${params.title}"
SLIDE_BULLETS: ${JSON.stringify(params.bullets)}

Output:
{ "prompt": "..." , "alt": "..." }`;

  try {
    const response = await llmClient.generateContent(prompt);
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Visual generation failed:', error);
    // Fallback visual
    return {
      prompt: `Minimalist illustration of ${params.title}`,
      alt: `Visual representation of ${params.title}`
    };
  }
}

// Helper functions
export function harvestFactsForSlide(docSummary: string, title: string): string {
  // TODO: Implement fact harvesting from document summary
  return '';
}

export function tableMatchesTitle(docSummary: string, title: string): boolean {
  // TODO: Implement table matching logic
  return false;
}

export function tableForTitle(docSummary: string, title: string): any {
  // TODO: Implement table extraction
  return null;
}

export function attachChartSpec(draft: any, table: any): any {
  // TODO: Implement chart spec attachment
  return draft;
}

export async function parseDocuments(docUrls: string[]): Promise<string> {
  // TODO: Implement document parsing
  return 'Document content summary placeholder';
}
