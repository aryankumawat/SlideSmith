# SlideSmith Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure LLM (Language Model):**
   
   Edit `.env.local` file and set your preferred LLM provider:

   **Option A: OpenAI (Recommended)**
   ```env
   LLM_PROVIDER=openai
   LLM_API_KEY=your_openai_api_key_here
   LLM_BASE_URL=https://api.openai.com
   LLM_MODEL=gpt-4
   ```

   **Option B: Ollama (Local)**
   ```env
   LLM_PROVIDER=ollama
   LLM_BASE_URL=http://localhost:11434
   LLM_MODEL=llama2
   ```

   **Option C: Demo Mode (No API key needed)**
   ```env
   LLM_PROVIDER=demo
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
- Check that your API key is correctly set in `.env.local`
- Verify the LLM provider is set correctly
- Check the browser console for error messages
- Try demo mode first to test the application flow

### Demo Mode
If you don't have API keys, the application will automatically fall back to demo mode, which generates sample content for testing the interface.

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
