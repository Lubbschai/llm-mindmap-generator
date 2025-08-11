export interface LLMProvider {
  id: string;
  name: string;
  apiUrl: string;
  requiresApiKey: boolean;
}

export interface LLMRequest {
  provider: string;
  apiKey?: string;
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface LLMStreamChunk {
  content: string;
  finished: boolean;
}

export interface LLMConfig {
  provider: string;
  apiKey?: string;
  model?: string;
  temperature: number;
  maxTokens: number;
}