import { NextRequest, NextResponse } from 'next/server';
import { AISlidesPipeline } from '@/lib/ai-slides-pipeline';
import { InputSchema } from '@/lib/ai-slides-schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = InputSchema.parse(body);
    
    const pipeline = new AISlidesPipeline();
    const result = await pipeline.generateAndExport(validatedData);
    
    return NextResponse.json({
      success: true,
      deck: result.deck,
      files: {
        html: result.htmlPath,
        pptx: result.pptxPath
      }
    });
  } catch (error) {
    console.error('Error generating AI slides:', error);
    
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
    message: 'AI Slides API',
    version: '1.0.0',
    endpoints: {
      generate: 'POST /api/ai-slides'
    }
  });
}
