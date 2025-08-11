import React, { useState } from 'react';
import { 
  FileText, 
  Wand2, 
  History, 
  RefreshCw, 
  Search,
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface InputPanelProps {
  mindMapHook: any;
  apiHook: any;
  onEnableDemoMode: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ 
  mindMapHook, 
  apiHook,
  onEnableDemoMode 
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    inputText,
    setInputText,
    generateMindMap,
    isLoading,
    error,
    history,
    loadFromHistory,
    removeFromHistory,
    clearHistory,
    reset
  } = mindMapHook;

  const { isConfigured, optimizeContent } = apiHook;

  const handleInputChange = (value: string) => {
    setInputText(value);
  };

  const handleGenerate = () => {
    if (inputText.trim()) {
      generateMindMap(inputText);
    }
  };

  const handleOptimize = async () => {
    if (!inputText.trim()) return;
    
    setIsOptimizing(true);
    try {
      const optimized = await optimizeContent(inputText);
      if (optimized) {
        setInputText(optimized);
      }
    } catch (err) {
      console.error('优化失败:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClear = () => {
    reset();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = history.filter((item: any) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* 输入区域 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输入内容
            </label>
            <textarea
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="请粘贴LLM回答内容，或输入任何需要转换为思维导图的文本..."
              className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isLoading}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>生成导图</span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1"></div>
              )}
            </button>

            {isConfigured && (
              <button
                onClick={handleOptimize}
                disabled={!inputText.trim() || isOptimizing}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Wand2 className="h-4 w-4" />
                <span>AI优化</span>
                {isOptimizing && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1"></div>
                )}
              </button>
            )}

            <button
              onClick={handleClear}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>清空</span>
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Demo 提示 */}
          {!inputText && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                💡 首次使用？试试 Demo 模式快速体验！
              </p>
              <button
                onClick={onEnableDemoMode}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                启用 Demo 模式
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 历史记录 */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <History className="h-4 w-4 mr-1" />
              历史记录 ({history.length})
            </h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                清空
              </button>
            )}
          </div>

          {history.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索历史记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {history.length === 0 ? '暂无历史记录' : '未找到匹配的记录'}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredHistory.map((item: any, index: number) => (
                <div
                  key={index}
                  className="group p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => loadFromHistory(history.indexOf(item))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.text.slice(0, 100)}...
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(history.indexOf(item));
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;