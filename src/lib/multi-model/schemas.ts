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

// ============================================================================
// NEW AGENT SCHEMAS
// ============================================================================

// Data Visualization Schemas
export const ChartSpecSchema = z.object({
  kind: z.enum(['line', 'bar', 'area', 'pie', 'scatter', 'histogram']),
  x: z.string(),
  y: z.string(),
  title: z.string(),
  rationale: z.string(),
  dataExample: z.any().optional(),
});

export const DataVizInputSchema = z.object({
  analyticalQuestion: z.string(),
  dataSchema: z.record(z.any()),
  sampleData: z.array(z.any()),
  slideContext: z.string(),
});

export const DataVizOutputSchema = z.object({
  chartSpecs: z.array(ChartSpecSchema),
  rationale: z.string(),
  metadata: z.object({
    totalCharts: z.number(),
    dataTypes: z.array(z.string()),
    complexity: z.enum(['simple', 'moderate', 'complex']),
  }),
});

export type ChartSpec = z.infer<typeof ChartSpecSchema>;
export type DataVizInput = z.infer<typeof DataVizInputSchema>;
export type DataVizOutput = z.infer<typeof DataVizOutputSchema>;

// Media Finder Schemas
export const MediaSuggestionSchema = z.object({
  type: z.enum(['image', 'video', 'diagram', 'icon', 'illustration']),
  url: z.string().optional(),
  prompt: z.string().optional(),
  altText: z.string(),
  credit: z.string().optional(),
  relevance: z.number().min(1).max(10),
  description: z.string(),
});

export const MediaFinderInputSchema = z.object({
  sectionContext: z.string(),
  keywords: z.array(z.string()),
  themeStyle: z.string(),
  contentType: z.string(),
});

export const MediaFinderOutputSchema = z.object({
  suggestions: z.array(MediaSuggestionSchema),
  metadata: z.object({
    totalSuggestions: z.number(),
    imageCount: z.number(),
    videoCount: z.number(),
    diagramCount: z.number(),
  }),
});

export type MediaSuggestion = z.infer<typeof MediaSuggestionSchema>;
export type MediaFinderInput = z.infer<typeof MediaFinderInputSchema>;
export type MediaFinderOutput = z.infer<typeof MediaFinderOutputSchema>;

// Speaker Notes Schemas
export const SpeakerNoteSchema = z.object({
  slideId: z.string(),
  notes: z.string(),
  duration: z.string(),
  keyPoints: z.array(z.string()),
  transitions: z.array(z.string()),
  audienceEngagement: z.array(z.string()),
  timing: z.string(),
});

export const SpeakerNotesInputSchema = z.object({
  slides: z.array(z.any()),
  audience: z.string(),
  tone: z.string(),
  estimatedDuration: z.number(),
  purpose: z.string(),
});

export const SpeakerNotesOutputSchema = z.object({
  notes: z.array(SpeakerNoteSchema),
  metadata: z.object({
    totalSlides: z.number(),
    averageDuration: z.number(),
    totalDuration: z.number(),
  }),
});

export type SpeakerNote = z.infer<typeof SpeakerNoteSchema>;
export type SpeakerNotesInput = z.infer<typeof SpeakerNotesInputSchema>;
export type SpeakerNotesOutput = z.infer<typeof SpeakerNotesOutputSchema>;

// Accessibility Schemas
export const AccessibilityIssueSchema = z.object({
  type: z.enum(['contrast', 'typography', 'structure', 'content', 'navigation']),
  severity: z.enum(['critical', 'warning', 'info']),
  slideId: z.string(),
  element: z.string(),
  description: z.string(),
  impact: z.string(),
  wcagLevel: z.enum(['AA', 'AAA']),
});

export const AccessibilityFixSchema = z.object({
  issueId: z.string(),
  description: z.string(),
  autoFixable: z.boolean(),
  priority: z.enum(['high', 'medium', 'low']),
  effort: z.enum(['quick', 'moderate', 'extensive']),
  code: z.string().optional(),
  explanation: z.string(),
});

export const AccessibilityInputSchema = z.object({
  deck: z.any(),
  theme: z.string(),
  themeTokens: z.object({
    colors: z.record(z.string()),
    typography: z.record(z.any()),
    spacing: z.record(z.any()),
  }),
});

export const AccessibilityOutputSchema = z.object({
  issues: z.array(AccessibilityIssueSchema),
  fixes: z.array(AccessibilityFixSchema),
  metadata: z.object({
    totalIssues: z.number(),
    criticalIssues: z.number(),
    warningIssues: z.number(),
    infoIssues: z.number(),
    autoFixable: z.number(),
  }),
});

export type AccessibilityIssue = z.infer<typeof AccessibilityIssueSchema>;
export type AccessibilityFix = z.infer<typeof AccessibilityFixSchema>;
export type AccessibilityInput = z.infer<typeof AccessibilityInputSchema>;
export type AccessibilityOutput = z.infer<typeof AccessibilityOutputSchema>;

// Live Widget Schemas
export const WidgetSpecSchema = z.object({
  type: z.enum(['chart', 'ticker', 'map', 'countdown', 'iframe']),
  config: z.record(z.any()),
  dataSource: z.string().optional(),
  refreshRate: z.number(),
});

export const WidgetRecommendationSchema = z.object({
  slideIndex: z.number(),
  widgetSpec: WidgetSpecSchema,
  explanation: z.string(),
  refreshRate: z.number(),
  priority: z.enum(['high', 'medium', 'low']),
  audienceEngagement: z.string(),
});

export const LiveWidgetInputSchema = z.object({
  topic: z.string(),
  audience: z.string(),
  tone: z.string(),
  duration: z.number(),
  mode: z.string(),
  outline: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  safeEndpoints: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })),
});

export const LiveWidgetOutputSchema = z.object({
  recommendations: z.array(WidgetRecommendationSchema),
  metadata: z.object({
    totalRecommendations: z.number(),
    chartWidgets: z.number(),
    tickerWidgets: z.number(),
    mapWidgets: z.number(),
    countdownWidgets: z.number(),
    iframeWidgets: z.number(),
  }),
});

export type WidgetSpec = z.infer<typeof WidgetSpecSchema>;
export type WidgetRecommendation = z.infer<typeof WidgetRecommendationSchema>;
export type LiveWidgetInput = z.infer<typeof LiveWidgetInputSchema>;
export type LiveWidgetOutput = z.infer<typeof LiveWidgetOutputSchema>;

// Executive Summary Schemas (Updated)
export const ExecutiveSummaryInputSchema = z.object({
  deck: z.any(),
  audience: z.string(),
  tone: z.string(),
});

export const ExecutiveSummaryOutputSchema = z.object({
  summarySlide: z.any(),
  emailSummary: z.string(),
  metadata: z.object({
    keyPoints: z.array(z.string()),
    totalSlides: z.number(),
    estimatedReadTime: z.number(),
  }),
});

export type ExecutiveSummaryInput = z.infer<typeof ExecutiveSummaryInputSchema>;
export type ExecutiveSummaryOutput = z.infer<typeof ExecutiveSummaryOutputSchema>;

// Audience Adapter Schemas (Updated)
export const AudienceAdapterInputSchema = z.object({
  deck: z.any(),
  originalAudience: z.string(),
  targetAudience: z.string(),
  originalTone: z.string(),
  targetTone: z.string(),
  originalDuration: z.number(),
  targetDuration: z.number(),
});

export const AudienceAdapterOutputSchema = z.object({
  adaptedDeck: z.any(),
  changeLog: z.array(z.string()),
  metadata: z.object({
    originalSlides: z.number(),
    adaptedSlides: z.number(),
    slidesRemoved: z.number(),
    slidesAdded: z.number(),
    toneChanged: z.boolean(),
    durationChanged: z.boolean(),
  }),
});

export type AudienceAdapterInput = z.infer<typeof AudienceAdapterInputSchema>;
export type AudienceAdapterOutput = z.infer<typeof AudienceAdapterOutputSchema>;
