import { ModelConfig } from './schemas';

// ============================================================================
// OLLAMA CONFIGURATION FOR MULTI-MODEL AGENTS
// ============================================================================

export const OLLAMA_MODELS: Record<string, ModelConfig> = {
  // Large models for complex tasks (planning, verification)
  'llama3.1-70b': {
    name: 'llama3.1-70b',
    provider: 'ollama',
    model: 'llama3.1:70b',
    apiKey: 'ollama',
    baseUrl: 'http://localhost:11434',
    maxTokens: 8000,
    temperature: 0.7,
    capabilities: ['planning', 'verification', 'analysis', 'reasoning'],
    costPerToken: 0.0, // Local, no cost
    speed: 'slow',
    quality: 'high'
  },
  
  'llama3.1-8b': {
    name: 'llama3.1-8b',
    provider: 'ollama',
    model: 'llama3.1:8b',
    apiKey: 'ollama',
    baseUrl: 'http://localhost:11434',
    maxTokens: 4000,
    temperature: 0.7,
    capabilities: ['writing', 'editing', 'generation'],
    costPerToken: 0.0,
    speed: 'medium',
    quality: 'high'
  },

  // Medium models for content generation
  'phi3-medium': {
    name: 'phi3-medium',
    provider: 'ollama',
    model: 'phi3:medium',
    apiKey: 'ollama',
    baseUrl: 'http://localhost:11434',
    maxTokens: 4000,
    temperature: 0.7,
    capabilities: ['writing', 'editing', 'summarization'],
    costPerToken: 0.0,
    speed: 'medium',
    quality: 'medium'
  },

  // Fast models for tool-like tasks
  'phi3-mini': {
    name: 'phi3-mini',
    provider: 'ollama',
    model: 'phi3:mini',
    apiKey: 'ollama',
    baseUrl: 'http://localhost:11434',
    maxTokens: 2000,
    temperature: 0.5,
    capabilities: ['formatting', 'validation', 'simple-tasks'],
    costPerToken: 0.0,
    speed: 'fast',
    quality: 'medium'
  },

  'gemma2-2b': {
    name: 'gemma2-2b',
    provider: 'ollama',
    model: 'gemma2:2b',
    apiKey: 'ollama',
    baseUrl: 'http://localhost:11434',
    maxTokens: 2000,
    temperature: 0.5,
    capabilities: ['formatting', 'validation', 'simple-tasks'],
    costPerToken: 0.0,
    speed: 'fast',
    quality: 'low'
  }
};

// Agent-specific model assignments
export const AGENT_MODEL_ASSIGNMENTS: Record<string, string> = {
  // High-quality models for complex reasoning
  'researcher': 'llama3.1-70b',
  'structurer': 'llama3.1-70b',
  'fact-checker': 'llama3.1-70b',
  'accessibility-linter': 'llama3.1-8b',
  
  // Medium models for content generation
  'slidewriter': 'llama3.1-8b',
  'copy-tightener': 'phi3-medium',
  'speaker-notes-generator': 'phi3-medium',
  'executive-summary': 'phi3-medium',
  'audience-adapter': 'phi3-medium',
  
  // Fast models for tool-like tasks
  'data-viz-planner': 'phi3-mini',
  'media-finder': 'phi3-mini',
  'live-widget-planner': 'phi3-mini'
};

// Quality-based routing policies
export const QUALITY_POLICY = {
  'researcher': 'llama3.1-70b',
  'structurer': 'llama3.1-70b',
  'slidewriter': 'llama3.1-8b',
  'copy-tightener': 'llama3.1-8b',
  'fact-checker': 'llama3.1-70b',
  'data-viz-planner': 'llama3.1-8b',
  'media-finder': 'phi3-medium',
  'speaker-notes-generator': 'llama3.1-8b',
  'accessibility-linter': 'llama3.1-8b',
  'live-widget-planner': 'phi3-medium',
  'executive-summary': 'llama3.1-8b',
  'audience-adapter': 'llama3.1-8b'
};

export const SPEED_POLICY = {
  'researcher': 'phi3-medium',
  'structurer': 'phi3-medium',
  'slidewriter': 'phi3-mini',
  'copy-tightener': 'phi3-mini',
  'fact-checker': 'phi3-mini',
  'data-viz-planner': 'phi3-mini',
  'media-finder': 'phi3-mini',
  'speaker-notes-generator': 'phi3-mini',
  'accessibility-linter': 'phi3-mini',
  'live-widget-planner': 'phi3-mini',
  'executive-summary': 'phi3-mini',
  'audience-adapter': 'phi3-mini'
};

export const BALANCED_POLICY = {
  'researcher': 'llama3.1-8b',
  'structurer': 'llama3.1-8b',
  'slidewriter': 'phi3-medium',
  'copy-tightener': 'phi3-medium',
  'fact-checker': 'llama3.1-8b',
  'data-viz-planner': 'phi3-medium',
  'media-finder': 'phi3-mini',
  'speaker-notes-generator': 'phi3-medium',
  'accessibility-linter': 'phi3-medium',
  'live-widget-planner': 'phi3-mini',
  'executive-summary': 'phi3-medium',
  'audience-adapter': 'phi3-medium'
};

export function getModelForAgent(agentName: string, policy: string = 'balanced'): ModelConfig {
  let modelName: string;
  
  switch (policy) {
    case 'quality':
      modelName = QUALITY_POLICY[agentName] || 'llama3.1-8b';
      break;
    case 'speed':
      modelName = SPEED_POLICY[agentName] || 'phi3-mini';
      break;
    case 'balanced':
    default:
      modelName = BALANCED_POLICY[agentName] || 'phi3-medium';
      break;
  }
  
  return OLLAMA_MODELS[modelName] || OLLAMA_MODELS['phi3-medium'];
}

export function getAllAvailableModels(): ModelConfig[] {
  return Object.values(OLLAMA_MODELS);
}

export function getModelByName(name: string): ModelConfig | undefined {
  return OLLAMA_MODELS[name];
}
