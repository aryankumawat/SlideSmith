import { z } from 'zod';

export type Theme = "DeepSpace" | "Ultraviolet" | "Minimal" | "Corporate" | "NeonGrid";

export const LiveWidgetSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('LiveChart'),
    apiUrl: z.string().url(),
    xKey: z.string(),
    yKey: z.string(),
    refreshMs: z.number().min(1000),
  }),
  z.object({
    kind: z.literal('Ticker'),
    symbols: z.array(z.string()),
    refreshMs: z.number().min(1000),
  }),
  z.object({
    kind: z.literal('Countdown'),
    targetIso: z.string(),
  }),
  z.object({
    kind: z.literal('Map'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    zoom: z.number().min(1).max(20).optional(),
  }),
  z.object({
    kind: z.literal('Iframe'),
    src: z.string().url(),
    height: z.number().min(100).max(2000).optional(),
  }),
]);

export const SlideBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Heading'),
    text: z.string().max(100),
  }),
  z.object({
    type: z.literal('Subheading'),
    text: z.string().max(200),
  }),
  z.object({
    type: z.literal('Markdown'),
    md: z.string(),
  }),
  z.object({
    type: z.literal('Bullets'),
    items: z.array(z.string()).max(8),
  }),
  z.object({
    type: z.literal('Image'),
    url: z.string().url(),
    caption: z.string().optional(),
    alt: z.string().optional(),
  }),
  z.object({
    type: z.literal('Quote'),
    text: z.string().max(500),
    author: z.string().optional(),
  }),
  z.object({
    type: z.literal('Code'),
    language: z.string(),
    content: z.string(),
  }),
  z.object({
    type: z.literal('Live'),
    widget: LiveWidgetSchema,
  }),
  z.object({
    type: z.literal('Chart'),
    data: z.array(z.record(z.string(), z.union([z.number(), z.string()]))),
    x: z.string(),
    y: z.string(),
    kind: z.enum(['line', 'bar', 'area']),
  }),
]);

export const SlideSchema = z.object({
  id: z.string(),
  layout: z.enum(['title', 'title+bullets', 'two-col', 'media-left', 'media-right', 'quote', 'chart', 'end']),
  blocks: z.array(SlideBlockSchema),
  notes: z.string().optional(),
});

export const DeckSchema = z.object({
  id: z.string(),
  meta: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string().optional(),
    date: z.string().optional(),
    audience: z.string().optional(),
    tone: z.string().optional(),
    theme: z.enum(['DeepSpace', 'Ultraviolet', 'Minimal', 'Corporate', 'NeonGrid', 'Academic', 'Conference', 'Journal', 'Thesis', 'Beamer']),
  }),
  slides: z.array(SlideSchema),
});

export const GenerateRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  detail: z.string().optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
  length: z.number().min(3).max(50).optional(),
  theme: z.enum(['DeepSpace', 'Ultraviolet', 'Minimal', 'Corporate', 'NeonGrid', 'Academic', 'Conference', 'Journal', 'Thesis', 'Beamer']).optional(),
  enableLive: z.boolean().optional(),
  mode: z.enum(['plan', 'execute']).optional().default('plan'),
});

export const OutlineItemSchema = z.object({
  title: z.string(),
  objective: z.string(),
  slideCount: z.number().min(1).max(10),
  keyPoints: z.array(z.string()),
});

export const OutlineSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  agenda: z.array(OutlineItemSchema),
  conclusion: z.string(),
  references: z.array(z.string()).optional(),
});

// Type exports
export type LiveWidget = z.infer<typeof LiveWidgetSchema>;
export type SlideBlock = z.infer<typeof SlideBlockSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type Deck = z.infer<typeof DeckSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type OutlineItem = z.infer<typeof OutlineItemSchema>;
export type Outline = z.infer<typeof OutlineSchema>;

// Utility types
export type SlideLayout = Slide['layout'];
export type BlockType = SlideBlock['type'];
export type WidgetKind = LiveWidget['kind'];

// Default values
export const DEFAULT_THEME: Theme = 'DeepSpace';
export const DEFAULT_LENGTH = 10;
export const DEFAULT_TONE = 'Professional';
export const DEFAULT_AUDIENCE = 'General audience';
