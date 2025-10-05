import { Outline, OutlineItem } from './schema';

export type LLMProvider = 'openai' | 'ollama' | 'demo';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateOutline(prompt: string): Promise<Outline> {
    const response = await this.callLLM(prompt);
    return this.parseOutline(response.content);
  }

  async generateSlide(prompt: string): Promise<any> {
    const response = await this.callLLM(prompt);
    return this.parseSlide(response.content);
  }

  async generateContent(prompt: string): Promise<string> {
    const response = await this.callLLM(prompt);
    return response.content;
  }

  private async callLLM(prompt: string): Promise<LLMResponse> {
    const { provider, apiKey, baseUrl, model } = this.config;

    if (provider === 'openai') {
      return this.callOpenAI(prompt, apiKey, baseUrl, model);
    } else if (provider === 'ollama') {
      return this.callOllama(prompt, baseUrl, model);
    } else if (provider === 'demo') {
      return this.callDemo(prompt);
    } else {
      throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private async callOpenAI(prompt: string, apiKey: string, baseUrl: string, model: string): Promise<LLMResponse> {
    // Check if this is OpenRouter API
    const isOpenRouter = baseUrl.includes('openrouter.ai');
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // Add OpenRouter specific headers
    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'SlideSmith';
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout after 30 seconds');
        throw new Error('Request timeout - please try again');
      }
      console.error('Network/API Error:', error);
      throw error;
    }
  }

  private async callOllama(prompt: string, baseUrl: string, model: string): Promise<LLMResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 4000,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.response,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  private async callDemo(prompt: string): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return demo content based on prompt type
    if (prompt.includes('outline') || prompt.includes('presentation')) {
      return {
        content: JSON.stringify({
          title: 'Demo Presentation',
          subtitle: 'AI-Generated Content',
          agenda: [
            {
              title: 'Introduction',
              objective: 'Welcome and overview',
              slideCount: 2,
              keyPoints: ['Welcome', 'Agenda', 'Objectives']
            },
            {
              title: 'Main Content',
              objective: 'Core information and insights',
              slideCount: 4,
              keyPoints: ['Key Concept 1', 'Key Concept 2', 'Examples', 'Best Practices']
            },
            {
              title: 'Conclusion',
              objective: 'Summary and next steps',
              slideCount: 2,
              keyPoints: ['Summary', 'Q&A', 'Next Steps']
            }
          ],
          conclusion: 'Thank you for your attention. Questions?',
          references: ['Reference 1', 'Reference 2']
        })
      };
    }
    
    // Default demo response for slide generation
    return {
      content: JSON.stringify({
        id: `slide-${Date.now()}`,
        layout: 'title+bullets',
        blocks: [
          {
            type: 'Heading',
            text: 'Demo Slide Title',
          },
          {
            type: 'Bullets',
            items: ['Demo point 1', 'Demo point 2', 'Demo point 3', 'Demo point 4', 'Demo point 5'],
          },
        ],
        notes: 'This is a demo slide. Configure your API keys for real AI generation.',
      })
    };
  }

  private parseOutline(content: string): Outline {
    try {
      // Clean the content - remove any control characters that might cause JSON parsing issues
      const cleanedContent = content.replace(/[\x00-\x1F\x7F]/g, '');
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      
      // Fallback: create a basic outline structure
      return {
        title: 'Generated Presentation',
        subtitle: 'AI-Generated Content',
        agenda: [
          {
            title: 'Introduction',
            objective: 'Introduce the topic',
            slideCount: 2,
            keyPoints: ['Overview', 'Objectives'],
          },
          {
            title: 'Main Content',
            objective: 'Present key information',
            slideCount: 6,
            keyPoints: ['Key Point 1', 'Key Point 2', 'Key Point 3'],
          },
          {
            title: 'Conclusion',
            objective: 'Summarize and conclude',
            slideCount: 2,
            keyPoints: ['Summary', 'Next Steps'],
          },
        ],
        conclusion: 'Thank you for your attention. Questions?',
        references: [],
      };
    } catch (error) {
      console.error('Error parsing outline:', error);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse outline from LLM response');
    }
  }

  private parseSlide(content: string): any {
    try {
      // Clean the content - remove any control characters that might cause JSON parsing issues
      const cleanedContent = content.replace(/[\x00-\x1F\x7F]/g, '');
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create a basic slide structure
      return {
        id: `slide-${Date.now()}`,
        layout: 'title+bullets',
        blocks: [
          {
            type: 'Heading',
            text: 'Slide Title',
          },
          {
            type: 'Bullets',
            items: ['Key point 1', 'Key point 2', 'Key point 3'],
          },
        ],
        notes: 'Speaker notes for this slide',
      };
    } catch (error) {
      console.error('Error parsing slide:', error);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse slide from LLM response');
    }
  }
}

// Factory function to create LLM client
export function createLLMClient(): LLMClient {
  const provider = (process.env.LLM_PROVIDER as LLMProvider) || 'demo';
  const apiKey = process.env.LLM_API_KEY || '';
  const baseUrl = process.env.LLM_BASE_URL || (provider === 'openai' ? 'https://api.openai.com' : 'http://localhost:11434');
  const model = process.env.LLM_MODEL || (provider === 'openai' ? 'gpt-4' : 'llama2');

  console.log('LLM Client Configuration:', { provider, hasApiKey: !!apiKey, baseUrl, model });

  // Force demo mode if no valid API key or if provider is demo
  if (provider === 'demo' || !apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'your_actual_openai_api_key_here') {
    console.log('Using demo mode for LLM client');
    return new LLMClient({
      provider: 'demo',
      apiKey: '',
      baseUrl: '',
      model: 'demo',
    });
  }

  return new LLMClient({
    provider,
    apiKey,
    baseUrl,
    model,
  });
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit: number = 20, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}
