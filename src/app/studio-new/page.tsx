'use client';

import { useState } from 'react';
import DeckGenerator from '@/components/DeckGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Share } from 'lucide-react';
import { ChartDisplay } from '@/components/ChartDisplay';

interface Slide {
  layout: 'title' | 'title_bullets' | 'two_column' | 'quote' | 'chart' | 'image_full';
  title: string;
  bullets?: string[];
  notes?: string;
  chart_spec?: any;
  image?: { prompt: string; alt: string; source: string };
  citations?: string[];
}

interface Deck {
  title: string;
  theme: string;
  slides: Slide[];
}

export default function StudioNewPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<Deck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate presentation');
      }

      const result = await response.json();
      setGeneratedDeck(result.deck);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to strip markdown formatting for clean exports
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')       // Remove *italic*
      .replace(/__(.*?)__/g, '$1')       // Remove __bold__
      .replace(/_(.*?)_/g, '$1')         // Remove _italic_
      .trim();
  };

  const convertDeckForExport = (deck: Deck) => {
    // Convert new deck format to old format expected by export APIs
    // Strip markdown formatting for clean text in exports
    return {
      id: `deck-${Date.now()}`,
      title: stripMarkdown(deck.title),
      theme: deck.theme,
      meta: {
        title: stripMarkdown(deck.title),
        theme: deck.theme,
        audience: 'general',
        tone: 'professional',
      },
      slides: deck.slides.map((slide, index) => {
        const blocks: any[] = [];
        
        // Add title as Heading block (strip markdown)
        if (slide.title) {
          blocks.push({
            type: 'Heading',
            text: stripMarkdown(slide.title),
            level: 1,
          });
        }
        
        // Add bullets as Bullets block (strip markdown from each bullet)
        if (slide.bullets && slide.bullets.length > 0) {
          blocks.push({
            type: 'Bullets',
            items: slide.bullets.map(bullet => stripMarkdown(bullet)),
          });
        }
        
        // Add chart if present
        if (slide.chart_spec) {
          blocks.push({
            type: 'Chart',
            chartSpec: slide.chart_spec,
          });
        }
        
        // Add image if present
        if (slide.image) {
          blocks.push({
            type: 'Image',
            url: slide.image.source || '',
            alt: stripMarkdown(slide.image.alt),
            caption: stripMarkdown(slide.image.prompt),
          });
        }
        
        return {
          id: `slide-${index}`,
          layout: slide.layout || 'title-content',
          blocks,
          notes: slide.notes || '',
          citations: slide.citations || [],
        };
      }),
    };
  };

  const handleExport = async (format: 'pptx' | 'pdf' | 'json') => {
    if (!generatedDeck) return;
    
    if (format === 'json') {
      // Download JSON with markdown stripped for clean text
      const cleanedDeck = {
        ...generatedDeck,
        title: stripMarkdown(generatedDeck.title),
        slides: generatedDeck.slides.map(slide => ({
          ...slide,
          title: stripMarkdown(slide.title),
          bullets: slide.bullets?.map(bullet => stripMarkdown(bullet)) || [],
          image: slide.image ? {
            ...slide.image,
            alt: stripMarkdown(slide.image.alt),
            prompt: stripMarkdown(slide.image.prompt)
          } : undefined
        }))
      };
      
      const blob = new Blob([JSON.stringify(cleanedDeck, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${stripMarkdown(generatedDeck.title) || 'presentation'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
    
    try {
      const endpoint = format === 'pptx' ? '/api/export/pptx' : '/api/export/pdf';
      const convertedDeck = convertDeckForExport(generatedDeck);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deck: convertedDeck }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`);
      }

      // Get the blob and download it
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDeck.title || 'presentation'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Export failed:`, error);
      setError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {!generatedDeck ? (
          <DeckGenerator onGenerate={handleGenerate} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{generatedDeck.title}</h1>
                <p className="text-gray-600">Theme: {generatedDeck.theme}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setGeneratedDeck(null)}>
                  Generate New
                </Button>
                <Button onClick={() => handleExport('pptx')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PPTX
                </Button>
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Slides Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedDeck.slides.map((slide, index) => {
                // Helper function to render text with bold markdown
                const renderMarkdown = (text: string) => {
                  const parts = text.split(/(\*\*.*?\*\*)/g);
                  return parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="text-blue-600 font-semibold">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                  });
                };

                // Get theme-based styling
                const getThemeClasses = () => {
                  const theme = generatedDeck.theme;
                  switch (theme) {
                    case 'deep_space':
                      return {
                        card: 'bg-gradient-to-br from-slate-900 to-blue-900 border-blue-500',
                        header: 'bg-gradient-to-r from-blue-600 to-purple-600',
                        accent: 'text-cyan-400'
                      };
                    case 'ultra_violet':
                      return {
                        card: 'bg-gradient-to-br from-purple-900 to-pink-900 border-purple-500',
                        header: 'bg-gradient-to-r from-purple-600 to-fuchsia-600',
                        accent: 'text-fuchsia-400'
                      };
                    case 'minimal':
                      return {
                        card: 'bg-white border-gray-300',
                        header: 'bg-gray-100',
                        accent: 'text-gray-700'
                      };
                    case 'corporate':
                      return {
                        card: 'bg-gradient-to-br from-slate-50 to-blue-50 border-blue-300',
                        header: 'bg-gradient-to-r from-blue-500 to-indigo-500',
                        accent: 'text-blue-600'
                      };
                    default:
                      return {
                        card: 'bg-white border-gray-200',
                        header: 'bg-gradient-to-r from-blue-50 to-purple-50',
                        accent: 'text-blue-600'
                      };
                  }
                };

                const themeClasses = getThemeClasses();

                return (
                  <Card key={index} className={`h-auto min-h-64 overflow-hidden border-2 hover:shadow-xl transition-all ${themeClasses.card}`}>
                    <CardHeader className={`pb-3 ${themeClasses.header}`}>
                      <CardTitle className={`text-base font-semibold leading-tight ${themeClasses.accent}`}>
                        {renderMarkdown(slide.title)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {/* Bullets with emoji and bold support */}
                        {slide.bullets && slide.bullets.length > 0 && (
                          <ul className="text-sm space-y-2">
                            {slide.bullets.map((bullet, bulletIndex) => (
                              <li key={bulletIndex} className="flex items-start gap-2">
                                <span className="text-gray-400 shrink-0 mt-0.5">▸</span>
                                <span className="leading-relaxed">
                                  {renderMarkdown(bullet)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Image/Visual indicator with icon */}
                        {slide.image && (
                          <div className="mt-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">🎨</span>
                              <div className="text-xs flex-1">
                                <strong className="text-purple-700 block mb-1">Visual Element:</strong>
                                <p className="text-gray-600 leading-relaxed">{slide.image.prompt}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Chart visualization */}
                        {slide.chart_spec && (
                          <ChartDisplay chartSpec={slide.chart_spec} className="mt-3" />
                        )}
                        
                        {/* Speaker notes preview */}
                        {slide.notes && (
                          <div className="mt-3 p-2 bg-amber-50 rounded text-xs border border-amber-200">
                            <div className="flex items-start gap-1">
                              <span className="text-base">💬</span>
                              <div className="flex-1">
                                <strong className="text-amber-700">Notes:</strong>{' '}
                                <span className="text-gray-600">
                                  {slide.notes.substring(0, 120)}
                                  {slide.notes.length > 120 && '...'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Download your presentation in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button onClick={() => handleExport('pptx')} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    PowerPoint (PPTX)
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('pdf')} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Document
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('json')} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    JSON Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
