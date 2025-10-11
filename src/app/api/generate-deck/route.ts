import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  generateOutline, 
  generateSlide, 
  generateVisual, 
  harvestFactsForSlide, 
  tableMatchesTitle, 
  tableForTitle, 
  attachChartSpec, 
  parseDocuments 
} from '@/lib/deck-generator';

// Request validation schema
const GenerateDeckRequestSchema = z.object({
  mode: z.enum(['quick_prompt', 'doc_to_deck']),
  topic_or_prompt: z.string().optional(),
  instructions: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'academic', 'persuasive']).default('professional'),
  audience: z.enum(['general', 'executives', 'technical', 'students']).default('general'),
  slide_count: z.number().min(3).max(50).default(10),
  theme: z.enum(['deep_space', 'ultra_violet', 'minimal', 'corporate']).default('deep_space'),
  live_widgets: z.boolean().default(false),
  assets: z.object({
    doc_urls: z.array(z.string()).optional(),
    image_urls: z.array(z.string()).optional(),
    xlsx_urls: z.array(z.string()).optional(),
  }).optional(),
});

// Response types
export type ChartSpec = {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data?: any;
  caption?: string;
};

export type Slide = {
  layout: 'title' | 'title_bullets' | 'two_column' | 'quote' | 'chart' | 'image_full';
  title: string;
  bullets?: string[];
  notes?: string;
  chart_spec?: ChartSpec | null;
  image?: { prompt: string; alt: string; source: 'generated' | 'uploaded' | 'url' };
  citations?: string[];
};

export type Deck = {
  title: string;
  theme: string;
  slides: Slide[];
};

export type GenerateDeckResponse = {
  deck: Deck;
  exports: {
    pptx_url: string;
    pdf_url: string;
    json_url: string;
  };
};

// Theme tokens
const themes = {
  deep_space: {
    bg: '#0B0F1A',
    surface: '#101828',
    primary: '#7C3AED',
    accent: '#22D3EE',
    text: '#E2E8F0',
    muted: '#94A3B8',
    font: 'Inter, system-ui, -apple-system',
    image_style: 'dark, subtle starfield, soft glow, high contrast'
  },
  ultra_violet: {
    bg: '#0F0820',
    surface: '#1B1035',
    primary: '#A855F7',
    accent: '#06B6D4',
    text: '#F8FAFC',
    muted: '#A1A1AA',
    font: 'Inter, system-ui, -apple-system',
    image_style: 'vibrant violet gradients, glassmorphism, soft blur'
  },
  minimal: {
    bg: '#FFFFFF',
    surface: '#F8FAFC',
    primary: '#1F2937',
    accent: '#3B82F6',
    text: '#111827',
    muted: '#6B7280',
    font: 'Inter, system-ui, -apple-system',
    image_style: 'clean, minimalist, high contrast, geometric'
  },
  corporate: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#1E40AF',
    accent: '#059669',
    text: '#111827',
    muted: '#6B7280',
    font: 'Inter, system-ui, -apple-system',
    image_style: 'professional, clean, corporate blue accents'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = GenerateDeckRequestSchema.parse(body);
    
    console.log('[Generate Deck API] Starting generation with mode:', validatedData.mode);
    
    // Normalize metadata
    const meta = {
      slide_count: validatedData.slide_count,
      audience: validatedData.audience,
      tone: validatedData.tone,
      theme: validatedData.theme,
      live_widgets: validatedData.live_widgets
    };
    
    // Process documents if in doc_to_deck mode
    let docSummary = '';
    if (validatedData.mode === 'doc_to_deck' && validatedData.assets?.doc_urls) {
      docSummary = await parseDocuments(validatedData.assets.doc_urls);
    }
    
    // Generate outline
    const outline = await generateOutline({
      slide_count: meta.slide_count,
      audience: meta.audience,
      tone: meta.tone,
      topic_or_prompt_or_instructions: validatedData.topic_or_prompt || validatedData.instructions || '',
      doc_summary_or_empty: docSummary
    });
    
    // Generate slides
    const slides: Slide[] = [];
    for (const section of outline.sections) {
      for (const slot of section.slides) {
        const perSlideFacts = docSummary ? harvestFactsForSlide(docSummary, slot.title) : '';
        const draft = await generateSlide({
          slide_context: slot,
          per_slide_extracted_text_or_empty: perSlideFacts
        });
        
        let withChart = draft;
        if (!draft.chart_spec && tableMatchesTitle(docSummary, slot.title)) {
          withChart = attachChartSpec(draft, tableForTitle(docSummary, slot.title));
        }
        
        const visual = await generateVisual({
          title: draft.title,
          bullets: draft.bullets,
          theme_style: themes[meta.theme].image_style
        });
        
        slides.push({
          layout: slot.layout,
          title: draft.title,
          bullets: draft.bullets,
          notes: draft.notes,
          chart_spec: withChart.chart_spec || null,
          image: { prompt: visual.prompt, alt: visual.alt, source: 'generated' },
          citations: draft.citations || []
        });
      }
    }
    
    const deck: Deck = {
      title: outline.title,
      theme: meta.theme,
      slides
    };
    
    // Generate export URLs (placeholder for now)
    const exports = {
      pptx_url: `export://deck-${Date.now()}.pptx`,
      pdf_url: `export://deck-${Date.now()}.pdf`,
      json_url: `export://deck-${Date.now()}.json`
    };
    
    const response: GenerateDeckResponse = {
      deck,
      exports
    };
    
    console.log('[Generate Deck API] Generation completed successfully');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Generate Deck API] Generation failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Deck generation failed' },
      { status: 500 }
    );
  }
}

