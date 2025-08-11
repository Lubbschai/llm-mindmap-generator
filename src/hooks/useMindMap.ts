import { useState, useCallback } from 'react';
import type { MindMapData, MindMapNode, MindMapConfig, LayoutType } from '../types/mindmap';
import type { ParsedContent } from '../types/common';
import { mindMapService } from '../services/mindmapService';
import { parseService } from '../services/parseService';
import { defaultTheme, getThemeById } from '../utils/themeUtils';
import { useLocalStorage, useHistory } from './useLocalStorage';

export function useMindMap() {
  const [inputText, setInputText] = useState('');
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MindMapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // 配置管理
  const [config, setConfig] = useLocalStorage<MindMapConfig>('mindmap-config', {
    layout: 'tree',
    theme: defaultTheme,
    width: 800,
    height: 600,
    enableZoom: true,
    enablePan: true,
    enableCollapse: true,
  });

  // 历史记录
  const {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  } = useHistory<{
    text: string;
    timestamp: number;
    title: string;
  }>('mindmap-history');

  // 解析文本并生成思维导图
  const generateMindMap = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError('请输入内容');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 预处理文本
      const preprocessed = parseService.preprocess(text);
      
      // 解析内容
      const parsed = parseService.parse(preprocessed);
      setParsedContent(parsed);

      // 转换为思维导图数据
      const mindMapData = mindMapService.convertToMindMap(parsed);
      setMindMapData(mindMapData);

      // 添加到历史记录
      const title = mindMapData.root.title || '未命名思维导图';
      addToHistory({
        text: preprocessed,
        timestamp: Date.now(),
        title,
      });

      setInputText(preprocessed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成思维导图失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [addToHistory]);

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<MindMapConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, [setConfig]);

  // 切换布局
  const changeLayout = useCallback((layout: LayoutType) => {
    updateConfig({ layout });
  }, [updateConfig]);

  // 切换主题
  const changeTheme = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    updateConfig({ theme });
  }, [updateConfig]);

  // 搜索节点
  const searchNodes = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!mindMapData || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = mindMapService.searchNodes(mindMapData.root, query);
    setSearchResults(results);
  }, [mindMapData]);

  // 选择节点
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNode(nodeId);
  }, []);

  // 切换节点折叠状态
  const toggleNodeCollapse = useCallback((nodeId: string) => {
    if (!mindMapData) return;

    const updatedRoot = mindMapService.toggleNodeCollapse(mindMapData.root, nodeId);
    setMindMapData(prev => prev ? { ...prev, root: updatedRoot } : null);
  }, [mindMapData]);

  // 获取节点路径
  const getNodePath = useCallback((nodeId: string): MindMapNode[] | null => {
    if (!mindMapData) return null;
    return mindMapService.getNodePath(mindMapData.root, nodeId);
  }, [mindMapData]);

  // 重置状态
  const reset = useCallback(() => {
    setInputText('');
    setParsedContent(null);
    setMindMapData(null);
    setError(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedNode(null);
  }, []);

  // 从历史记录加载
  const loadFromHistory = useCallback((index: number) => {
    const item = history[index];
    if (item) {
      generateMindMap(item.text);
    }
  }, [history, generateMindMap]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 获取统计信息
  const getStats = useCallback(() => {
    if (!mindMapData || !parsedContent) {
      return null;
    }

    return {
      totalNodes: mindMapData.totalNodes,
      maxDepth: mindMapData.maxDepth,
      totalSections: parsedContent.metadata.totalSections,
      hasCode: parsedContent.metadata.hasCode,
      hasList: parsedContent.metadata.hasList,
    };
  }, [mindMapData, parsedContent]);

  return {
    // 状态
    inputText,
    parsedContent,
    mindMapData,
    isLoading,
    error,
    searchQuery,
    searchResults,
    selectedNode,
    config,
    history,

    // 操作
    setInputText,
    generateMindMap,
    updateConfig,
    changeLayout,
    changeTheme,
    searchNodes,
    selectNode,
    toggleNodeCollapse,
    getNodePath,
    reset,
    loadFromHistory,
    removeFromHistory,
    clearHistory,
    clearError,
    getStats,
  };
}