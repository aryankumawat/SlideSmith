import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequestSchema, Deck, Slide } from '@/lib/schema';
import { generateOutline } from '@/lib/outline';
import { generateSlide, createTitleSlide, createAgendaSlide, createConclusionSlide, createThankYouSlide } from '@/lib/slidewriter';
import { checkRateLimit } from '@/lib/llm';
import { PresentationPlanner } from '@/lib/planner';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = GenerateRequestSchema.parse(body);
    
    const { topic, detail, tone, audience, length, theme, enableLive, mode = 'plan' } = validatedData;

    if (mode === 'plan') {
      // Generate plan only
      console.log('Generating plan for mode:', mode);
      const planner = new PresentationPlanner();
      const plan = await planner.generatePlan({
        topic,
        detail: detail || '',
        tone,
        audience,
        length,
        theme,
        includeLiveWidgets: enableLive,
      });

      console.log('Generated plan:', plan);
      return NextResponse.json({ plan });
    }

    // Generate outline
    const outline = await generateOutline(validatedData);
    
    // Create deck
    const deckId = `deck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const slides: Slide[] = [];
    
    // Add title slide
    slides.push(createTitleSlide(outline.title, outline.subtitle));
    
    // Add agenda slide
    slides.push(createAgendaSlide(outline.agenda));
    
    // Generate content slides
    let slideIndex = 2; // Start after title and agenda
    const totalSlides = outline.agenda.reduce((sum, item) => sum + item.slideCount, 0) + 4; // +4 for title, agenda, conclusion, thank you
    
    for (const section of outline.agenda) {
      for (let i = 0; i < section.slideCount; i++) {
        try {
          const slide = await generateSlide(
            section,
            slideIndex,
            totalSlides,
            theme || 'DeepSpace',
            enableLive || false
          );
          slides.push(slide);
          slideIndex++;
        } catch (error) {
          console.error(`Error generating slide ${slideIndex}:`, error);
          // Add fallback slide
          slides.push({
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
          });
          slideIndex++;
        }
      }
    }
    
    // Add conclusion slide
    slides.push(createConclusionSlide(outline.conclusion, outline.references));
    
    // Add thank you slide
    slides.push(createThankYouSlide());
    
    const deck: Deck = {
      id: deckId,
      meta: {
        title: outline.title,
        subtitle: outline.subtitle,
        author: 'AI Slide Maker',
        date: new Date().toISOString().split('T')[0],
        audience: audience || 'General audience',
        tone: tone || 'Professional',
        theme: theme || 'DeepSpace',
      },
      slides,
    };

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Error generating deck:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Slide Maker API',
    version: '1.0.0',
    endpoints: {
      generate: 'POST /api/generate',
      exportPdf: 'POST /api/export/pdf',
      exportPptx: 'POST /api/export/pptx',
      liveProxy: 'GET /api/live-proxy',
    }
  });
}
