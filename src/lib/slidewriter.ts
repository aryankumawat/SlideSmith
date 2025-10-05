import { LLMClient } from './llm';
import { Slide, SlideBlock, OutlineItem, Theme } from './schema';

export async function generateSlide(
  section: OutlineItem,
  slideIndex: number,
  totalSlides: number,
  theme: Theme = 'DeepSpace',
  enableLive: boolean = false
): Promise<Slide> {
  const llm = new LLMClient({
    provider: (process.env.LLM_PROVIDER as any) || 'openai',
    apiKey: process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com',
    model: process.env.LLM_MODEL || 'gpt-4',
  });

  const prompt = createSlidePrompt(section, slideIndex, totalSlides, theme, enableLive);
  const response = await llm.generateContent(prompt);
  return parseSlideFromResponse(response, section, slideIndex);
}

function createSlidePrompt(
  section: OutlineItem,
  slideIndex: number,
  totalSlides: number,
  theme: Theme,
  enableLive: boolean
): string {
  return `You are an expert presentation designer. Create a slide for section "${section.title}" (slide ${slideIndex + 1} of ${totalSlides}).

Section objective: ${section.objective}
Key points to cover: ${section.keyPoints.join(', ')}

Create a JSON slide with this exact structure:
{
  "id": "slide-${Date.now()}-${slideIndex}",
  "layout": "title+bullets",
  "blocks": [
    {
      "type": "Heading",
      "text": "Slide Title (max 8 words)"
    },
    {
      "type": "Subheading", 
      "text": "Brief subtitle (optional)"
    },
    {
      "type": "Bullets",
      "items": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6"]
    }
  ],
  "notes": "Speaker notes for this slide (2-3 sentences)"
}

Available block types:
- "Heading": Main title (max 8 words)
- "Subheading": Subtitle (max 15 words) 
- "Markdown": Rich text content
- "Bullets": Bullet points (max 6 items, 7±2 rule)
- "Image": Image with caption
- "Quote": Quote with optional author
- "Code": Code block with language
- "Chart": Data visualization
- "Live": Live widget (only if enableLive=true)

Available layouts:
- "title": Title slide
- "title+bullets": Title with bullet points
- "two-col": Two column layout
- "media-left": Media on left, text on right
- "media-right": Media on right, text on left
- "quote": Quote slide
- "chart": Chart-focused slide
- "end": Conclusion slide

Guidelines:
- Keep text concise and scannable
- Use active voice and strong verbs
- Follow 7±2 rule for bullet points
- Include specific, concrete details
- Make it visually interesting
- Speaker notes should be helpful for presenter
- Choose appropriate layout for content type
${enableLive ? '- Consider adding a Live widget if relevant (chart, ticker, countdown, map, iframe)' : ''}

Theme: ${theme} (consider visual style in content suggestions)

Return only the JSON, no other text.`;
}

function parseSlideFromResponse(response: string, section: OutlineItem, slideIndex: number): Slide {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the slide
      return {
        id: parsed.id || `slide-${Date.now()}-${slideIndex}`,
        layout: parsed.layout || 'title+bullets',
        blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
        notes: parsed.notes || `Speaker notes for ${section.title}`,
      };
    }
  } catch (error) {
    console.error('Error parsing slide from LLM response:', error);
  }

  // Fallback: create a basic slide
  return createFallbackSlide(section, slideIndex);
}

function createFallbackSlide(section: OutlineItem, slideIndex: number): Slide {
  return {
    id: `slide-${Date.now()}-${slideIndex}`,
    layout: 'title+bullets',
    blocks: [
      {
        type: 'Heading' as const,
        text: section.title,
      },
      {
        type: 'Subheading' as const,
        text: section.objective,
      },
      {
        type: 'Bullets' as const,
        items: section.keyPoints.slice(0, 6),
      },
    ],
    notes: `Speaker notes for ${section.title}: ${section.objective}`,
  };
}

export function createTitleSlide(title: string, subtitle?: string): Slide {
  return {
    id: 'slide-title',
    layout: 'title',
    blocks: [
      {
        type: 'Heading' as const,
        text: title,
      },
      ...(subtitle ? [{
        type: 'Subheading' as const,
        text: subtitle,
      }] : []),
    ],
    notes: 'Welcome to the presentation. Introduce yourself and the topic.',
  };
}

export function createAgendaSlide(agenda: OutlineItem[]): Slide {
  return {
    id: 'slide-agenda',
    layout: 'title+bullets',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: 'Agenda',
      },
      {
        id: generateId('bullets'),
        type: 'Bullets',
        items: agenda.map(item => `${item.title} (${item.slideCount} slides)`),
      },
    ],
    notes: 'Walk through the agenda and set expectations for the presentation.',
  };
}

export function createConclusionSlide(conclusion: string, references?: string[]): Slide {
  const blocks: SlideBlock[] = [
    {
      id: generateId('heading'),
      type: 'Heading',
      text: 'Conclusion',
    },
    {
      id: generateId('markdown'),
      type: 'Markdown',
      md: conclusion,
    },
  ];

  if (references && references.length > 0) {
    blocks.push({
      id: generateId('subheading'),
      type: 'Subheading',
      text: 'References',
    });
    blocks.push({
      id: generateId('bullets'),
      type: 'Bullets',
      items: references.slice(0, 6),
    });
  }

  return {
    id: 'slide-conclusion',
    layout: 'title+bullets',
    blocks,
    notes: 'Summarize key points and thank the audience. Invite questions.',
  };
}

export function createThankYouSlide(): Slide {
  return {
    id: 'slide-thankyou',
    layout: 'title',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: 'Thank You',
      },
      {
        id: generateId('subheading'),
        type: 'Subheading',
        text: 'Questions?',
      },
    ],
    notes: 'Thank the audience and invite questions. Be available for follow-up.',
  };
}

export function validateSlide(slide: any): slide is Slide {
  if (!slide || typeof slide !== 'object') return false;
  if (!slide.id || typeof slide.id !== 'string') return false;
  if (!slide.layout || typeof slide.layout !== 'string') return false;
  if (!Array.isArray(slide.blocks)) return false;
  
  for (const block of slide.blocks) {
    if (!block.type || typeof block.type !== 'string') return false;
  }
  
  return true;
}
