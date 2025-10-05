import { LLMClient, createLLMClient } from './llm';
import { Slide, SlideBlock, OutlineItem, Theme } from './schema';

// Helper function to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function generateSlide(
  section: OutlineItem,
  slideIndex: number,
  totalSlides: number,
  theme: Theme = 'DeepSpace',
  enableLive: boolean = false
): Promise<Slide> {
  const llm = createLLMClient();

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

Requirements:
- Make the content relevant to "${section.title}"
- Use professional, engaging language
- Keep bullet points concise (max 8 words each)
- Ensure content is accurate and informative
- Theme: ${theme}
- Live widgets: ${enableLive ? 'enabled' : 'disabled'}

Return only the JSON object, no additional text.`;
}

function parseSlideFromResponse(response: string, section: OutlineItem, slideIndex: number): Slide {
  try {
    // Clean the response - remove any control characters that might cause JSON parsing issues
    const cleanedResponse = response.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Try to extract JSON from the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure required fields exist
      return {
        id: parsed.id || `slide-${Date.now()}-${slideIndex}`,
        layout: parsed.layout || 'title+bullets',
        blocks: parsed.blocks || [
          {
            type: 'Heading',
            text: section.title,
          },
          {
            type: 'Bullets',
            items: section.keyPoints.slice(0, 6),
          },
        ],
        notes: parsed.notes || `Speaker notes for ${section.title}: ${section.objective}`,
      };
    }
  } catch (error) {
    console.error('Error parsing slide from response:', error);
    console.error('Response that failed to parse:', response);
  }
  
  // Fallback: create a basic slide structure
  return {
    id: `slide-${Date.now()}-${slideIndex}`,
    layout: 'title+bullets',
    blocks: [
      {
        type: 'Heading',
        text: section.title,
      },
      {
        type: 'Subheading',
        text: section.objective,
      },
      {
        type: 'Bullets',
        items: section.keyPoints.slice(0, 6),
      },
    ],
    notes: `Speaker notes for ${section.title}: ${section.objective}`,
  };
}

export function createTitleSlide(title: string, subtitle: string): Slide {
  return {
    id: 'slide-title',
    layout: 'title+subtitle',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: title,
      },
      {
        id: generateId('subheading'),
        type: 'Subheading',
        text: subtitle,
      },
    ],
    notes: 'Welcome the audience and introduce yourself. Set the tone for the presentation.',
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

export function createConclusionSlide(conclusion: string, references: string[]): Slide {
  return {
    id: 'slide-conclusion',
    layout: 'title+bullets',
    blocks: [
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
      ...(references.length > 0 ? [{
        id: generateId('subheading'),
        type: 'Subheading',
        text: 'References',
      }, {
        id: generateId('bullets'),
        type: 'Bullets',
        items: references,
      }] : []),
    ],
    notes: 'Summarize key points and provide clear next steps. Thank the audience.',
  };
}

export function createThankYouSlide(): Slide {
  return {
    id: 'slide-thank-you',
    layout: 'title+subtitle',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: 'Thank You',
      },
      {
        id: generateId('subheading'),
        type: 'Subheading',
        text: 'Questions & Discussion',
      },
    ],
    notes: 'Thank the audience and open the floor for questions.',
  };
}
