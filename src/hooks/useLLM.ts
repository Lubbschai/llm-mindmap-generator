import { useState, useCallback } from 'react';
import { LLMService } from '../services/llmService';
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types/llm';

interface UseLLMState {
  isLoading: boolean;
  response: LLMResponse | null;
  error: string | null;
  streamContent: string;
  isStreaming: boolean;
}

export const useLLM = () => {
  const [state, setState] = useState<UseLLMState>({
    isLoading: false,
    response: null,
    error: null,
    streamContent: '',
    isStreaming: false,
  });

  const llmService = new LLMService();

  const generateResponse = useCallback(async (request: LLMRequest) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      response: null,
    }));

    try {
      const response = await llmService.generateResponse(request);
      setState(prev => ({
        ...prev,
        isLoading: false,
        response,
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const generateStreamResponse = useCallback(async (request: LLMRequest) => {
    setState(prev => ({
      ...prev,
      isStreaming: true,
      error: null,
      streamContent: '',
    }));

    try {
      await llmService.generateStreamResponse(request, (chunk: LLMStreamChunk) => {
        setState(prev => ({
          ...prev,
          streamContent: chunk.content,
          isStreaming: !chunk.finished,
        }));

        if (chunk.finished) {
          setState(prev => ({
            ...prev,
            response: {
              content: chunk.content,
            },
          }));
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      response: null,
      error: null,
      streamContent: '',
      isStreaming: false,
    });
  }, []);

  return {
    ...state,
    generateResponse,
    generateStreamResponse,
    clearError,
    reset,
  };
};