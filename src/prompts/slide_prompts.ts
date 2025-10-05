export const OUTLINE_PROMPT = `You are an expert presentation designer. Create a structured outline for a presentation.

Topic: {topic}
{detail}
Audience: {audience}
Tone: {tone}
Target slide count: {length}

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

export const SLIDE_PROMPT = `You are an expert presentation designer. Create a slide for section "{sectionTitle}" (slide {slideIndex} of {totalSlides}).

Section objective: {objective}
Key points to cover: {keyPoints}

Create a JSON slide with this exact structure:
{
  "id": "slide-{timestamp}-{slideIndex}",
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
{enableLive ? '- Consider adding a Live widget if relevant (chart, ticker, countdown, map, iframe)' : ''}

Theme: {theme} (consider visual style in content suggestions)

Return only the JSON, no other text.`;

export const REGENERATE_SLIDE_PROMPT = `You are an expert presentation designer. Regenerate a slide with the same structure but different content.

Original slide: {originalSlide}
Section: {sectionTitle}
Objective: {objective}
Key points: {keyPoints}

Create a JSON slide with this exact structure:
{
  "id": "{originalId}",
  "layout": "{originalLayout}",
  "blocks": [
    {
      "type": "Heading",
      "text": "New Slide Title (max 8 words)"
    },
    {
      "type": "Subheading", 
      "text": "New subtitle (optional)"
    },
    {
      "type": "Bullets",
      "items": ["New Point 1", "New Point 2", "New Point 3", "New Point 4", "New Point 5", "New Point 6"]
    }
  ],
  "notes": "New speaker notes for this slide (2-3 sentences)"
}

Guidelines:
- Keep the same layout and structure
- Generate fresh, engaging content
- Maintain the same objective and key points
- Use different wording and examples
- Keep text concise and scannable
- Follow 7±2 rule for bullet points
- Make speaker notes helpful for presenter

Theme: {theme}

Return only the JSON, no other text.`;

export const ADD_SLIDE_PROMPT = `You are an expert presentation designer. Add a new slide to the presentation.

Topic: {topic}
Section: {sectionTitle}
Objective: {objective}
Key points: {keyPoints}
Position: {position} (after slide {afterSlideIndex})
Total slides: {totalSlides}

Create a JSON slide with this exact structure:
{
  "id": "slide-{timestamp}-{slideIndex}",
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

Guidelines:
- Create content that fits naturally in the presentation flow
- Use appropriate layout for the content type
- Keep text concise and scannable
- Follow 7±2 rule for bullet points
- Include specific, concrete details
- Make speaker notes helpful for presenter

Theme: {theme}

Return only the JSON, no other text.`;

export const IMPROVE_SLIDE_PROMPT = `You are an expert presentation designer. Improve an existing slide to make it more engaging and effective.

Current slide: {currentSlide}
Section: {sectionTitle}
Objective: {objective}
Key points: {keyPoints}

Create an improved JSON slide with this exact structure:
{
  "id": "{originalId}",
  "layout": "{originalLayout}",
  "blocks": [
    {
      "type": "Heading",
      "text": "Improved Slide Title (max 8 words)"
    },
    {
      "type": "Subheading", 
      "text": "Improved subtitle (optional)"
    },
    {
      "type": "Bullets",
      "items": ["Improved Point 1", "Improved Point 2", "Improved Point 3", "Improved Point 4", "Improved Point 5", "Improved Point 6"]
    }
  ],
  "notes": "Improved speaker notes for this slide (2-3 sentences)"
}

Improvement guidelines:
- Make content more engaging and memorable
- Use stronger, more active language
- Add specific examples or data points
- Improve visual hierarchy and flow
- Make bullet points more actionable
- Enhance speaker notes with better guidance
- Consider adding visual elements (images, charts, quotes)
- Keep the same layout unless it needs to change

Theme: {theme}

Return only the JSON, no other text.`;

export const DEMO_PROMPT = `You are an expert presentation designer. Create a demo presentation about "Alcohol use trends across age groups in Australia" for policy stakeholders.

Create a JSON outline with this exact structure:
{
  "title": "Alcohol Use Trends in Australia",
  "subtitle": "A Policy Perspective on Age-Group Patterns",
  "agenda": [
    {
      "title": "Introduction",
      "objective": "Set the context for alcohol use trends in Australia",
      "slideCount": 2,
      "keyPoints": ["Overview of alcohol use in Australia", "Importance for policy makers", "Data sources and methodology"]
    },
    {
      "title": "Current Trends by Age Group",
      "objective": "Present key findings on alcohol consumption patterns",
      "slideCount": 4,
      "keyPoints": ["Youth consumption trends", "Middle-aged patterns", "Elderly consumption", "Gender differences"]
    },
    {
      "title": "Policy Implications",
      "objective": "Discuss what the trends mean for policy",
      "slideCount": 3,
      "keyPoints": ["Targeted interventions", "Resource allocation", "Monitoring and evaluation"]
    },
    {
      "title": "Conclusion",
      "objective": "Summarize key findings and next steps",
      "slideCount": 2,
      "keyPoints": ["Key takeaways", "Policy recommendations", "Future research needs"]
    }
  ],
  "conclusion": "Thank you for your attention. Questions?",
  "references": ["Australian Bureau of Statistics", "National Health Survey", "Alcohol and Drug Foundation"]
}

Return only the JSON, no other text.`;

export function formatPrompt(template: string, variables: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

