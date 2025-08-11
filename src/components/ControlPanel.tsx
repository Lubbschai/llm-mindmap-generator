import React, { useState } from 'react';
import { Download, Search, Layout, X } from 'lucide-react';
import type { MindMapData, MindMapLayout, ExportOptions } from '../types/mindmap';
import { ExportUtils } from '../utils/exportUtils';

interface ControlPanelProps {
  data: MindMapData | null;
  layout: MindMapLayout;
  onLayoutChange: (layout: Partial<MindMapLayout>) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  searchResults: string[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  data,
  layout,
  onLayoutChange,
  onSearch,
  onClearSearch,
  searchResults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 1.0,
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      onSearch(query);
    } else {
      onClearSearch();
    }
  };

  const handleExport = async () => {
    if (!data) return;

    const svg = document.querySelector('.mind-map-viewer svg') as SVGElement;
    if (!svg) return;

    try {
      const validatedOptions = ExportUtils.validateExportOptions(exportOptions);
      const filename = ExportUtils.generateFilename(data.title, exportOptions.format);

      switch (exportOptions.format) {
        case 'png':
          const pngDataUrl = await ExportUtils.exportToPNG(svg, validatedOptions);
          ExportUtils.downloadDataUrl(pngDataUrl, filename);
          break;
        
        case 'svg':
          const svgDataUrl = ExportUtils.exportToSVG(svg);
          ExportUtils.downloadDataUrl(svgDataUrl, filename);
          break;
        
        case 'json':
          const jsonContent = ExportUtils.exportToJSON(data);
          ExportUtils.downloadFile(jsonContent, filename, 'application/json');
          break;
      }
      
      setShowExportOptions(false);
    } catch (error) {
      console.error('Export failed:', error);
      // In a real app, show error notification
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">控制面板</h2>

      {/* Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Search size={16} className="inline mr-1" />
          搜索节点
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="输入关键词搜索..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onClearSearch();
              }}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {searchResults.length > 0 && (
          <p className="text-sm text-green-600">
            找到 {searchResults.length} 个匹配节点
          </p>
        )}
      </div>

      {/* Layout Controls */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Layout size={16} className="inline mr-1" />
          布局设置
        </label>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">布局类型</label>
            <select
              value={layout.type}
              onChange={(e) => onLayoutChange({ type: e.target.value as 'radial' | 'tree' | 'network' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="radial">放射状</option>
              <option value="tree">树状</option>
              <option value="network">网络状</option>
            </select>
          </div>

          {layout.type === 'tree' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">方向</label>
              <select
                value={layout.orientation || 'horizontal'}
                onChange={(e) => onLayoutChange({ orientation: e.target.value as 'horizontal' | 'vertical' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="horizontal">水平</option>
                <option value="vertical">垂直</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              节点间距 ({layout.spacing.node})
            </label>
            <input
              type="range"
              min="50"
              max="200"
              value={layout.spacing.node}
              onChange={(e) => onLayoutChange({ 
                spacing: { ...layout.spacing, node: parseInt(e.target.value) }
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              层级间距 ({layout.spacing.level})
            </label>
            <input
              type="range"
              min="100"
              max="300"
              value={layout.spacing.level}
              onChange={(e) => onLayoutChange({ 
                spacing: { ...layout.spacing, level: parseInt(e.target.value) }
              })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="space-y-2">
        <button
          onClick={() => setShowExportOptions(!showExportOptions)}
          disabled={!data}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors"
        >
          <Download size={20} />
          <span>导出思维导图</span>
        </button>

        {showExportOptions && data && (
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div>
              <label className="block text-xs text-gray-600 mb-1">格式</label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  format: e.target.value as 'png' | 'svg' | 'json' 
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="png">PNG 图片</option>
                <option value="svg">SVG 矢量图</option>
                <option value="json">JSON 数据</option>
              </select>
            </div>

            {exportOptions.format !== 'json' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">宽度</label>
                    <input
                      type="number"
                      min="400"
                      max="4000"
                      value={exportOptions.width}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        width: parseInt(e.target.value) 
                      }))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">高度</label>
                    <input
                      type="number"
                      min="300"
                      max="4000"
                      value={exportOptions.height}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        height: parseInt(e.target.value) 
                      }))}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {exportOptions.format === 'png' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      质量 ({exportOptions.quality})
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={exportOptions.quality}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        quality: parseFloat(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                )}
              </>
            )}

            <button
              onClick={handleExport}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              确认导出
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      {data && (
        <div className="border-t pt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">统计信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">节点数量：</span>
              <span>{data.nodes.length}</span>
            </div>
            <div>
              <span className="font-medium">最大层级：</span>
              <span>{Math.max(...data.nodes.map(n => n.level))}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            创建时间：{data.createdAt.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};