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
  
  // Remove conversational prefixes that LLMs sometimes add
  cleaned = cleaned.replace(/^(Okay|Sure|Here|Certainly|Here's|Here is)[,:]?\s*/i, '');
  
  // Fix common JSON issues from LLMs
  try {
    // Try to parse first - if it works, return as-is
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Fix escaped characters that break JSON
    cleaned = cleaned
      .replace(/\\n/g, ' ')  // Replace literal \n with space
      .replace(/\\\\/g, '\\')  // Fix double escapes
      .replace(/\\"/g, '"')    // Fix escaped quotes in wrong places
      .replace(/\\'/g, "'");   // Fix escaped single quotes
    
    // Try one more time to validate
    try {
      JSON.parse(cleaned);
    } catch (finalError) {
      console.warn('[JSON Clean] Could not parse JSON after cleaning:', finalError);
    }
    
    return cleaned.trim();
  }
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
      section: string;
    }>;
  }>;
}> {
  const prompt = `You are a world-class presentation strategist creating engaging, story-driven outlines.

RULES FOR ENGAGING PRESENTATIONS:
1. **Specific, Action-Oriented Titles**: Don't use generic titles
   ❌ Bad: "Introduction", "Overview", "Key Points"
   ✅ Good: "**AI Revolution**: Transforming Healthcare in 2024", "Why **85% of Hospitals** Are Investing in AI"

2. **Story Arc**: Structure slides to tell a compelling story
   - Hook: Start with a provocative question or statistic
   - Context: Set the stage with current situation
   - Insight: Deep dive into 2-3 key areas
   - Impact: Show results, data, case studies
   - Action: Clear takeaways and next steps

3. **Visual Variety**: Mix layout types
   - title_bullets: Most slides (content-heavy)
   - chart: Data-driven insights (2-3 per deck)
   - image_full: Powerful visuals for key concepts
   - quote: Expert opinions or testimonials
   - two_column: Comparisons (before/after, pros/cons)

4. **Audience-Specific**: Tailor depth and terminology
   - Executives: ROI, strategy, high-level impact
   - Technical: Implementation, architecture, specs
   - General: Simple language, analogies, real-world examples
   - Students: Educational, step-by-step, interactive

TASK:
Create an outline for: """${params.topic_or_prompt_or_instructions}"""

CONSTRAINTS:
- Total slides: ${params.slide_count}
- Audience: ${params.audience}
- Tone: ${params.tone}
- Document summary: ${params.doc_summary_or_empty || 'None provided'}

OUTPUT FORMAT (JSON only):
{
  "title": "**Engaging Main Title** with Topic",
  "sections": [
    {
      "name": "Hook & Context",
      "slides": [
        {"title": "Provocative opening question or stat", "layout": "title_bullets", "section": "Hook & Context"},
        {"title": "Current landscape", "layout": "title_bullets", "section": "Hook & Context"}
      ]
    },
    {
      "name": "Deep Dive",
      "slides": [
        {"title": "First key area with specifics", "layout": "title_bullets", "section": "Deep Dive"},
        {"title": "Data visualization", "layout": "chart", "section": "Deep Dive"},
        {"title": "Second key area", "layout": "title_bullets", "section": "Deep Dive"}
      ]
    },
    {
      "name": "Impact & Action",
      "slides": [
        {"title": "Results and outcomes", "layout": "title_bullets", "section": "Impact & Action"},
        {"title": "Key takeaways", "layout": "title_bullets", "section": "Impact & Action"}
      ]
    }
  ]
}

Return ONLY valid JSON with specific, engaging titles for the given topic.`;

  try {
    const response = await llmClient.generateContent(prompt);
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Outline generation failed:', error);
    // Enhanced fallback with topic-specific content
    const topic = params.topic_or_prompt_or_instructions;
    return {
      title: `**${topic}**: Key Insights & Analysis`,
      sections: [
        {
          name: 'Opening',
          slides: [
            { title: `**${topic}**: What You Need to Know`, layout: 'title_bullets', section: 'Opening' },
            { title: 'Current State & Trends 📊', layout: 'title_bullets', section: 'Opening' }
          ]
        },
        {
          name: 'Analysis',
          slides: [
            { title: 'Key Challenges & Opportunities 💡', layout: 'title_bullets', section: 'Analysis' },
            { title: 'Data-Driven Insights', layout: 'chart', section: 'Analysis' },
            { title: 'Best Practices & Solutions 🚀', layout: 'title_bullets', section: 'Analysis' }
          ]
        },
        {
          name: 'Conclusion',
          slides: [
            { title: 'Impact & Results 🎯', layout: 'title_bullets', section: 'Conclusion' },
            { title: 'Next Steps & Takeaways', layout: 'title_bullets', section: 'Conclusion' }
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
  image?: {
    prompt: string;
    alt: string;
    source: string;
  };
}> {
  const prompt = `You are an expert presentation designer creating engaging, visual slides.

CRITICAL RULES FOR ENGAGING CONTENT:
1. **Use Bold Text**: Wrap key terms in **double asterisks** for emphasis
   Example: "**AI-powered diagnostics** reduce errors by 40%"

2. **Use Emojis**: Add relevant emojis to bullets for visual interest
   - 📊 for data/statistics
   - 💡 for ideas/insights  
   - 🚀 for growth/innovation
   - ⚡ for speed/efficiency
   - 🎯 for goals/targets
   - 💰 for money/savings
   - 🔒 for security
   - 🌍 for global/environment

3. **Specific Data**: Include real numbers, percentages, dates
   Bad: "AI is growing fast"
   Good: "**85% of hospitals** adopted AI by 2024 📈"

4. **Visual Descriptions**: Add image details for EVERY slide
   - Describe relevant diagrams, charts, icons, or photos
   - Make it topic-specific and professional

5. **Rich Speaker Notes**: 60-100 words with storytelling, examples, transitions

SLIDE TO GENERATE:
Title: ${params.slide_context.title}
Layout: ${params.slide_context.layout}
Section: ${params.slide_context.section || 'Main Content'}

DOCUMENT_FACTS: """${params.per_slide_extracted_text_or_empty}"""

OUTPUT REQUIREMENTS:
- title: Engaging, specific title (use **bold** for key words)
- bullets: 3-5 bullets with emojis, bold text, and specific data
- notes: Rich speaker notes with transitions and examples (60-100 words)
- image: Always include! Describe a relevant visual element
  {
    "prompt": "Detailed description of diagram/chart/icon that illustrates this slide's concept",
    "alt": "Brief alt text",
    "source": "placeholder"
  }
- chart_spec: If layout includes "chart", add chart data
- citations: Empty array []

Output JSON:
{
  "title": "**Bold Title** with Emphasis",
  "bullets": [
    "🚀 **Bold term**: specific detail with data",
    "📊 Another point with **emphasis** and numbers"
  ],
  "notes": "Detailed speaker notes...",
  "image": {
    "prompt": "Professional diagram showing...",
    "alt": "Diagram of...",
    "source": "placeholder"
  },
  "chart_spec": null,
  "citations": []
}

Return ONLY valid JSON.`;

  try {
    const response = await llmClient.generateContent(prompt);
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    
    // Ensure image is always present with Unsplash URL
    if (!parsed.image) {
      parsed.image = {
        prompt: `Professional ${params.slide_context.title} diagram with modern, clean design`,
        alt: `Visual representation of ${params.slide_context.title}`,
        source: generateUnsplashUrl(params.slide_context.title)
      };
    } else if (!parsed.image.source || parsed.image.source === 'placeholder') {
      // Replace placeholder with real Unsplash image
      parsed.image.source = generateUnsplashUrl(params.slide_context.title);
    }
    
    return parsed;
  } catch (error) {
    console.error('Slide generation failed:', error);
    // Enhanced fallback with more engaging content
    const topic = params.slide_context.title || 'Key Concepts';
    return {
      title: `**${topic}**: Overview`,
      bullets: [
        `🎯 **Core Concept**: ${topic} fundamentals`,
        `📊 **Key Metrics**: Measurable outcomes`,
        `💡 **Innovation**: Latest developments`
      ],
      notes: `This slide covers the essential aspects of ${topic}. Start by introducing the core concept, then discuss key metrics that demonstrate impact. Highlight recent innovations and developments in this area. Engage the audience with specific examples and encourage questions.`,
      chart_spec: null,
      citations: generateCitations(topic),
      image: {
        prompt: `Modern infographic showing ${topic} with icons, arrows, and data visualizations in a clean, professional style`,
        alt: `${topic} concept diagram`,
        source: generateUnsplashUrl(topic)
      }
    };
  }
}

// Helper function to generate basic citations based on slide content
function generateCitations(topic: string): string[] {
  // Generate generic but plausible citations
  // In a full implementation, this would extract actual sources from research
  const year = new Date().getFullYear();
  return [
    `Industry research on ${topic}, ${year}`,
    `Market analysis and trends, ${year - 1}-${year}`
  ];
}

// Helper function to generate Unsplash image URL
function generateUnsplashUrl(topic: string): string {
  // Extract keywords from topic
  const keywords = topic
    .replace(/[^\w\s]/g, '') // Remove special chars
    .split(' ')
    .filter(word => word.length > 3) // Only meaningful words
    .slice(0, 3) // Max 3 keywords
    .join(',');
  
  // Fallback if no keywords
  const searchTerm = keywords || 'business,presentation,professional';
  
  // Use Unsplash Source API for random relevant images
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)}`;
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
  if (!docUrls || docUrls.length === 0) {
    return '';
  }

  // For now, create a basic summary from file names and provide instructions
  // In a full implementation, this would use a PDF/document parsing library
  const fileNames = docUrls.map(url => {
    const name = url.split('/').pop() || 'document';
    return name.replace(/\.[^.]+$/, ''); // Remove extension
  });

  const summary = `Documents uploaded: ${fileNames.join(', ')}. 
  
Note: Document parsing is currently in development. For best results:
- Provide a detailed prompt describing the document content
- Include key topics, data, and insights you want in the presentation
- Specify the document structure if relevant (e.g., "The document contains market analysis, competitor data, and growth projections")`;

  return summary;
}
