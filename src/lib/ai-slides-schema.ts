import { z } from 'zod';

// Theme types following the specification
export const ThemeType = z.enum([
  'nebula-dark',
  'ultraviolet', 
  'minimal-light'
]);

// Slide kinds following the specification
export const SlideKind = z.enum([
  'cover',
  'agenda', 
  'content',
  'kpi',
  'comparison',
  'timeline',
  'quote',
  'diagram',
  'summary',
  'references'
]);

// Layout types
export const LayoutType = z.enum([
  'cover',
  'agenda',
  'two-column',
  'list',
  'comparison',
  'kpi',
  'timeline',
  'quote',
  'diagram',
  'summary'
]);

// Visual types
export const VisualType = z.enum([
  'shape',
  'icon-grid',
  'image',
  'chart',
  'diagram',
  'timeline',
  'comparison'
]);

// Visual schema
export const VisualSchema = z.object({
  type: VisualType,
  keywords: z.array(z.string()),
  style: z.string().optional(),
});

// KPI schema
export const KPISchema = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
});

// Brand schema
export const BrandSchema = z.object({
  logoUrl: z.string().url().optional(),
  accent: z.string().optional(),
});

// Slide schema following the specification
export const AISlideSchema = z.object({
  kind: SlideKind,
  title: z.string().max(8), // Max 8 words as per spec
  subtitle: z.string().optional(),
  bullets: z.array(z.string().max(12)).max(6).optional(), // Max 6 bullets, 12 words each
  speakerNotes: z.string().min(80).max(140).optional(), // 80-140 words
  visual: VisualSchema.optional(),
  kpis: z.array(KPISchema).optional(),
  layout: LayoutType.optional(),
});

// Deck schema following the specification
export const AIDeckSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  theme: ThemeType,
  brand: BrandSchema.optional(),
  slides: z.array(AISlideSchema),
});

// Input schema for topic or script
export const InputSchema = z.object({
  topic: z.string().optional(),
  script: z.string().optional(),
  theme: ThemeType.default('nebula-dark'),
  audience: z.string().optional(),
  tone: z.string().optional(),
}).refine(data => data.topic || data.script, {
  message: "Either topic or script must be provided"
});

// Type exports
export type Theme = z.infer<typeof ThemeType>;
export type SlideKind = z.infer<typeof SlideKind>;
export type LayoutType = z.infer<typeof LayoutType>;
export type VisualType = z.infer<typeof VisualType>;
export type Visual = z.infer<typeof VisualSchema>;
export type KPI = z.infer<typeof KPISchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type AISlide = z.infer<typeof AISlideSchema>;
export type AIDeck = z.infer<typeof AIDeckSchema>;
export type Input = z.infer<typeof InputSchema>;

// Default values
export const DEFAULT_THEME: Theme = 'nebula-dark';
export const DEFAULT_BRAND: Brand = {
  accent: '#6C9CFF'
};

// Theme tokens following the specification
export const THEME_TOKENS = {
  'nebula-dark': {
    bg: '#0B0F19',
    fg: '#EAF2FF',
    accents: {
      primary: '#6C9CFF',
      secondary: '#8B5CF6', 
      tertiary: '#22D3EE'
    },
    gradients: {
      primary: 'radial-gradient(circle at 50% 50%, rgba(108, 156, 255, 0.1) 0%, transparent 70%)',
      secondary: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
    }
  },
  'ultraviolet': {
    bg: '#0D021F',
    fg: '#F5EEFF',
    accents: {
      primary: '#7C3AED',
      secondary: '#C084FC',
      tertiary: '#60A5FA'
    },
    gradients: {
      primary: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
      secondary: 'radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.1) 0%, transparent 70%)'
    }
  },
  'minimal-light': {
    bg: '#FFFFFF',
    fg: '#0A0A0A',
    accents: {
      primary: '#2563EB',
      secondary: '#10B981',
      tertiary: '#F59E0B'
    },
    gradients: {
      primary: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
      secondary: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    }
  }
};

// Typography scale
export const TYPOGRAPHY = {
  h1: { fontSize: '56px', fontWeight: 800, lineHeight: 1.1 },
  h2: { fontSize: '40px', fontWeight: 800, lineHeight: 1.2 },
  h3: { fontSize: '32px', fontWeight: 700, lineHeight: 1.3 },
  body: { fontSize: '18px', fontWeight: 400, lineHeight: 1.6 },
  caption: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5 }
};

// Spacing scale
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px'
};

// Animation durations
export const ANIMATIONS = {
  fast: '200ms',
  normal: '300ms',
  slow: '500ms'
};
