import { z } from 'zod';

// ============================================================================
// SHARED CONTRACTS FOR MULTI-MODEL SYSTEM
// ============================================================================

// Research Snippet Schema
export const ResearchSnippetSchema = z.object({
  id: z.string(),
  source: z.string(),
  url: z.string().optional(),
  text: z.string().min(10).max(500), // 1-3 sentences
  tags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  timestamp: z.string().optional(),
  author: z.string().optional(),
  title: z.string().optional(),
});

export type ResearchSnippet = z.infer<typeof ResearchSnippetSchema>;

// Outline Section Schema
export const OutlineSectionSchema = z.object({
  id: z.string(),
  title: z.string().max(8), // ≤ 8 words
  goal: z.string(),
  estSlides: z.number().min(1).max(6),
  keyPoints: z.array(z.string()),
  order: z.number(),
  chartSuggested: z.boolean().optional(),
  liveWidgetSuggested: z.boolean().optional(),
});

export type OutlineSection = z.infer<typeof OutlineSectionSchema>;

// Deck Outline Schema
export const DeckOutlineSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  audience: z.string(),
  tone: z.string(),
  theme: z.string(),
  sections: z.array(OutlineSectionSchema),
  conclusion: z.string(),
  references: z.array(z.string()),
  estimatedDuration: z.number().optional(), // minutes
  wordCount: z.number().optional(),
});

export type DeckOutline = z.infer<typeof DeckOutlineSchema>;

// Slide Block Types
export const SlideBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Heading'),
    text: z.string().max(50),
    level: z.number().min(1).max(3).default(1),
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Subheading'),
    text: z.string().max(100),
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Bullets'),
    items: z.array(z.string().max(12)), // ≤ 12 words per bullet
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Markdown'),
    md: z.string(),
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Image'),
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Chart'),
    chartSpec: z.object({
      kind: z.enum(['line', 'bar', 'area', 'pie', 'scatter', 'table']),
      x: z.string(),
      y: z.string(),
      rationale: z.string(),
      dataExample: z.any().optional(),
    }),
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Live'),
    widgetSpec: z.object({
      type: z.enum(['LiveChart', 'Ticker', 'Map', 'Countdown', 'Iframe']),
      config: z.record(z.any()),
      refreshRate: z.number().optional(),
    }),
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Quote'),
    text: z.string(),
    author: z.string().optional(),
    source: z.string().optional(),
    animation: z.string().optional(),
  }),
  z.object({
    type: z.literal('Code'),
    code: z.string(),
    language: z.string().optional(),
    animation: z.string().optional(),
  }),
]);

export type SlideBlock = z.infer<typeof SlideBlockSchema>;

// Slide Schema
export const SlideSchema = z.object({
  id: z.string(),
  layout: z.enum(['title', 'title+bullets', 'two-column', 'comparison', 'kpi', 'timeline', 'quote', 'diagram']),
  blocks: z.array(SlideBlockSchema),
  notes: z.string().optional(),
  cites: z.array(z.string()).optional(), // References to ResearchSnippet IDs
  order: z.number(),
  sectionId: z.string().optional(),
  estimatedDuration: z.number().optional(), // seconds
});

export type Slide = z.infer<typeof SlideSchema>;

// Deck Schema
export const DeckSchema = z.object({
  id: z.string(),
  meta: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string(),
    date: z.string(),
    audience: z.string(),
    tone: z.string(),
    theme: z.string(),
    duration: z.number().optional(),
    wordCount: z.number().optional(),
  }),
  slides: z.array(SlideSchema),
  researchSnippets: z.array(ResearchSnippetSchema).optional(),
  quality: z.object({
    factCheckScore: z.number().min(0).max(1).optional(),
    accessibilityScore: z.number().min(0).max(1).optional(),
    readabilityScore: z.number().min(0).max(1).optional(),
    consistencyScore: z.number().min(0).max(1).optional(),
  }).optional(),
});

export type Deck = z.infer<typeof DeckSchema>;

// Chart Specification Schema
export const ChartSpecSchema = z.object({
  kind: z.enum(['line', 'bar', 'area', 'pie', 'scatter', 'table']),
  x: z.string(),
  y: z.string(),
  rationale: z.string(),
  dataExample: z.any().optional(),
  title: z.string().optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
});

export type ChartSpec = z.infer<typeof ChartSpecSchema>;

// Widget Specification Schema
export const WidgetSpecSchema = z.object({
  type: z.enum(['LiveChart', 'Ticker', 'Map', 'Countdown', 'Iframe']),
  config: z.record(z.any()),
  refreshRate: z.number().optional(),
  endpoint: z.string().optional(),
  description: z.string().optional(),
});

export type WidgetSpec = z.infer<typeof WidgetSpecSchema>;

// Agent Task Schema
export const AgentTaskSchema = z.object({
  id: z.string(),
  agentType: z.string(),
  input: z.any(),
  output: z.any().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  priority: z.number().min(1).max(10).default(5),
  retries: z.number().default(0),
  maxRetries: z.number().default(3),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  error: z.string().optional(),
});

export type AgentTask = z.infer<typeof AgentTaskSchema>;

// Quality Check Schema
export const QualityCheckSchema = z.object({
  id: z.string(),
  type: z.enum(['fact-check', 'accessibility', 'readability', 'consistency', 'design']),
  severity: z.enum(['low', 'medium', 'high']),
  message: z.string(),
  slideId: z.string().optional(),
  blockId: z.string().optional(),
  suggestion: z.string().optional(),
  autoFixable: z.boolean().default(false),
});

export type QualityCheck = z.infer<typeof QualityCheckSchema>;

// Model Configuration Schema
export const ModelConfigSchema = z.object({
  name: z.string(),
  provider: z.enum(['openai', 'ollama', 'anthropic', 'local']),
  model: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  maxTokens: z.number().default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  capabilities: z.array(z.string()),
  costPerToken: z.number().optional(),
  speed: z.enum(['fast', 'medium', 'slow']),
  quality: z.enum(['low', 'medium', 'high']),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

// Routing Policy Schema
export const RoutingPolicySchema = z.object({
  name: z.string(),
  description: z.string(),
  rules: z.array(z.object({
    agentType: z.string(),
    modelName: z.string(),
    conditions: z.record(z.any()).optional(),
  })),
});

export type RoutingPolicy = z.infer<typeof RoutingPolicySchema>;

// Executive Summary Schema
export const ExecutiveSummarySchema = z.object({
  slide: SlideSchema,
  email: z.object({
    subject: z.string(),
    body: z.string().min(100).max(120), // 100-120 words
    keyPoints: z.array(z.string()),
    nextSteps: z.array(z.string()),
  }),
});

export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;

// Audience Adaptation Schema
export const AudienceAdaptationSchema = z.object({
  originalAudience: z.string(),
  targetAudience: z.string(),
  originalDuration: z.number(),
  targetDuration: z.number(),
  changes: z.array(z.object({
    type: z.enum(['slide-removed', 'slide-merged', 'content-simplified', 'tone-adjusted']),
    slideId: z.string().optional(),
    description: z.string(),
  })),
  adaptedDeck: DeckSchema,
});

export type AudienceAdaptation = z.infer<typeof AudienceAdaptationSchema>;
