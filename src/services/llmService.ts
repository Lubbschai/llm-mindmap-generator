import axios from 'axios';
import type { ApiConfig, LLMRequest, LLMResponse, ApiResponse } from '../types/api';

export class LLMService {
  private config: ApiConfig | null = null;

  setConfig(config: ApiConfig) {
    this.config = config;
  }

  getConfig(): ApiConfig | null {
    return this.config;
  }

  async processText(request: LLMRequest): Promise<ApiResponse> {
    if (!this.config) {
      return {
        success: false,
        error: '请先配置API密钥',
      };
    }

    try {
      let response;
      
      if (this.config.provider === 'openai') {
        response = await this.callOpenAI(request);
      } else if (this.config.provider === 'claude') {
        response = await this.callClaude(request);
      } else {
        throw new Error('不支持的API提供商');
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  private async callOpenAI(request: LLMRequest): Promise<LLMResponse> {
    const baseUrl = this.config?.baseUrl || 'https://api.openai.com/v1';
    const model = this.config?.model || 'gpt-3.5-turbo';

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature || 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config?.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  private async callClaude(request: LLMRequest): Promise<LLMResponse> {
    const baseUrl = this.config?.baseUrl || 'https://api.anthropic.com/v1';
    const model = this.config?.model || 'claude-3-sonnet-20240229';

    const response = await axios.post(
      `${baseUrl}/messages`,
      {
        model,
        max_tokens: request.maxTokens || 2000,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature || 0.7,
      },
      {
        headers: {
          'x-api-key': this.config?.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  // 测试API连接
  async testConnection(): Promise<ApiResponse> {
    if (!this.config) {
      return {
        success: false,
        error: '请先配置API密钥',
      };
    }

    const testRequest: LLMRequest = {
      prompt: 'Hello',
      maxTokens: 10,
    };

    return this.processText(testRequest);
  }

  // 获取支持的模型列表
  getSupportedModels(provider: 'openai' | 'claude'): string[] {
    if (provider === 'openai') {
      return [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
      ];
    } else if (provider === 'claude') {
      return [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
      ];
    }
    return [];
  }

  // 生成提示词以优化内容解析
  generateOptimizationPrompt(content: string): string {
    return `请帮我整理和优化以下内容，使其更适合转换为思维导图。要求：
1. 保持原有的主要信息和结构
2. 将内容整理为清晰的层次结构
3. 使用标题、子标题和要点的形式
4. 保持中文表达的准确性
5. 突出关键概念和关系

原始内容：
${content}

请返回优化后的结构化内容：`;
  }
}

export const llmService = new LLMService();