# Multi-Model AI Slide Maker

**Turn any topic into a polished, animated slide deck—powered by a modular, multi-model agent system.**

## 🚀 Overview

The Multi-Model AI Slide Maker is an advanced presentation generation system that uses specialized AI agents working together to create high-quality, fact-checked, and audience-appropriate slide decks. Each agent has a specific role and can use different AI models optimized for their task.

## 🏗️ Architecture

### Core Components

1. **Router/Orchestrator** - Manages model selection and task routing
2. **Specialized Agents** - Each handles a specific aspect of slide creation
3. **Quality Assurance Pipeline** - Ensures high standards across all outputs
4. **Multi-Model Support** - Works with OpenAI, Ollama, and local models

### Agent System

| Agent | Purpose | Key Capabilities |
|-------|---------|------------------|
| **Researcher** | Evidence Collection | Web search, source verification, snippet extraction |
| **Structurer** | Deck Planning | Outline generation, narrative structure, audience analysis |
| **Slidewriter** | Content Creation | Slide composition, bullet formatting, citation integration |
| **Copy Tightener** | Tone Consistency | Text optimization, readability improvement, voice normalization |
| **Fact Checker** | Quality Assurance | Claim verification, citation mapping, hallucination detection |
| **Data→Viz Planner** | Chart Strategy | Visualization recommendations, data analysis |
| **Media Finder** | Visual Content | Image suggestions, alt-text generation |
| **Speaker Notes** | Presenter Support | Speaking guidance, transition suggestions |
| **Accessibility Linter** | Design Quality | A11y compliance, design pattern validation |
| **Live Widget Planner** | Interactive Elements | Real-time data integration, widget recommendations |
| **Executive Summary** | High-Level Overview | TL;DR generation, email summaries |
| **Audience Adapter** | Content Retargeting | Audience-specific customization, duration adjustment |

## 🎯 Key Features

### Multi-Model Intelligence
- **Quality Policy**: Uses large models (GPT-4) for planning and verification
- **Speed Policy**: Uses fast models (GPT-3.5) for content generation
- **Cost Policy**: Optimizes for minimal token usage
- **Balanced Policy**: Balances quality, speed, and cost
- **Local-Only Policy**: Uses only local models for privacy

### Quality Assurance
- **Fact Checking**: Verifies all claims against research sources
- **Citation Mapping**: Ensures proper source attribution
- **Accessibility Compliance**: Validates design and readability standards
- **Consistency Checking**: Maintains tone and style throughout
- **Word Budget Enforcement**: Enforces strict limits (≤8 words titles, ≤12 words bullets)

### Advanced Capabilities
- **Parallel Processing**: Generates multiple slides simultaneously
- **Audience Adaptation**: Repurposes content for different audiences
- **Executive Summaries**: Creates high-level overviews for executives
- **Live Widget Integration**: Adds real-time data and interactive elements
- **Source Verification**: Validates and tracks all information sources

## 📊 Quality Standards

### Slide Structure
- **Titles**: ≤8 words, active voice, compelling
- **Bullets**: ≤12 words each, ≤6 bullets per slide
- **Content**: One core idea per slide
- **Citations**: All claims must be supported by sources

### Content Quality
- **Readability**: Appropriate for target audience
- **Accuracy**: Fact-checked against reliable sources
- **Consistency**: Uniform tone and terminology
- **Accessibility**: Screen reader friendly, high contrast

## 🔧 Usage

### API Endpoint

```bash
POST /api/multi-model-generate
```

### Request Format

```json
{
  "topic": "AI in Healthcare",
  "audience": "Medical professionals",
  "tone": "Professional and evidence-based",
  "desiredSlideCount": 12,
  "theme": "medical",
  "policy": "quality",
  "sources": ["PubMed", "WHO", "FDA"],
  "urls": ["https://example.com/research"],
  "enableLive": true,
  "generateExecutiveSummary": true,
  "adaptForAudience": {
    "targetAudience": "Business executives",
    "targetDuration": 15
  }
}
```

### Response Format

```json
{
  "success": true,
  "deck": {
    "id": "deck-123",
    "meta": { /* deck metadata */ },
    "slides": [ /* array of slides */ ],
    "researchSnippets": [ /* research sources */ ],
    "quality": { /* quality scores */ }
  },
  "metadata": {
    "totalTokens": 15000,
    "totalCost": 0.45,
    "processingTime": 8500,
    "qualityScores": {
      "factCheck": 0.92,
      "accessibility": 0.88,
      "readability": 0.91,
      "consistency": 0.89
    }
  },
  "executiveSummary": { /* optional */ },
  "qualityChecks": [ /* quality issues found */ ],
  "audienceAdaptation": { /* optional */ }
}
```

## 🧪 Testing

### Run the Test Suite

```bash
node test-multi-model.js
```

### Test Cases

1. **Quality Policy Test**: Tests high-accuracy generation with fact-checking
2. **Speed Policy Test**: Tests fast generation with live widgets
3. **Local Policy Test**: Tests privacy-focused local model usage
4. **Audience Adaptation**: Tests content retargeting capabilities

### Health Check

```bash
GET /api/multi-model-generate/health
```

## 🔧 Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com

# Ollama Configuration (for local models)
OLLAMA_BASE_URL=http://localhost:11434

# Model Selection
LLM_PROVIDER=openai  # or 'ollama' or 'local'
LLM_MODEL=gpt-4-turbo
```

### Model Configuration

The system supports multiple models with different capabilities:

```typescript
{
  name: 'gpt-4-turbo',
  provider: 'openai',
  model: 'gpt-4-turbo',
  capabilities: ['researcher', 'structurer', 'fact-checker'],
  costPerToken: 0.00003,
  speed: 'medium',
  quality: 'high'
}
```

## 📈 Performance Metrics

### Token Usage
- **Research Phase**: ~2,000-5,000 tokens
- **Structure Phase**: ~1,000-2,000 tokens
- **Content Generation**: ~3,000-8,000 tokens (parallel)
- **Quality Assurance**: ~1,000-3,000 tokens
- **Total**: ~7,000-18,000 tokens per presentation

### Processing Time
- **Quality Policy**: 15-30 seconds
- **Speed Policy**: 8-15 seconds
- **Balanced Policy**: 10-20 seconds
- **Local Policy**: 30-60 seconds (depending on hardware)

### Quality Scores
- **Fact Check**: 0.85-0.95 (excellent)
- **Accessibility**: 0.80-0.90 (good)
- **Readability**: 0.85-0.95 (excellent)
- **Consistency**: 0.80-0.90 (good)

## 🛠️ Development

### Adding New Agents

1. Create agent class extending `BaseAgent`
2. Implement required methods (`execute`, `validateOutput`, etc.)
3. Register agent in orchestrator
4. Add routing rules for the agent

### Adding New Models

1. Add model configuration to router
2. Implement model-specific calling logic
3. Add capabilities mapping
4. Test with different routing policies

### Quality Improvements

1. Enhance fact-checking algorithms
2. Improve citation mapping accuracy
3. Add more accessibility checks
4. Optimize word budget enforcement

## 🔒 Security & Privacy

### Data Handling
- **Local Mode**: All processing happens locally
- **Cloud Mode**: Data sent to configured APIs
- **No Storage**: No persistent storage of user data
- **Rate Limiting**: Built-in protection against abuse

### Model Selection
- **Privacy-First**: Local models when possible
- **Quality-First**: Best models for critical tasks
- **Cost-Aware**: Optimize for budget constraints

## 🚀 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Template System**: Pre-built slide templates for common topics
- **Advanced Analytics**: Detailed usage and quality metrics
- **Custom Models**: Support for fine-tuned models
- **Multi-language**: Support for non-English presentations

### Agent Improvements
- **Better Research**: Enhanced web search and source validation
- **Smarter Fact-Checking**: More sophisticated claim verification
- **Advanced Visualization**: AI-generated charts and diagrams
- **Voice Integration**: Text-to-speech for speaker notes

## 📚 API Reference

### Endpoints

- `POST /api/multi-model-generate` - Generate presentation
- `GET /api/multi-model-generate/health` - Health check
- `GET /api/multi-model-generate/status` - System status

### Error Handling

All endpoints return consistent error formats:

```json
{
  "error": "Error message",
  "details": { /* additional error info */ }
}
```

### Rate Limiting

- **Multi-Model API**: 10 requests per hour per IP
- **Health Check**: No limits
- **Status Check**: No limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Next.js, TypeScript, and the power of multiple AI models.**
