import { useState } from 'react';
import { Brain, Settings } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { ResponseDisplay } from './components/ResponseDisplay';
import { MindMapViewer } from './components/MindMapViewer';
import { ControlPanel } from './components/ControlPanel';
import { SettingsModal } from './components/SettingsModal';
import { useLLM } from './hooks/useLLM';
import { useMindMap } from './hooks/useMindMap';
import type { LLMConfig } from './types/llm';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    isLoading,
    response,
    error,
    streamContent,
    isStreaming,
    generateStreamResponse,
    clearError,
  } = useLLM();

  const {
    data: mindMapData,
    layout,
    theme,
    isGenerating,
    selectedNodes,
    searchResults,
    generateFromText,
    updateLayout,
    updateTheme,
    toggleNodeCollapse,
    selectNode,
    searchNodes,
    clearSearch,
  } = useMindMap();

  const handleSubmit = async (prompt: string, config: LLMConfig) => {
    clearError();
    
    try {
      // In demo mode, skip API call and generate mindmap directly from prompt
      if (config.apiKey === 'demo-mode' || config.apiKey === 'test-api-key-123') {
        // Generate mindmap directly from the input text
        await generateFromText(prompt);
        return;
      }

      // Generate LLM response
      await generateStreamResponse({
        provider: config.provider,
        apiKey: config.apiKey,
        prompt,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      // Generate mindmap from the response
      const content = streamContent || response?.content;
      if (content) {
        await generateFromText(content);
      }
    } catch (error) {
      console.error('Failed to generate response or mindmap:', error);
    }
  };

  const handleNodeClick = (nodeId: string, multiSelect = false) => {
    selectNode(nodeId, multiSelect);
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    toggleNodeCollapse(nodeId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="text-indigo-600" size={32} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  LLM 思维导图生成器
                </h1>
                <p className="text-sm text-gray-500">
                  将大语言模型回答转换为交互式思维导图
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <InputPanel
              onSubmit={handleSubmit}
              isLoading={isLoading || isStreaming || isGenerating}
              error={error}
            />

            <ControlPanel
              data={mindMapData}
              layout={layout}
              onLayoutChange={updateLayout}
              onSearch={searchNodes}
              onClearSearch={clearSearch}
              searchResults={searchResults}
            />
          </div>

          {/* Right Column - Response and Mindmap */}
          <div className="lg:col-span-2 space-y-6">
            <ResponseDisplay
              response={response}
              streamContent={streamContent}
              isLoading={isLoading}
              isStreaming={isStreaming}
            />

            <div className="mind-map-viewer">
              <MindMapViewer
                data={mindMapData}
                theme={theme}
                selectedNodes={selectedNodes}
                searchResults={searchResults}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        onThemeChange={updateTheme}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>支持 OpenAI 和 Anthropic Claude API</p>
            <p className="mt-1">
              🚀 实时解析 • 🎨 多种主题 • 📤 导出功能 • 🔍 搜索高亮
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
