import React, { useState } from 'react';
import { Send, Settings, Key } from 'lucide-react';
import { LLM_PROVIDERS } from '../services/llmService';
import type { LLMConfig } from '../types/llm';

interface InputPanelProps {
  onSubmit: (prompt: string, config: LLMConfig) => void;
  isLoading: boolean;
  error?: string | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onSubmit, isLoading, error }) => {
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<LLMConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && config.apiKey) {
      onSubmit(prompt, config);
    }
  };

  const selectedProvider = LLM_PROVIDERS.find(p => p.id === config.provider);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">输入问题</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
        >
          <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <h3 className="font-medium text-gray-700">API 配置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LLM 提供商
              </label>
              <select
                value={config.provider}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  provider: e.target.value,
                  model: e.target.value === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-sonnet-20240229'
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LLM_PROVIDERS.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                模型
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {config.provider === 'openai' ? (
                  <>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </>
                ) : (
                  <>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Key size={16} className="inline mr-1" />
              API 密钥
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder={`输入 ${selectedProvider?.name} API 密钥`}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                温度 ({config.temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大令牌数
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                value={config.maxTokens}
                onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            请输入您的问题或需要分析的内容
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：请解释机器学习的基本概念和应用领域..."
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !prompt.trim() || !config.apiKey}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send size={20} />
              <span>生成思维导图</span>
            </>
          )}
        </button>
      </form>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• 支持中英文内容解析</p>
        <p>• 自动识别文本结构和层级关系</p>
        <p>• 生成交互式思维导图</p>
      </div>
    </div>
  );
};