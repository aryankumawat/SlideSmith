'use client';

import { useState } from 'react';
import DeckGenerator from '@/components/DeckGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Share } from 'lucide-react';

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

  const handleExport = async (format: 'pptx' | 'pdf' | 'json') => {
    if (!generatedDeck) return;
    
    if (format === 'json') {
      // Download JSON directly
      const blob = new Blob([JSON.stringify(generatedDeck, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDeck.title || 'presentation'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
    
    try {
      const endpoint = format === 'pptx' ? '/api/export/pptx' : '/api/export/pdf';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deck: generatedDeck }),
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
              {generatedDeck.slides.map((slide, index) => (
                <Card key={index} className="h-64 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{slide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {slide.bullets && slide.bullets.length > 0 && (
                        <ul className="text-sm space-y-1">
                          {slide.bullets.slice(0, 3).map((bullet, bulletIndex) => (
                            <li key={bulletIndex} className="flex items-start">
                              <span className="text-gray-400 mr-2">•</span>
                              <span className="line-clamp-2">{bullet}</span>
                            </li>
                          ))}
                          {slide.bullets.length > 3 && (
                            <li className="text-gray-500 text-xs">
                              +{slide.bullets.length - 3} more points
                            </li>
                          )}
                        </ul>
                      )}
                      
                      {slide.notes && (
                        <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                          <strong>Notes:</strong> {slide.notes.substring(0, 100)}
                          {slide.notes.length > 100 && '...'}
                        </div>
                      )}
                      
                      {slide.chart_spec && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <strong>Chart:</strong> {slide.chart_spec.type}
                        </div>
                      )}
                      
                      {slide.image && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                          <strong>Image:</strong> {slide.image.alt}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
