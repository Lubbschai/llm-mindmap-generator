import { useState, useCallback } from 'react';
import { llmService } from '../services/llmService';
import type { ApiConfig, LLMRequest, LLMResponse } from '../types/api';
import { useLocalStorage } from './useLocalStorage';

export function useApi() {
  const [config, setConfig] = useLocalStorage<ApiConfig | null>('api-config', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 设置API配置
  const updateConfig = useCallback((newConfig: ApiConfig) => {
    setConfig(newConfig);
    llmService.setConfig(newConfig);
    setError(null);
  }, [setConfig]);

  // 调用LLM API
  const callLLM = useCallback(async (request: LLMRequest): Promise<LLMResponse | null> => {
    if (!config) {
      setError('请先配置API密钥');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await llmService.processText(request);
      
      if (response.success && response.data) {
        return response.data as LLMResponse;
      } else {
        setError(response.error || '未知错误');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '网络错误';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // 测试API连接
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!config) {
      setError('请先配置API密钥');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await llmService.testConnection();
      
      if (response.success) {
        return true;
      } else {
        setError(response.error || '连接测试失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '连接测试失败';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // 优化文本内容
  const optimizeContent = useCallback(async (content: string): Promise<string | null> => {
    const prompt = llmService.generateOptimizationPrompt(content);
    const request: LLMRequest = {
      prompt,
      maxTokens: 2000,
      temperature: 0.3,
    };

    const response = await callLLM(request);
    return response?.content || null;
  }, [callLLM]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 获取支持的模型
  const getSupportedModels = useCallback((provider: 'openai' | 'claude') => {
    return llmService.getSupportedModels(provider);
  }, []);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    callLLM,
    testConnection,
    optimizeContent,
    clearError,
    getSupportedModels,
    isConfigured: !!config?.apiKey,
  };
}