import { useState, useCallback } from 'react';
import type { MindMapData, MindMapLayout, MindMapTheme } from '../types/mindmap';
import { MindMapService } from '../services/mindmapService';
import { ParseService } from '../services/parseService';

interface UseMindMapState {
  data: MindMapData | null;
  layout: MindMapLayout;
  theme: MindMapTheme;
  isGenerating: boolean;
  error: string | null;
  selectedNodes: string[];
  searchResults: string[];
}

const defaultLayout: MindMapLayout = {
  type: 'radial',
  spacing: {
    node: 100,
    level: 150,
  },
};

const defaultTheme: MindMapTheme = {
  name: 'default',
  colors: {
    background: '#ffffff',
    node: ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'],
    text: '#374151',
    link: '#6B7280',
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    sizes: [16, 14, 12, 10],
  },
};

export const useMindMap = () => {
  const [state, setState] = useState<UseMindMapState>({
    data: null,
    layout: defaultLayout,
    theme: defaultTheme,
    isGenerating: false,
    error: null,
    selectedNodes: [],
    searchResults: [],
  });

  const generateFromText = useCallback(async (text: string) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
    }));

    try {
      // Parse the content
      const parsedContent = ParseService.parseContent(text);
      
      // Generate mindmap data
      const mindmapData = MindMapService.generateFromParsedContent(parsedContent);
      
      // Apply layout
      const layoutData = MindMapService.calculateLayout(mindmapData, state.layout);

      setState(prev => ({
        ...prev,
        data: layoutData,
        isGenerating: false,
      }));

      return layoutData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate mindmap';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isGenerating: false,
      }));
      throw error;
    }
  }, [state.layout]);

  const updateLayout = useCallback((newLayout: Partial<MindMapLayout>) => {
    const updatedLayout = { ...state.layout, ...newLayout };
    setState(prev => ({
      ...prev,
      layout: updatedLayout,
    }));

    // Recalculate layout if data exists
    if (state.data) {
      const layoutData = MindMapService.calculateLayout(state.data, updatedLayout);
      setState(prev => ({
        ...prev,
        data: layoutData,
      }));
    }
  }, [state.layout, state.data]);

  const updateTheme = useCallback((newTheme: Partial<MindMapTheme>) => {
    setState(prev => ({
      ...prev,
      theme: { ...prev.theme, ...newTheme },
    }));
  }, []);

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    if (!state.data) return;

    const updatedData = MindMapService.toggleNodeCollapse(state.data, nodeId);
    setState(prev => ({
      ...prev,
      data: updatedData,
    }));
  }, [state.data]);

  const selectNode = useCallback((nodeId: string, multiSelect = false) => {
    setState(prev => ({
      ...prev,
      selectedNodes: multiSelect 
        ? prev.selectedNodes.includes(nodeId)
          ? prev.selectedNodes.filter(id => id !== nodeId)
          : [...prev.selectedNodes, nodeId]
        : [nodeId],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedNodes: [],
    }));
  }, []);

  const searchNodes = useCallback((query: string) => {
    if (!state.data || !query.trim()) {
      setState(prev => ({
        ...prev,
        searchResults: [],
      }));
      return;
    }

    const results = MindMapService.searchNodes(state.data, query);
    setState(prev => ({
      ...prev,
      searchResults: results,
    }));
  }, [state.data]);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchResults: [],
    }));
  }, []);

  const setData = useCallback((data: MindMapData) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      layout: defaultLayout,
      theme: defaultTheme,
      isGenerating: false,
      error: null,
      selectedNodes: [],
      searchResults: [],
    });
  }, []);

  return {
    ...state,
    generateFromText,
    updateLayout,
    updateTheme,
    toggleNodeCollapse,
    selectNode,
    clearSelection,
    searchNodes,
    clearSearch,
    setData,
    clearError,
    reset,
  };
};