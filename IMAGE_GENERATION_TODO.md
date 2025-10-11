# Image Generation for Slides - Implementation Guide

## Current Status
Images are generated as **descriptions only** (text prompts), not actual visual files.

## Why This Limitation Exists
Generating real images requires:
1. **Image Generation API** (DALL-E, Stability AI, Midjourney)
2. **API Keys & Credits** ($$$)
3. **Storage** for generated images
4. **Processing Time** (30-60 seconds per image)

## Quick Fix Options

### Option 1: Use Placeholder Icons/Illustrations
**Cost:** FREE  
**Time:** 1 hour  
**Quality:** Low-Medium

Use public icon libraries:
- Undraw.co (free illustrations)
- Unsplash API (free photos)
- Icon libraries (Font Awesome, Hero Icons)

**Implementation:**
```typescript
// In src/lib/deck-generator.ts
async function generateVisual(params: any): Promise<any> {
  // Map topic keywords to Unsplash categories
  const category = mapTopicToCategory(params.title);
  const unsplashUrl = `https://source.unsplash.com/800x600/?${category}`;
  
  return {
    prompt: params.title,
    alt: params.bullets[0] || params.title,
    source: unsplashUrl // Real image!
  };
}
```

### Option 2: Use DALL-E Mini (Free API)
**Cost:** FREE  
**Time:** 2 hours  
**Quality:** Medium

Use Craiyon API (formerly DALL-E Mini):
```typescript
async function generateVisual(params: any): Promise<any> {
  const response = await fetch('https://backend.craiyon.com/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt: params.title })
  });
  
  const data = await response.json();
  return {
    prompt: params.title,
    alt: params.title,
    source: `data:image/jpeg;base64,${data.images[0]}`
  };
}
```

### Option 3: Use OpenAI DALL-E 3 (Paid)
**Cost:** $0.04 per image (cheap!)  
**Time:** 30 mins  
**Quality:** HIGH

```typescript
async function generateVisual(params: any): Promise<any> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Professional diagram for presentation: ${params.title}`,
    size: "1024x1024",
    quality: "standard",
  });
  
  return {
    prompt: params.title,
    alt: params.title,
    source: response.data[0].url
  };
}
```

### Option 4: Chart.js for Data Visualizations
**Cost:** FREE  
**Time:** 3 hours  
**Quality:** HIGH (for charts only)

For slides with data, generate actual chart images:
```typescript
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

async function generateChartImage(chartSpec: any): Promise<string> {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });
  const image = await chartJSNodeCanvas.renderToBuffer(chartSpec);
  return `data:image/png;base64,${image.toString('base64')}`;
}
```

## Recommended Approach

**For MVP (Minimum Viable Product):**
1. Use **Unsplash API** for photos (free, instant)
2. Use **Chart.js** for data visualizations (free, high quality)
3. Use **Undraw.co** illustrations for concepts (free, professional)

**Cost:** $0  
**Time:** 2-3 hours  
**Quality:** Good enough for demos

## Implementation Steps

1. **Install dependencies:**
   ```bash
   npm install chartjs-node-canvas
   ```

2. **Update `src/lib/deck-generator.ts`:**
   ```typescript
   // Add real image URLs instead of placeholders
   image: {
     prompt: `Visual for ${slide.title}`,
     alt: slide.title,
     source: `https://source.unsplash.com/800x600/?${encodeURIComponent(slide.title)}`
   }
   ```

3. **Update PPTX export to include images:**
   ```typescript
   // In src/app/api/export/pptx/route.ts
   if (slide.image && slide.image.source) {
     pptxSlide.addImage({
       path: slide.image.source,
       x: 5,
       y: 2,
       w: 4,
       h: 3
     });
   }
   ```

## For Production

**Best Solution:** Hybrid approach
- **Charts/Diagrams:** Generate with Chart.js (free, instant)
- **Photos:** Unsplash API (free, high quality)
- **Custom illustrations:** DALL-E 3 only for key slides ($0.04 each)

**Estimated cost per presentation (10 slides):**
- 7 slides: Unsplash photos (free)
- 2 slides: Charts (free)
- 1 slide: DALL-E hero image ($0.04)
- **Total: $0.04 per deck**

## Current Workaround

For now, the system generates **descriptive text** about what images *should* be, which is actually helpful for:
1. **Accessibility** - Screen readers get descriptions
2. **Customization** - Users know what to look for
3. **Speed** - No API delays or costs

To make this clearer to users, we've updated the UI to show a compact "Visual: [description]" indicator instead of the full prompt text.

---

*This is a design decision, not a bug. Real image generation can be added later based on user demand and budget.*

