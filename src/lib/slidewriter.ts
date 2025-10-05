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

  const prompt = createEnhancedSlidePrompt(section, slideIndex, totalSlides, theme, enableLive);
  const response = await llm.generateContent(prompt);
  return parseSlideFromResponse(response, section, slideIndex);
}

function createEnhancedSlidePrompt(
  section: OutlineItem,
  slideIndex: number,
  totalSlides: number,
  theme: Theme,
  enableLive: boolean
): string {
  return `You are an expert presentation designer creating engaging, dynamic slides. Create a rich, informative slide for section "${section.title}" (slide ${slideIndex + 1} of ${totalSlides}).

Section objective: ${section.objective}
Key points to cover: ${section.keyPoints.join(', ')}

Create a JSON slide with this enhanced structure:
{
  "id": "slide-${Date.now()}-${slideIndex}",
  "layout": "title+bullets",
  "animation": "fadeIn",
  "blocks": [
    {
      "type": "Heading",
      "text": "Engaging Slide Title",
      "animation": "slideInFromTop"
    },
    {
      "type": "Subheading", 
      "text": "Compelling subtitle that adds context",
      "animation": "fadeIn"
    },
    {
      "type": "Markdown",
      "md": "**Key Insight:** Brief but impactful explanation of the main concept with specific details and examples.",
      "animation": "slideInFromLeft"
    },
    {
      "type": "Bullets",
      "items": [
        "Specific, actionable point with concrete details",
        "Data-driven insight with numbers or statistics", 
        "Real-world example or case study",
        "Important consideration or implication",
        "Next steps or call to action"
      ],
      "animation": "staggerIn"
    },
    {
      "type": "Chart",
      "chartType": "bar",
      "title": "Relevant Data Visualization",
      "data": {
        "labels": ["Category 1", "Category 2", "Category 3", "Category 4"],
        "datasets": [{
          "label": "Values",
          "data": [65, 78, 45, 82],
          "backgroundColor": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]
        }]
      },
      "animation": "scaleIn"
    },
    {
      "type": "Quote",
      "text": "Inspirational or insightful quote related to the topic",
      "author": "Relevant Expert or Source",
      "animation": "fadeIn"
    }
  ],
  "notes": "Detailed speaker notes with key talking points, statistics, examples, and transition to next slide. Include specific data points and engaging stories to keep audience attention."
}

Available block types with animations:
- "Heading": Main title with slideInFromTop, fadeIn, bounceIn
- "Subheading": Subtitle with fadeIn, slideInFromBottom  
- "Markdown": Rich text with slideInFromLeft, slideInFromRight, fadeIn
- "Bullets": Bullet points with staggerIn, slideInFromLeft, fadeIn
- "Image": Image with scaleIn, fadeIn, slideInFromLeft/Right
- "Quote": Quote with fadeIn, slideInFromBottom, scaleIn
- "Code": Code block with slideInFromLeft, fadeIn
- "Chart": Data visualization with scaleIn, slideInFromBottom, fadeIn
- "Live": Live widget with pulse, fadeIn (only if enableLive=true)

Available layouts:
- "title": Title slide with hero animation
- "title+bullets": Title with animated bullet points
- "two-col": Two column layout with staggered animations
- "media-left": Media on left with slideInFromLeft, text on right
- "media-right": Media on right with slideInFromRight, text on left  
- "quote": Quote slide with dramatic fadeIn
- "chart": Chart-focused slide with scaleIn animation
- "end": Conclusion slide with slideInFromBottom

Animation types:
- "fadeIn": Gentle fade in effect
- "slideInFromTop": Slide down from top
- "slideInFromBottom": Slide up from bottom
- "slideInFromLeft": Slide in from left
- "slideInFromRight": Slide in from right
- "scaleIn": Scale up from center
- "bounceIn": Bouncy entrance effect
- "staggerIn": Bullet points appear one by one
- "pulse": Subtle pulsing effect for live elements

Content Guidelines:
- Make content specific, data-driven, and actionable
- Include relevant statistics, examples, and case studies
- Use engaging language that tells a story
- Add visual elements like charts, quotes, or images when appropriate
- Create compelling speaker notes with detailed talking points
- Ensure content is directly relevant to "${section.title}"
- Theme: ${theme} (use appropriate colors and styling)
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
      
      // Validate and ensure required fields exist with enhanced defaults
      return {
        id: parsed.id || `slide-${Date.now()}-${slideIndex}`,
        layout: parsed.layout || 'title+bullets',
        animation: parsed.animation || 'fadeIn',
        blocks: parsed.blocks || createEnhancedFallbackBlocks(section),
        notes: parsed.notes || createEnhancedSpeakerNotes(section),
      };
    }
  } catch (error) {
    console.error('Error parsing slide from response:', error);
    console.error('Response that failed to parse:', response);
  }
  
  // Enhanced fallback: create a rich slide structure
  return {
    id: `slide-${Date.now()}-${slideIndex}`,
    layout: 'title+bullets',
    animation: 'fadeIn',
    blocks: createEnhancedFallbackBlocks(section),
    notes: createEnhancedSpeakerNotes(section),
  };
}

function createEnhancedFallbackBlocks(section: OutlineItem): SlideBlock[] {
  return [
    {
      type: 'Heading',
      text: section.title,
      animation: 'slideInFromTop'
    },
    {
      type: 'Subheading',
      text: section.objective,
      animation: 'fadeIn'
    },
    {
      type: 'Markdown',
      md: `**Key Focus:** ${section.objective}\n\nThis section explores the essential aspects of ${section.title.toLowerCase()} and provides actionable insights for implementation.`,
      animation: 'slideInFromLeft'
    },
    {
      type: 'Bullets',
      items: section.keyPoints.slice(0, 5).map(point => `• ${point}`),
      animation: 'staggerIn'
    },
    {
      type: 'Quote',
      text: `"Understanding ${section.title.toLowerCase()} is crucial for success in today's dynamic environment."`,
      author: 'Industry Expert',
      animation: 'fadeIn'
    }
  ];
}

function createEnhancedSpeakerNotes(section: OutlineItem): string {
  return `Speaker Notes for ${section.title}:

Key Talking Points:
• ${section.objective}
• ${section.keyPoints.slice(0, 3).join('\n• ')}

Engagement Tips:
- Start with a compelling statistic or story
- Use specific examples and case studies
- Encourage audience interaction with questions
- Provide actionable takeaways
- Connect to real-world applications

Transition: "Now that we've covered ${section.title.toLowerCase()}, let's move on to the next important aspect..."
`;
}

export function createTitleSlide(title: string, subtitle: string): Slide {
  return {
    id: 'slide-title',
    layout: 'title',
    animation: 'hero',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: title,
        animation: 'slideInFromTop'
      },
      {
        id: generateId('subheading'),
        type: 'Subheading',
        text: subtitle,
        animation: 'fadeIn'
      },
      {
        id: generateId('markdown'),
        type: 'Markdown',
        md: `**Welcome to this engaging presentation**\n\n*Prepared with AI-powered insights and dynamic visualizations*`,
        animation: 'slideInFromBottom'
      }
    ],
    notes: `Welcome the audience warmly. Introduce yourself and set the stage for an engaging presentation. Mention that this presentation includes dynamic content and interactive elements. Build excitement about what they'll learn.`,
  };
}

export function createAgendaSlide(agenda: OutlineItem[]): Slide {
  return {
    id: 'slide-agenda',
    layout: 'title+bullets',
    animation: 'fadeIn',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: 'Agenda Overview',
        animation: 'slideInFromTop'
      },
      {
        id: generateId('markdown'),
        type: 'Markdown',
        md: `**What we'll cover today:**\n\nA comprehensive journey through key topics with interactive elements and actionable insights.`,
        animation: 'slideInFromLeft'
      },
      {
        id: generateId('bullets'),
        type: 'Bullets',
        items: agenda.map((item, index) => `${index + 1}. **${item.title}** (${item.slideCount} slides) - ${item.objective}`),
        animation: 'staggerIn'
      },
      {
        id: generateId('quote'),
        type: 'Quote',
        text: "A well-structured presentation is the foundation of effective communication.",
        author: 'Presentation Expert',
        animation: 'fadeIn'
      }
    ],
    notes: `Walk through the agenda with enthusiasm. Explain the value each section will provide. Set expectations for interactive elements and encourage questions throughout. Mention the estimated duration and any breaks.`,
  };
}

export function createConclusionSlide(conclusion: string, references: string[]): Slide {
  return {
    id: 'slide-conclusion',
    layout: 'end',
    animation: 'slideInFromBottom',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: 'Key Takeaways',
        animation: 'slideInFromTop'
      },
      {
        id: generateId('markdown'),
        type: 'Markdown',
        md: `**Summary:**\n\n${conclusion}\n\n**Next Steps:**\n• Review the key points discussed\n• Consider how to apply these insights\n• Explore additional resources provided`,
        animation: 'slideInFromLeft'
      },
      ...(references.length > 0 ? [{
        id: generateId('subheading'),
        type: 'Subheading',
        text: 'Additional Resources',
        animation: 'fadeIn'
      }, {
        id: generateId('bullets'),
        type: 'Bullets',
        items: references,
        animation: 'staggerIn'
      }] : []),
      {
        id: generateId('quote'),
        type: 'Quote',
        text: "The best presentations don't just inform—they inspire action.",
        author: 'Communication Expert',
        animation: 'fadeIn'
      }
    ],
    notes: `Summarize the key points with energy. Emphasize the most important takeaways. Provide clear next steps for the audience. Thank them for their attention and open the floor for questions. Be available for follow-up discussions.`,
  };
}

export function createThankYouSlide(): Slide {
  return {
    id: 'slide-thank-you',
    layout: 'title',
    animation: 'hero',
    blocks: [
      {
        id: generateId('heading'),
        type: 'Heading',
        text: 'Thank You',
        animation: 'bounceIn'
      },
      {
        id: generateId('subheading'),
        type: 'Subheading',
        text: 'Questions & Discussion',
        animation: 'fadeIn'
      },
      {
        id: generateId('markdown'),
        type: 'Markdown',
        md: `**Contact Information:**\n\n*Ready to continue the conversation*\n\n📧 Email: your.email@example.com\n💼 LinkedIn: linkedin.com/in/yourprofile\n🐦 Twitter: @yourhandle`,
        animation: 'slideInFromBottom'
      },
      {
        id: generateId('quote'),
        type: 'Quote',
        text: "Great presentations create lasting connections and inspire meaningful conversations.",
        author: 'Presentation Expert',
        animation: 'fadeIn'
      }
    ],
    notes: `End with enthusiasm and gratitude. Encourage questions and discussion. Provide your contact information clearly. Be approachable and available for follow-up conversations. Thank the audience for their time and attention.`,
  };
}
