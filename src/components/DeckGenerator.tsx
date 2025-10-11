'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Sparkles, Download } from 'lucide-react';

type Mode = 'quick_prompt' | 'doc_to_deck';

interface DeckGeneratorProps {
  onGenerate: (data: any) => void;
  isLoading?: boolean;
}

export default function DeckGenerator({ onGenerate, isLoading = false }: DeckGeneratorProps) {
  const [mode, setMode] = useState<Mode>('quick_prompt');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    topic_or_prompt: '',
    instructions: '',
    tone: 'professional',
    audience: 'general',
    slide_count: 10,
    theme: 'deep_space',
    live_widgets: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData = {
      mode,
      ...formData,
      assets: mode === 'doc_to_deck' ? {
        doc_urls: [], // TODO: Implement file upload
        image_urls: [],
        xlsx_urls: []
      } : undefined
    };
    
    onGenerate(requestData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          SlideSmith
        </h1>
        <p className="text-xl text-gray-600">
          Transform any idea into a stunning presentation
        </p>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="quick_prompt" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick Prompt
          </TabsTrigger>
          <TabsTrigger value="doc_to_deck" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document → Deck
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === 'quick_prompt' ? 'Quick Prompt Mode' : 'Document to Deck Mode'}
              </CardTitle>
              <CardDescription>
                {mode === 'quick_prompt' 
                  ? 'Describe your presentation in one prompt and get a complete deck'
                  : 'Upload documents and convert them into a presentation'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mode === 'quick_prompt' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="topic_or_prompt" className="block text-sm font-medium mb-2">
                      Presentation Prompt *
                    </label>
                    <Textarea
                      id="topic_or_prompt"
                      placeholder="e.g., 'Create a 10-slide deck on climate change economics for executives. Formal tone. Add one chart comparing carbon pricing models.'"
                      value={formData.topic_or_prompt}
                      onChange={(e) => handleInputChange('topic_or_prompt', e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload Documents
                    </label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Drop your files here or click to browse</p>
                      <p className="text-sm text-gray-500">Supports PDF, DOCX, MD, XLSX, PPTX</p>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.docx,.md,.xlsx,.pptx,.doc,.txt"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                removeFile(index);
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium mb-2">
                      Instructions (Optional)
                    </label>
                    <Textarea
                      id="instructions"
                      placeholder="e.g., 'Follow my section headings as slides; compress bullets; add 1 chart from table 2'"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium mb-2">
                    Tone
                  </label>
                  <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="audience" className="block text-sm font-medium mb-2">
                    Audience
                  </label>
                  <Select value={formData.audience} onValueChange={(value) => handleInputChange('audience', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="executives">Executives</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="slide_count" className="block text-sm font-medium mb-2">
                    Slide Count
                  </label>
                  <Input
                    id="slide_count"
                    type="number"
                    min="3"
                    max="50"
                    value={formData.slide_count}
                    onChange={(e) => handleInputChange('slide_count', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label htmlFor="theme" className="block text-sm font-medium mb-2">
                    Theme
                  </label>
                  <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deep_space">Deep Space</SelectItem>
                      <SelectItem value="ultra_violet">Ultra Violet</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="live_widgets"
                  checked={formData.live_widgets}
                  onCheckedChange={(checked) => handleInputChange('live_widgets', checked)}
                />
                <label htmlFor="live_widgets" className="text-sm font-medium">
                  Enable Live Widgets
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading || (!formData.topic_or_prompt && mode === 'quick_prompt')}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Presentation...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Presentation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Tabs>
    </div>
  );
}
