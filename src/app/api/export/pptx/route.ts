import { NextRequest, NextResponse } from 'next/server';
import { Deck, Slide, SlideBlock } from '@/lib/schema';
import PptxGenJS from 'pptxgenjs';

export async function POST(request: NextRequest) {
  try {
    const { deck } = await request.json();
    
    if (!deck) {
      return NextResponse.json(
        { error: 'Deck data is required' },
        { status: 400 }
      );
    }

    const pptxBuffer = await generatePPTX(deck);
    
    return new NextResponse(pptxBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx"`,
      },
    });
  } catch (error) {
    console.error('Error generating PPTX:', error);
    return NextResponse.json(
      { error: 'Failed to generate PPTX' },
      { status: 500 }
    );
  }
}

async function generatePPTX(deck: Deck): Promise<Buffer> {
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.defineLayout({ name: 'WIDE', width: 10, height: 5.625 });
  pptx.layout = 'WIDE';
  
  // Add slides
  for (const slide of deck.slides) {
    const pptxSlide = pptx.addSlide();
    
    // Set slide background based on theme
    const themeColors = getThemeColors(deck.theme || 'professional');
    pptxSlide.background = { color: themeColors.background };
    
    // Add slide content
    addSlideContent(pptxSlide, slide, themeColors);
    
    // Add speaker notes if available
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes);
    }
  }
  
  // Generate the PPTX buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.from(buffer as any);
}

function addSlideContent(pptxSlide: any, slide: Slide, themeColors: any) {
  const { layout, blocks } = slide;
  
  switch (layout) {
    case 'title':
      addTitleSlideContent(pptxSlide, blocks, themeColors);
      break;
    case 'title+bullets':
      addTitleBulletsContent(pptxSlide, blocks, themeColors);
      break;
    case 'two-col':
      addTwoColumnContent(pptxSlide, blocks, themeColors);
      break;
    case 'media-left':
      addMediaLeftContent(pptxSlide, blocks, themeColors);
      break;
    case 'media-right':
      addMediaRightContent(pptxSlide, blocks, themeColors);
      break;
    case 'quote':
      addQuoteContent(pptxSlide, blocks, themeColors);
      break;
    case 'chart':
      addChartContent(pptxSlide, blocks, themeColors);
      break;
    case 'end':
      addEndSlideContent(pptxSlide, blocks, themeColors);
      break;
    default:
      addTitleBulletsContent(pptxSlide, blocks, themeColors);
  }
}

function addTitleSlideContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  const heading = blocks.find(b => b.type === 'Heading');
  const subheading = blocks.find(b => b.type === 'Subheading');
  
  if (heading && 'text' in heading) {
    pptxSlide.addText(heading.text, {
      x: 1,
      y: 2,
      w: 8,
      h: 1.5,
      fontSize: 48,
      color: themeColors.text,
      bold: true,
      align: 'center',
    });
  }
  
  if (subheading && 'text' in subheading) {
    pptxSlide.addText(subheading.text, {
      x: 1,
      y: 3.5,
      w: 8,
      h: 1,
      fontSize: 24,
      color: themeColors.textSecondary,
      align: 'center',
    });
  }
}

// Helper function to truncate text to prevent overflow
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function addTitleBulletsContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  if (!blocks) return; // Guard against undefined blocks
  
  const heading = blocks.find(b => b.type === 'Heading');
  const subheading = blocks.find(b => b.type === 'Subheading');
  const bullets = blocks.find(b => b.type === 'Bullets');
  
  if (heading && 'text' in heading) {
    pptxSlide.addText(heading.text, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      color: themeColors.text,
      bold: true,
    });
  }
  
  if (subheading && 'text' in subheading) {
    pptxSlide.addText(subheading.text, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: themeColors.textSecondary,
    });
  }
  
  if (bullets && 'items' in bullets) {
    // Truncate bullets to prevent overflow (max 80 chars per bullet)
    const truncatedItems = bullets.items.map(item => truncateText(item, 80));
    // Limit to 5 bullets max for better readability
    const limitedItems = truncatedItems.slice(0, 5);
    const bulletText = limitedItems.map(item => `• ${item}`).join('\n');
    pptxSlide.addText(bulletText, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 3,
      fontSize: 18, // Reduced from 20 to fit more text
      color: themeColors.text,
      lineSpacing: 28, // Reduced from 32 for tighter spacing
    });
  }
}

function addTwoColumnContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  const heading = blocks.find(b => b.type === 'Heading');
  const leftBlocks = blocks.filter((_, i) => i > 0 && i % 2 === 1);
  const rightBlocks = blocks.filter((_, i) => i > 0 && i % 2 === 0);
  
  if (heading && 'text' in heading) {
    pptxSlide.addText(heading.text, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      color: themeColors.text,
      bold: true,
    });
  }
  
  // Left column
  addBlocksToSlide(pptxSlide, leftBlocks, 0.5, 1.5, 4, 3.5, themeColors);
  
  // Right column
  addBlocksToSlide(pptxSlide, rightBlocks, 5, 1.5, 4, 3.5, themeColors);
}

function addMediaLeftContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  const heading = blocks.find(b => b.type === 'Heading');
  const image = blocks.find(b => b.type === 'Image');
  const textBlocks = blocks.filter(b => b.type !== 'Heading' && b.type !== 'Image');
  
  if (heading && 'text' in heading) {
    pptxSlide.addText(heading.text, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      color: themeColors.text,
      bold: true,
    });
  }
  
  // Left side - media
  if (image && 'url' in image) {
    pptxSlide.addImage({
      data: image.url,
      x: 0.5,
      y: 1.5,
      w: 4,
      h: 3,
    });
  }
  
  // Right side - text
  addBlocksToSlide(pptxSlide, textBlocks, 5, 1.5, 4, 3.5, themeColors);
}

function addMediaRightContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  const heading = blocks.find(b => b.type === 'Heading');
  const image = blocks.find(b => b.type === 'Image');
  const textBlocks = blocks.filter(b => b.type !== 'Heading' && b.type !== 'Image');
  
  if (heading && 'text' in heading) {
    pptxSlide.addText(heading.text, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      color: themeColors.text,
      bold: true,
    });
  }
  
  // Left side - text
  addBlocksToSlide(pptxSlide, textBlocks, 0.5, 1.5, 4, 3.5, themeColors);
  
  // Right side - media
  if (image && 'url' in image) {
    pptxSlide.addImage({
      data: image.url,
      x: 5,
      y: 1.5,
      w: 4,
      h: 3,
    });
  }
}

function addQuoteContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  const quote = blocks.find(b => b.type === 'Quote');
  const author = blocks.find(b => b.type === 'Subheading');
  
  if (quote && 'text' in quote) {
    pptxSlide.addText(`"${quote.text}"`, {
      x: 1,
      y: 2,
      w: 8,
      h: 2,
      fontSize: 28,
      color: themeColors.text,
      italic: true,
      align: 'center',
    });
  }
  
  if (author && 'text' in author) {
    pptxSlide.addText(`— ${author.text}`, {
      x: 1,
      y: 4,
      w: 8,
      h: 0.5,
      fontSize: 18,
      color: themeColors.textSecondary,
      align: 'center',
    });
  }
}

function addChartContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  const heading = blocks.find(b => b.type === 'Heading');
  const chart = blocks.find(b => b.type === 'Chart');
  
  if (heading && 'text' in heading) {
    pptxSlide.addText(heading.text, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      color: themeColors.text,
      bold: true,
    });
  }
  
  if (chart && 'data' in chart && 'x' in chart && 'y' in chart) {
    // Add chart placeholder
    pptxSlide.addText('Chart Placeholder', {
      x: 1,
      y: 2,
      w: 8,
      h: 3,
      fontSize: 24,
      color: themeColors.textSecondary,
      align: 'center',
    });
  }
}

function addEndSlideContent(pptxSlide: any, blocks: SlideBlock[], themeColors: any) {
  const heading = blocks.find(b => b.type === 'Heading');
  const subheading = blocks.find(b => b.type === 'Subheading');
  
  if (heading && 'text' in heading) {
    pptxSlide.addText(heading.text, {
      x: 1,
      y: 2,
      w: 8,
      h: 1.5,
      fontSize: 48,
      color: themeColors.text,
      bold: true,
      align: 'center',
    });
  }
  
  if (subheading && 'text' in subheading) {
    pptxSlide.addText(subheading.text, {
      x: 1,
      y: 3.5,
      w: 8,
      h: 1,
      fontSize: 24,
      color: themeColors.textSecondary,
      align: 'center',
    });
  }
}

function addBlocksToSlide(pptxSlide: any, blocks: SlideBlock[], x: number, y: number, w: number, h: number, themeColors: any) {
  let currentY = y;
  
  for (const block of blocks) {
    if (block.type === 'Heading' && 'text' in block) {
      pptxSlide.addText(block.text, {
        x,
        y: currentY,
        w,
        h: 0.5,
        fontSize: 24,
        color: themeColors.text,
        bold: true,
      });
      currentY += 0.6;
    } else if (block.type === 'Subheading' && 'text' in block) {
      pptxSlide.addText(block.text, {
        x,
        y: currentY,
        w,
        h: 0.4,
        fontSize: 18,
        color: themeColors.textSecondary,
      });
      currentY += 0.5;
    } else if (block.type === 'Bullets' && 'items' in block) {
      const bulletText = block.items.map(item => `• ${item}`).join('\n');
      pptxSlide.addText(bulletText, {
        x,
        y: currentY,
        w,
        h: 1.5,
        fontSize: 16,
        color: themeColors.text,
        lineSpacing: 24,
      });
      currentY += 1.6;
    } else if (block.type === 'Markdown' && 'md' in block) {
      pptxSlide.addText(block.md, {
        x,
        y: currentY,
        w,
        h: 1,
        fontSize: 16,
        color: themeColors.text,
        lineSpacing: 20,
      });
      currentY += 1.1;
    }
  }
}

function getThemeColors(theme: string) {
  // Map both old and new theme names
  const normalizedTheme = theme.toLowerCase().replace(/[_-]/g, '');
  
  const themes: Record<string, any> = {
    deepspace: {
      background: '0a0a0f',
      text: 'ffffff',
      textSecondary: 'a1a1aa',
      primary: '6366f1',
    },
    ultraviolet: {
      background: '1a0b2e',
      text: 'ffffff',
      textSecondary: 'c4b5fd',
      primary: '8b5cf6',
    },
    minimal: {
      background: 'ffffff',
      text: '111827',
      textSecondary: '6b7280',
      primary: '000000',
    },
    corporate: {
      background: 'f8fafc',
      text: '1e293b',
      textSecondary: '64748b',
      primary: '1e40af',
    },
    neongrid: {
      background: '000000',
      text: '00ff88',
      textSecondary: '00d4ff',
      primary: '00ff88',
    },
  };
  
  return themes[normalizedTheme] || themes.deepspace;
}
