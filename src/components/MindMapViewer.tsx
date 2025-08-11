import React, { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import * as d3 from 'd3';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Search,
  TreePine,
  Share2,
  Target
} from 'lucide-react';

interface MindMapViewerProps {
  mindMapHook: any;
  isPreviewMode?: boolean;
}

const MindMapViewer: React.FC<MindMapViewerProps> = ({ 
  mindMapHook, 
  isPreviewMode = false 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    mindMapData,
    isLoading,
    config,
    changeLayout,
    searchNodes,
    getStats
  } = mindMapHook;

  // 初始化或更新思维导图
  useEffect(() => {
    if (!mindMapData || !svgRef.current) return;

    try {
      // 转换数据为 markmap 格式
      const markdown = convertToMarkdown(mindMapData.root);
      
      // 创建 transformer
      const transformer = new Transformer();
      const { root } = transformer.transform(markdown);

      // 初始化或更新 markmap
      if (!markmapRef.current) {
        markmapRef.current = Markmap.create(svgRef.current, {
          zoom: true,
          pan: true,
          duration: 500,
          maxWidth: 300,
          initialExpandLevel: 2,
        });
      }

      // 设置数据并渲染
      markmapRef.current.setData(root);
      markmapRef.current.fit();

    } catch (error) {
      console.error('渲染思维导图失败:', error);
    }
  }, [mindMapData]);

  // 应用主题
  useEffect(() => {
    if (markmapRef.current && config.theme) {
      const svg = d3.select(svgRef.current);
      svg.style('background-color', config.theme.colors.background);
      svg.style('color', config.theme.colors.text);
    }
  }, [config.theme]);

  // 转换数据为 Markdown 格式
  const convertToMarkdown = (node: any, level: number = 1): string => {
    const prefix = '#'.repeat(level);
    let markdown = `${prefix} ${node.title}\n\n`;
    
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        markdown += convertToMarkdown(child, level + 1);
      }
    }
    
    return markdown;
  };

  // 缩放控制
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!markmapRef.current) return;

    const mm = markmapRef.current;
    
    switch (direction) {
      case 'in':
        mm.rescale(1.2);
        setZoomLevel(prev => Math.min(prev * 1.2, 300));
        break;
      case 'out':
        mm.rescale(0.8);
        setZoomLevel(prev => Math.max(prev * 0.8, 30));
        break;
      case 'reset':
        mm.fit();
        setZoomLevel(100);
        break;
    }
  };

  // 搜索功能
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() && mindMapData) {
      const results = searchNodes(term);
      // 这里可以高亮搜索结果
      console.log('搜索结果:', results);
    }
  };

  // 获取统计信息
  const stats = getStats();

  return (
    <div className={`flex flex-col h-full ${isPreviewMode ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* 工具栏 */}
      {!isPreviewMode && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索节点..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 w-48 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* 布局切换 */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[
                  { id: 'tree', label: '树状', icon: TreePine },
                  { id: 'radial', label: '放射', icon: Target },
                  { id: 'network', label: '网络', icon: Share2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => changeLayout(id as any)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                      config.layout === id
                        ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* 缩放控制 */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => handleZoom('out')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="缩小"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-gray-600 dark:text-gray-300 min-w-[3rem] text-center">
                  {Math.round(zoomLevel)}%
                </span>
                <button
                  onClick={() => handleZoom('in')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="放大"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="适应窗口"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* 全屏切换 */}
              <button
                onClick={() => {}}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="全屏"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 统计信息 */}
          {stats && (
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span>节点数量: {stats.totalNodes}</span>
              <span>最大深度: {stats.maxDepth}</span>
              {stats.hasCode && <span>包含代码块</span>}
              {stats.hasList && <span>包含列表</span>}
            </div>
          )}
        </div>
      )}

      {/* 思维导图显示区域 */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">正在生成思维导图...</p>
            </div>
          </div>
        ) : !mindMapData ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TreePine className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                开始创建思维导图
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                在左侧输入框中粘贴内容，然后点击"生成导图"按钮开始创建您的思维导图
              </p>
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ backgroundColor: config.theme.colors.background }}
          />
        )}
      </div>
    </div>
  );
};

export default MindMapViewer;