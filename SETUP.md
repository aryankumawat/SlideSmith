# SlideSmith Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure LLM (Language Model):**
   
   The application comes with demo mode enabled by default. Edit `.env.local` file to change:

   **Default: Demo Mode (No API key needed)**
   ```env
   LLM_PROVIDER=demo
   ```

   **Option A: OpenAI (For real AI generation)**
   ```env
   LLM_PROVIDER=openai
   LLM_API_KEY=your_actual_openai_api_key_here
   LLM_BASE_URL=https://api.openai.com
   LLM_MODEL=gpt-4
   ```

   **Option B: Ollama (Local)**
   ```env
   LLM_PROVIDER=ollama
   LLM_BASE_URL=http://localhost:11434
   LLM_MODEL=llama2
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file

### Ollama (Local)
1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Run: `ollama pull llama2`
3. Start Ollama server: `ollama serve`
4. The application will connect to `http://localhost:11434`

## Troubleshooting

### Slides Not Generating
- The application runs in demo mode by default - this is normal!
- For real AI generation, set up your API key in `.env.local`
- Check the browser console for error messages
- Demo mode generates sample content for testing the interface

### Demo Mode
The application runs in demo mode by default, which generates sample content for testing the interface. This is perfect for trying out the application without needing API keys.

## Features

- **AI-Powered Generation**: Create presentations from any topic
- **Live Planning**: Watch slides being generated in real-time
- **Multiple Themes**: Choose from various presentation themes
- **Export Options**: Download as PDF or PPTX
- **Live Widgets**: Add interactive elements to slides

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Try demo mode to isolate the issue
4. Check the network tab for API call failures
