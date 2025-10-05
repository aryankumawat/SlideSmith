import { AISlidesLLM } from './ai-slides-llm';
import { AIDeck, Input, AISlide } from './ai-slides-schema';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class AISlidesPipeline {
  private llm = new AISlidesLLM();

  async processInput(input: Input): Promise<AIDeck> {
    // Detect if input is topic or long script
    const isScript = input.script && input.script.length > 500;
    
    if (isScript) {
      // Segment long script into sections, summarize, then outline
      const segmentedScript = this.segmentScript(input.script!);
      const summarizedScript = await this.summarizeScript(segmentedScript);
      
      // Use summarized script as topic
      const processedInput: Input = {
        ...input,
        topic: summarizedScript,
        script: undefined
      };
      
      return await this.llm.generateSlides(processedInput);
    } else {
      // Direct topic processing
      return await this.llm.generateSlides(input);
    }
  }

  async generateAndExport(input: Input): Promise<{ deck: AIDeck; htmlPath: string; pptxPath: string }> {
    // Generate deck
    const deck = await this.processInput(input);
    
    // Create exports directory
    const exportsDir = join(process.cwd(), 'exports');
    mkdirSync(exportsDir, { recursive: true });
    
    // Generate timestamp
    const timestamp = Date.now();
    
    // Export paths
    const htmlPath = join(exportsDir, `deck-${timestamp}.html`);
    const pptxPath = join(exportsDir, `deck-${timestamp}.pptx`);
    
    // Generate HTML (Reveal.js)
    const htmlContent = await this.generateHTML(deck);
    writeFileSync(htmlPath, htmlContent);
    
    // Generate PPTX (stub for now)
    await this.generatePPTX(deck, pptxPath);
    
    return { deck, htmlPath, pptxPath };
  }

  private segmentScript(script: string): string[] {
    // Simple segmentation by paragraphs and sentences
    const paragraphs = script.split('\n\n').filter(p => p.trim().length > 0);
    const segments: string[] = [];
    
    for (const paragraph of paragraphs) {
      if (paragraph.length > 200) {
        // Split long paragraphs by sentences
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let currentSegment = '';
        
        for (const sentence of sentences) {
          if (currentSegment.length + sentence.length > 200) {
            if (currentSegment.trim()) {
              segments.push(currentSegment.trim());
            }
            currentSegment = sentence.trim();
          } else {
            currentSegment += (currentSegment ? '. ' : '') + sentence.trim();
          }
        }
        
        if (currentSegment.trim()) {
          segments.push(currentSegment.trim());
        }
      } else {
        segments.push(paragraph.trim());
      }
    }
    
    return segments;
  }

  private async summarizeScript(segments: string[]): Promise<string> {
    // Simple summarization - take first sentence of each segment
    const summary = segments
      .map(segment => {
        const firstSentence = segment.split(/[.!?]/)[0];
        return firstSentence.trim();
      })
      .filter(sentence => sentence.length > 0)
      .join('. ');
    
    return summary;
  }

  private async generateHTML(deck: AIDeck): Promise<string> {
    // Generate Reveal.js HTML
    const slidesHTML = deck.slides.map((slide, index) => {
      return this.generateSlideHTML(slide, index, deck.theme);
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${deck.title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/black.css">
    <style>
        ${this.generateThemeCSS(deck.theme)}
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            ${slidesHTML}
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            transition: 'slide',
            transitionSpeed: 'default',
            backgroundTransition: 'fade'
        });
    </script>
</body>
</html>`;
  }

  private generateSlideHTML(slide: AISlide, index: number, theme: string): string {
    const slideClass = `slide-${slide.kind}`;
    const layoutClass = slide.layout ? `layout-${slide.layout}` : '';
    
    let content = '';
    
    switch (slide.kind) {
      case 'cover':
        content = `
          <h1 class="slide-title">${slide.title}</h1>
          ${slide.subtitle ? `<h2 class="slide-subtitle">${slide.subtitle}</h2>` : ''}
        `;
        break;
        
      case 'agenda':
        content = `
          <h2 class="slide-title">${slide.title}</h2>
          <ul class="agenda-list">
            ${slide.bullets?.map(bullet => `<li class="fragment">${bullet}</li>`).join('') || ''}
          </ul>
        `;
        break;
        
      case 'kpi':
        content = `
          <h2 class="slide-title">${slide.title}</h2>
          <div class="kpi-grid">
            ${slide.kpis?.map(kpi => `
              <div class="kpi-item fragment">
                <div class="kpi-value">${kpi.value}</div>
                <div class="kpi-label">${kpi.label}</div>
                ${kpi.note ? `<div class="kpi-note">${kpi.note}</div>` : ''}
              </div>
            `).join('') || ''}
          </div>
        `;
        break;
        
      case 'content':
        content = `
          <h2 class="slide-title">${slide.title}</h2>
          ${slide.subtitle ? `<h3 class="slide-subtitle">${slide.subtitle}</h3>` : ''}
          <ul class="content-list">
            ${slide.bullets?.map(bullet => `<li class="fragment">${bullet}</li>`).join('') || ''}
          </ul>
        `;
        break;
        
      case 'quote':
        content = `
          <blockquote class="quote">
            <p class="fragment">"${slide.title}"</p>
            ${slide.subtitle ? `<cite class="fragment">— ${slide.subtitle}</cite>` : ''}
          </blockquote>
        `;
        break;
        
      case 'summary':
        content = `
          <h2 class="slide-title">${slide.title}</h2>
          <ul class="summary-list">
            ${slide.bullets?.map(bullet => `<li class="fragment">${bullet}</li>`).join('') || ''}
          </ul>
        `;
        break;
        
      default:
        content = `
          <h2 class="slide-title">${slide.title}</h2>
          ${slide.subtitle ? `<h3 class="slide-subtitle">${slide.subtitle}</h3>` : ''}
          <ul class="content-list">
            ${slide.bullets?.map(bullet => `<li class="fragment">${bullet}</li>`).join('') || ''}
          </ul>
        `;
    }
    
    return `
      <section class="${slideClass} ${layoutClass}" data-background-color="var(--bg-color)">
        ${content}
      </section>
    `;
  }

  private generateThemeCSS(theme: string): string {
    const tokens = {
      'nebula-dark': {
        '--bg-color': '#0B0F19',
        '--fg-color': '#EAF2FF',
        '--accent-primary': '#6C9CFF',
        '--accent-secondary': '#8B5CF6',
        '--accent-tertiary': '#22D3EE'
      },
      'ultraviolet': {
        '--bg-color': '#0D021F',
        '--fg-color': '#F5EEFF',
        '--accent-primary': '#7C3AED',
        '--accent-secondary': '#C084FC',
        '--accent-tertiary': '#60A5FA'
      },
      'minimal-light': {
        '--bg-color': '#FFFFFF',
        '--fg-color': '#0A0A0A',
        '--accent-primary': '#2563EB',
        '--accent-secondary': '#10B981',
        '--accent-tertiary': '#F59E0B'
      }
    };
    
    const themeTokens = tokens[theme as keyof typeof tokens] || tokens['nebula-dark'];
    
    return `
      :root {
        ${Object.entries(themeTokens).map(([key, value]) => `${key}: ${value};`).join('\n        ')}
      }
      
      .reveal {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--fg-color);
      }
      
      .reveal .slides section {
        text-align: left;
      }
      
      .slide-title {
        color: var(--accent-primary);
        font-size: 2.5em;
        font-weight: 800;
        margin-bottom: 0.5em;
      }
      
      .slide-subtitle {
        color: var(--accent-secondary);
        font-size: 1.5em;
        font-weight: 600;
        margin-bottom: 1em;
      }
      
      .agenda-list, .content-list, .summary-list {
        font-size: 1.2em;
        line-height: 1.6;
      }
      
      .agenda-list li, .content-list li, .summary-list li {
        margin-bottom: 0.5em;
        color: var(--fg-color);
      }
      
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2em;
        margin-top: 2em;
      }
      
      .kpi-item {
        text-align: center;
        padding: 1.5em;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .kpi-value {
        font-size: 3em;
        font-weight: 800;
        color: var(--accent-primary);
        margin-bottom: 0.2em;
      }
      
      .kpi-label {
        font-size: 1.1em;
        color: var(--fg-color);
        margin-bottom: 0.5em;
      }
      
      .kpi-note {
        font-size: 0.9em;
        color: var(--accent-secondary);
        opacity: 0.8;
      }
      
      .quote {
        text-align: center;
        font-size: 1.5em;
        font-style: italic;
        color: var(--accent-primary);
        border: none;
        background: none;
        padding: 2em;
      }
      
      .quote p {
        margin-bottom: 1em;
      }
      
      .quote cite {
        color: var(--accent-secondary);
        font-size: 0.8em;
        font-style: normal;
      }
      
      .fragment {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
      }
      
      .fragment.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
  }

  private async generatePPTX(deck: AIDeck, outputPath: string): Promise<void> {
    // Stub for PPTX generation
    // This would use python-pptx or similar library
    console.log(`PPTX generation stub for: ${outputPath}`);
    console.log(`Deck: ${deck.title} with ${deck.slides.length} slides`);
    
    // For now, just create an empty file
    writeFileSync(outputPath, 'PPTX generation not implemented yet');
  }
}
