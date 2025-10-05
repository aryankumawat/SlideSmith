import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';
import { checkRateLimit } from '@/lib/llm';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Process PDF
    const processor = PDFProcessor.getInstance();
    const extractedContent = await processor.processPDF(file);
    
    // Generate academic presentation outline
    const academicOutline = processor.generateAcademicOutline(extractedContent);

    return NextResponse.json({
      success: true,
      content: extractedContent,
      outline: academicOutline
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    
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
    message: 'PDF Processing API',
    version: '1.0.0',
    supportedFormats: ['PDF'],
    maxFileSize: '10MB'
  });
}

