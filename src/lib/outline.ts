import { LLMClient } from './llm';
import { Outline, GenerateRequest } from './schema';

export async function generateOutline(request: GenerateRequest): Promise<Outline> {
  const llm = new LLMClient({
    provider: (process.env.LLM_PROVIDER as any) || 'openai',
    apiKey: process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com',
    model: process.env.LLM_MODEL || 'gpt-4',
  });

  const prompt = createOutlinePrompt(request);
  return await llm.generateOutline(prompt);
}

function createOutlinePrompt(request: GenerateRequest): string {
  const { topic, detail, audience, tone, length } = request;
  
  return `You are an expert presentation designer. Create a structured outline for a presentation on "${topic}".

${detail ? `Additional details: ${detail}` : ''}
${audience ? `Target audience: ${audience}` : ''}
${tone ? `Tone: ${tone}` : ''}
${length ? `Target slide count: ${length}` : 'Target slide count: 10'}

Create a JSON outline with this exact structure:
{
  "title": "Presentation Title (max 60 chars)",
  "subtitle": "Brief subtitle (optional)",
  "agenda": [
    {
      "title": "Section Title",
      "objective": "One sentence describing what this section achieves",
      "slideCount": 3,
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "conclusion": "Brief conclusion message",
  "references": ["Reference 1", "Reference 2"]
}

Guidelines:
- Create 3-6 main sections
- Each section should have 2-5 slides
- Total slides should be close to the target count
- Use clear, action-oriented section titles
- Make objectives specific and measurable
- Include 2-4 key points per section
- Keep titles under 8 words
- Make the presentation flow logically

Return only the JSON, no other text.`;
}

export function validateOutline(outline: any): outline is Outline {
  if (!outline || typeof outline !== 'object') return false;
  if (!outline.title || typeof outline.title !== 'string') return false;
  if (!Array.isArray(outline.agenda)) return false;
  
  for (const item of outline.agenda) {
    if (!item.title || !item.objective || !item.slideCount || !Array.isArray(item.keyPoints)) {
      return false;
    }
  }
  
  return true;
}

export function estimateSlideCount(outline: Outline): number {
  return outline.agenda.reduce((total, item) => total + item.slideCount, 0);
}

export function createDefaultOutline(topic: string): Outline {
  return {
    title: topic,
    subtitle: 'AI-Generated Presentation',
    agenda: [
      {
        title: 'Introduction',
        objective: 'Introduce the topic and set context',
        slideCount: 2,
        keyPoints: ['Overview', 'Objectives', 'Agenda'],
      },
      {
        title: 'Main Content',
        objective: 'Present key information and insights',
        slideCount: 6,
        keyPoints: ['Key Point 1', 'Key Point 2', 'Key Point 3', 'Examples'],
      },
      {
        title: 'Conclusion',
        objective: 'Summarize and provide next steps',
        slideCount: 2,
        keyPoints: ['Summary', 'Key Takeaways', 'Next Steps'],
      },
    ],
    conclusion: 'Thank you for your attention. Questions?',
    references: [],
  };
}

