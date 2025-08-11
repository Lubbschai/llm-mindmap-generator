import React from 'react';
import { Copy, Loader } from 'lucide-react';
import type { LLMResponse } from '../types/llm';

interface ResponseDisplayProps {
  response: LLMResponse | null;
  streamContent: string;
  isLoading: boolean;
  isStreaming: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  streamContent,
  isLoading,
  isStreaming,
}) => {
  const displayContent = isStreaming ? streamContent : response?.content || '';

  const handleCopy = async () => {
    if (displayContent) {
      try {
        await navigator.clipboard.writeText(displayContent);
        // In a real app, you might want to show a toast notification here
      } catch (error) {
        console.error('Failed to copy content:', error);
      }
    }
  };

  if (!isLoading && !isStreaming && !response) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">LLM 回答</h2>
        {displayContent && (
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            title="复制内容"
          >
            <Copy size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {(isLoading || isStreaming) && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader className="animate-spin" size={20} />
            <span>{isLoading ? '正在获取回答...' : '正在生成内容...'}</span>
          </div>
        )}

        {displayContent && (
          <div className="relative">
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {displayContent}
                {isStreaming && (
                  <span className="animate-pulse bg-gray-400 w-2 h-5 inline-block ml-1 align-middle"></span>
                )}
              </div>
            </div>
          </div>
        )}

        {response?.usage && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">使用统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">输入令牌：</span>
                <span>{response.usage.promptTokens}</span>
              </div>
              <div>
                <span className="font-medium">输出令牌：</span>
                <span>{response.usage.completionTokens}</span>
              </div>
              <div>
                <span className="font-medium">总令牌：</span>
                <span>{response.usage.totalTokens}</span>
              </div>
            </div>
            {response.model && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">模型：</span>
                <span>{response.model}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};