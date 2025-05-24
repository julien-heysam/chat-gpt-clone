export interface ModelInfo {
  id: string
  name: string
  provider: 'anthropic' | 'openai'
  description: string
  costPerTokenInput: number // Cost per million tokens
  costPerTokenOutput: number // Cost per million tokens
  maxContextWindow: number // In tokens
  maxOutputTokens: number
  capabilities: string[]
  released: string
  deprecated?: boolean
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // Anthropic Claude 4 Models (Latest)
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    description: 'Most powerful and capable model for complex tasks, advanced reasoning, and coding',
    costPerTokenInput: 15.0, // $15 per million tokens
    costPerTokenOutput: 75.0, // $75 per million tokens
    maxContextWindow: 200000,
    maxOutputTokens: 32000,
    capabilities: ['text', 'vision', 'extended-thinking', 'coding', 'reasoning'],
    released: '2025-05-22'
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'High-performance model with exceptional reasoning capabilities and efficiency',
    costPerTokenInput: 3.0, // $3 per million tokens
    costPerTokenOutput: 15.0, // $15 per million tokens
    maxContextWindow: 200000,
    maxOutputTokens: 64000,
    capabilities: ['text', 'vision', 'extended-thinking', 'coding', 'reasoning'],
    released: '2025-05-22'
  },
  
  // OpenAI GPT-4.1 Models (Latest)
  {
    id: 'gpt-4.1-2025-04-14',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Advanced general-purpose model with extensive world knowledge and enhanced coding abilities',
    costPerTokenInput: 2.0, // $2 per million tokens
    costPerTokenOutput: 8.0, // $8 per million tokens
    maxContextWindow: 1000000,
    maxOutputTokens: 32768,
    capabilities: ['text', 'vision', 'coding', 'reasoning', 'tool-calling'],
    released: '2025-04-14'
  },
  {
    id: 'gpt-4.1-mini-2025-04-14',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Balanced performance and cost model with strong capabilities',
    costPerTokenInput: 0.4, // $0.40 per million tokens
    costPerTokenOutput: 1.6, // $1.60 per million tokens
    maxContextWindow: 1000000,
    maxOutputTokens: 32768,
    capabilities: ['text', 'vision', 'coding', 'reasoning', 'tool-calling'],
    released: '2025-04-14'
  },
  {
    id: 'gpt-4.1-nano-2025-04-14',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    description: 'Ultra-fast, cost-efficient model for lightweight applications',
    costPerTokenInput: 0.1, // $0.10 per million tokens
    costPerTokenOutput: 0.4, // $0.40 per million tokens
    maxContextWindow: 1000000,
    maxOutputTokens: 32768,
    capabilities: ['text', 'vision', 'coding', 'tool-calling'],
    released: '2025-04-14'
  },

  // Anthropic Claude 3.5 Models (Still Current)
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Intelligent model with strong performance across diverse tasks',
    costPerTokenInput: 3.0, // $3 per million tokens
    costPerTokenOutput: 15.0, // $15 per million tokens
    maxContextWindow: 200000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'vision', 'coding', 'reasoning'],
    released: '2024-10-22'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Fastest, most cost-effective model for simple to moderate tasks',
    costPerTokenInput: 0.8, // $0.80 per million tokens
    costPerTokenOutput: 4.0, // $4 per million tokens
    maxContextWindow: 200000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'vision', 'coding'],
    released: '2024-10-22'
  },

  // Legacy models (marked as deprecated for reference)
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    description: 'High-performance model with early extended thinking (Legacy)',
    costPerTokenInput: 3.0,
    costPerTokenOutput: 15.0,
    maxContextWindow: 200000,
    maxOutputTokens: 64000,
    capabilities: ['text', 'vision', 'extended-thinking'],
    released: '2025-02-19',
    deprecated: true
  }
]

export function getModelById(id: string): ModelInfo | null {
  return AVAILABLE_MODELS.find(model => model.id === id) || null
}

export function getModelsByProvider(provider: 'anthropic' | 'openai'): ModelInfo[] {
  return AVAILABLE_MODELS.filter(model => model.provider === provider && !model.deprecated)
}

export function getCurrentModels(): ModelInfo[] {
  return AVAILABLE_MODELS.filter(model => !model.deprecated)
}

export function getRecommendedModel(useCase: 'coding' | 'general' | 'fast' | 'cost-effective'): ModelInfo {
  switch (useCase) {
    case 'coding':
      return getModelById('claude-opus-4-20250514') || AVAILABLE_MODELS[0]
    case 'general':
      return getModelById('claude-sonnet-4-20250514') || AVAILABLE_MODELS[0]
    case 'fast':
      return getModelById('gpt-4.1-nano-2025-04-14') || AVAILABLE_MODELS[0]
    case 'cost-effective':
      return getModelById('claude-3-5-haiku-20241022') || AVAILABLE_MODELS[0]
    default:
      return getModelById('claude-sonnet-4-20250514') || AVAILABLE_MODELS[0]
  }
}

export function calculateCost(inputTokens: number, outputTokens: number, modelId: string): number {
  const model = getModelById(modelId)
  if (!model) return 0
  
  const inputCost = (inputTokens / 1000000) * model.costPerTokenInput
  const outputCost = (outputTokens / 1000000) * model.costPerTokenOutput
  return inputCost + outputCost
}

// Rough estimation of token count from text
// This is an approximation: 1 token ≈ 0.75 words ≈ 4 characters for English
export function estimateTokenCount(text: string): number {
  // Remove extra whitespace and count characters
  const cleanText = text.trim().replace(/\s+/g, ' ')
  // Estimate tokens: roughly 4 characters per token for English text
  return Math.ceil(cleanText.length / 4)
}

export function formatCost(cost: number): string {
  if (cost < 0.001) {
    return '<$0.001'
  } else if (cost < 0.01) {
    return `$${cost.toFixed(4)}`
  } else if (cost < 1) {
    return `$${cost.toFixed(3)}`
  } else {
    return `$${cost.toFixed(2)}`
  }
}

export const DEFAULT_MODEL = 'claude-sonnet-4-20250514' 