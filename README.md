# SlideSmith - AI Slide Maker

A production-ready AI-powered slide creation tool that transforms any topic into stunning, animated slide decks with live widgets and seamless export capabilities.

## Features

### 🚀 Core Features
- **AI Generation**: Generate complete slide decks from any topic using OpenAI or Ollama
- **5 Beautiful Themes**: DeepSpace, Ultraviolet, Minimal, Corporate, and NeonGrid
- **Live Widgets**: Real-time charts, tickers, countdowns, maps, and iframes
- **Export Options**: Download as PDF or PPTX with perfect formatting
- **Inline Editing**: WYSIWYG editing with real-time preview
- **Share & Save**: Share via URL or save locally with IndexedDB

### 🎨 Themes
1. **DeepSpace**: Near-black background with twinkling stars and blue-violet accents
2. **Ultraviolet**: Dark purple gradient with neon borders and glow effects
3. **Minimal**: Clean white design with subtle typography
4. **Corporate**: Professional navy and slate color scheme
5. **NeonGrid**: Cyber-themed with grid patterns and neon colors

### 📊 Live Widgets
- **LiveChart**: Real-time data visualization with auto-refresh
- **Ticker**: Live cryptocurrency and stock price tickers
- **Countdown**: Event countdown timers
- **Map**: Interactive location markers
- **Iframe**: Embedded live dashboards and content

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **UI**: React 18, Tailwind CSS, shadcn/ui
- **State**: React Hook Form + Zod validation
- **AI**: OpenAI-compatible API with Ollama support
- **Charts**: Recharts for data visualization
- **Export**: PptxGenJS (PPTX), Playwright (PDF)
- **Storage**: IndexedDB with idb-keyval
- **Icons**: Lucide React

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (or Ollama for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slidesmith
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # For OpenAI
   LLM_PROVIDER=openai
   LLM_API_KEY=your_openai_api_key_here
   LLM_BASE_URL=https://api.openai.com
   LLM_MODEL=gpt-4
   
   # For Ollama (local)
   # LLM_PROVIDER=ollama
   # LLM_BASE_URL=http://localhost:11434
   # LLM_MODEL=llama2
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_PROVIDER` | AI provider (`openai` or `ollama`) | `openai` |
| `LLM_API_KEY` | API key for OpenAI | Required for OpenAI |
| `LLM_BASE_URL` | Base URL for API calls | `https://api.openai.com` |
| `LLM_MODEL` | Model to use | `gpt-4` |
| `ENABLE_AUTH` | Enable authentication | `false` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Required if auth enabled |

### LLM Provider Setup

#### OpenAI
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Set `LLM_PROVIDER=openai`
3. Set `LLM_API_KEY=your_key_here`

#### Ollama (Local)
1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull llama2`
3. Set `LLM_PROVIDER=ollama`
4. Set `LLM_BASE_URL=http://localhost:11434`
5. Set `LLM_MODEL=llama2`

## Usage

### Creating a Presentation

1. **Navigate to Studio**
   Go to `/studio` or click "Get Started" on the landing page

2. **Fill in the Form**
   - **Topic**: Main subject of your presentation
   - **Details**: Additional context or specific points
   - **Tone**: Professional, Casual, Academic, Creative, or Technical
   - **Audience**: Target audience description
   - **Length**: Number of slides (3-50)
   - **Theme**: Choose from 5 available themes
   - **Live Widgets**: Enable real-time data widgets

3. **Generate**
   Click "Generate Presentation" and wait for AI to create your slides

4. **Edit & Customize**
   - Use the edit mode to modify slides inline
   - Add, remove, or regenerate individual slides
   - Switch between different themes

5. **Export**
   - Download as PDF for perfect visual rendering
   - Export as PPTX for PowerPoint compatibility
   - Share via URL for easy collaboration

### Keyboard Shortcuts

- `←` / `→`: Navigate between slides
- `Escape`: Exit edit mode
- `Ctrl/Cmd + E`: Toggle edit mode

## API Endpoints

### Generate Presentation
```http
POST /api/generate
Content-Type: application/json

{
  "topic": "The Future of AI",
  "detail": "Focus on machine learning trends",
  "tone": "Professional",
  "audience": "Tech executives",
  "length": 12,
  "theme": "DeepSpace",
  "enableLive": true
}
```

### Export PDF
```http
POST /api/export/pdf
Content-Type: application/json

{
  "deck": { /* deck object */ }
}
```

### Export PPTX
```http
POST /api/export/pptx
Content-Type: application/json

{
  "deck": { /* deck object */ }
}
```

### Live Widget Proxy
```http
GET /api/live-proxy?url=https://api.example.com/data
```

## Development

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── studio/            # Studio page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── blocks/            # Slide block components
│   ├── live-widgets/      # Live widget components
│   └── ui/                # shadcn/ui components
├── lib/                   # Core utilities
│   ├── schema.ts          # TypeScript types
│   ├── llm.ts             # AI client
│   ├── outline.ts         # Outline generation
│   ├── slidewriter.ts     # Slide creation
│   ├── theming.ts         # Theme system
│   └── storage.ts         # IndexedDB storage
└── prompts/               # AI prompts
    └── slide_prompts.ts   # Prompt templates
```

### Adding New Themes

1. **Define Theme Config**
   ```typescript
   // src/lib/theming.ts
   export const themeConfigs: Record<Theme, ThemeConfig> = {
     YourTheme: {
       name: 'Your Theme',
       colors: { /* theme colors */ },
       // ... other config
     }
   };
   ```

2. **Add CSS Classes**
   ```css
   /* src/app/globals.css */
   .your-theme-class {
     /* theme-specific styles */
   }
   ```

3. **Update TypeScript Types**
   ```typescript
   // src/lib/schema.ts
   export type Theme = "DeepSpace" | "Ultraviolet" | "Minimal" | "Corporate" | "NeonGrid" | "YourTheme";
   ```

### Adding New Live Widgets

1. **Define Widget Type**
   ```typescript
   // src/lib/schema.ts
   export const LiveWidgetSchema = z.discriminatedUnion('kind', [
     // ... existing widgets
     z.object({
       kind: z.literal('YourWidget'),
       // ... widget properties
     }),
   ]);
   ```

2. **Create Widget Component**
   ```typescript
   // src/components/live-widgets/YourWidget.tsx
   export function YourWidget({ widget, theme }: YourWidgetProps) {
     // Widget implementation
   }
   ```

3. **Add to LiveBlock**
   ```typescript
   // src/components/blocks/LiveBlock.tsx
   case 'YourWidget':
     return <YourWidget widget={widget} theme={theme} />;
   ```

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Vercel will automatically detect Next.js

2. **Set Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure `LLM_API_KEY` is set for production

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or trigger manual deployment from Vercel dashboard

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify**: Use `@netlify/plugin-nextjs`
- **Railway**: Direct deployment from GitHub
- **Docker**: Use the included Dockerfile

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

## Roadmap

- [ ] Advanced slide animations
- [ ] Collaborative editing
- [ ] Template library
- [ ] Advanced export options
- [ ] Mobile app
- [ ] Plugin system

---
