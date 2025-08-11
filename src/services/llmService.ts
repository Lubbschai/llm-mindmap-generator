import axios from 'axios';
import type { LLMProvider, LLMRequest, LLMResponse, LLMStreamChunk } from '../types/llm';

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    apiUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
  },
];

export class LLMService {
  private async callOpenAI(request: LLMRequest): Promise<LLMResponse> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: request.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${request.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
      },
      model: response.data.model,
    };
  }

  private async callClaude(request: LLMRequest): Promise<LLMResponse> {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: request.model || 'claude-3-sonnet-20240229',
        max_tokens: request.maxTokens || 2000,
        messages: [{ role: 'user', content: request.prompt }],
      },
      {
        headers: {
          'x-api-key': request.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return {
      content: response.data.content[0].text,
      usage: {
        promptTokens: response.data.usage.input_tokens,
        completionTokens: response.data.usage.output_tokens,
        totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
      },
      model: response.data.model,
    };
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    try {
      switch (request.provider) {
        case 'openai':
          return await this.callOpenAI(request);
        case 'claude':
          return await this.callClaude(request);
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async generateStreamResponse(
    request: LLMRequest,
    onChunk: (chunk: LLMStreamChunk) => void
  ): Promise<void> {
    // Simplified streaming implementation
    // In a real implementation, you would use EventSource or fetch with streaming
    try {
      const response = await this.generateResponse(request);
      
      // Simulate streaming by sending chunks
      const words = response.content.split(' ');
      let currentContent = '';
      
      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? ' ' : '') + words[i];
        onChunk({
          content: currentContent,
          finished: i === words.length - 1,
        });
        
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      throw error;
    }
  }
}