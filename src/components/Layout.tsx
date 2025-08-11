import React, { useState } from 'react';
import { useMindMap } from '../hooks/useMindMap';
import { useApi } from '../hooks/useApi';
import { useSettings } from '../hooks/useLocalStorage';
import InputPanel from './InputPanel';
import ApiConfig from './ApiConfig';
import MindMapViewer from './MindMapViewer';
import ExportPanel from './ExportPanel';
import { 
  Brain, 
  Settings, 
  Download, 
  Moon, 
  Sun, 
  Menu,
  X,
  Eye,
  Zap
} from 'lucide-react';

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'config' | 'export'>('input');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const mindMapHook = useMindMap();
  const apiHook = useApi();
  const { updateSetting } = useSettings();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    updateSetting('darkMode', !isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const enableDemoMode = () => {
    updateSetting('demoMode', true);
    // 使用示例内容
    const demoContent = `# 人工智能发展概述

## 发展历程
- 1950年代：人工智能概念提出
- 1960年代：专家系统兴起
- 1980年代：机器学习发展
- 2010年代：深度学习突破
- 2020年代：大语言模型革命

## 核心技术
### 机器学习
- 监督学习
- 无监督学习  
- 强化学习

### 深度学习
- 神经网络
- 卷积神经网络
- 循环神经网络
- Transformer架构

### 自然语言处理
- 文本分析
- 语言生成
- 机器翻译
- 情感分析

## 应用领域
### 商业应用
- 智能客服
- 数据分析
- 自动化流程
- 个性化推荐

### 科研领域
- 药物发现
- 天气预测
- 材料科学
- 生物信息学

### 日常生活
- 智能助手
- 图像识别
- 语音识别
- 智能家居

## 未来发展
- 通用人工智能(AGI)
- 量子计算结合
- 边缘计算优化
- 伦理与安全规范`;

    mindMapHook.generateMindMap(demoContent);
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-1 flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* 侧边栏 */}
        <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
          {/* 侧边栏头部 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-600" />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  思维导图生成器
                </h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* 标签页切换 */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: 'input', label: '输入', icon: Menu },
                { id: 'config', label: '配置', icon: Settings },
                { id: 'export', label: '导出', icon: Download },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 侧边栏内容 */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'input' && (
              <InputPanel 
                mindMapHook={mindMapHook} 
                apiHook={apiHook}
                onEnableDemoMode={enableDemoMode}
              />
            )}
            {activeTab === 'config' && <ApiConfig apiHook={apiHook} />}
            {activeTab === 'export' && <ExportPanel mindMapHook={mindMapHook} />}
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部工具栏 */}
          <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              {!isSidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              
              {/* 快捷操作 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={enableDemoMode}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  <Zap className="h-4 w-4" />
                  <span>Demo模式</span>
                </button>
                
                <button
                  onClick={togglePreviewMode}
                  className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isPreviewMode
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>全屏预览</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* 状态指示器 */}
              {mindMapHook.isLoading && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">生成中...</span>
                </div>
              )}
              
              {mindMapHook.error && (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {mindMapHook.error}
                </div>
              )}

              {/* 主题切换 */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* 思维导图显示区域 */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900">
            <MindMapViewer 
              mindMapHook={mindMapHook}
              isPreviewMode={isPreviewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;