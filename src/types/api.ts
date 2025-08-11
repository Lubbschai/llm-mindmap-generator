export interface ApiConfig {
  provider: 'openai' | 'claude';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}