import React, { useState } from 'react';
import { 
  Download, 
  Image, 
  FileText, 
  Code, 
  Printer,
  Settings,
  CheckCircle
} from 'lucide-react';
import { ExportUtils } from '../utils/exportUtils';

interface ExportPanelProps {
  mindMapHook: any;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ mindMapHook }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'png' as 'png' | 'svg' | 'json' | 'text',
    quality: 1.0,
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { mindMapData } = mindMapHook;

  const handleExport = async () => {
    if (!mindMapData) return;

    setIsExporting(true);
    setExportStatus('idle');

    try {
      const filename = `mindmap_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_')}`;
      
      switch (exportOptions.format) {
        case 'png':
          const svgElement = document.querySelector('svg');
          if (svgElement) {
            const dataUrl = await ExportUtils.exportToPNG(svgElement, exportOptions);
            await ExportUtils.downloadImage(dataUrl, `${filename}.png`);
          }
          break;
        
        case 'svg':
          const svgEl = document.querySelector('svg');
          if (svgEl) {
            const svgData = ExportUtils.exportToSVG(svgEl);
            const link = document.createElement('a');
            link.href = svgData;
            link.download = `${filename}.svg`;
            link.click();
          }
          break;
        
        case 'json':
          const jsonData = ExportUtils.exportToJSON(mindMapData);
          ExportUtils.downloadFile(jsonData, `${filename}.json`, 'application/json');
          break;
        
        case 'text':
          const textData = ExportUtils.exportToText(mindMapData);
          ExportUtils.downloadFile(textData, `${filename}.txt`, 'text/plain');
          break;
      }

      setExportStatus('success');
    } catch (error) {
      console.error('导出失败:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus('idle'), 2000);
    }
  };

  const formatOptions = [
    {
      id: 'png',
      label: 'PNG 图片',
      description: '高质量位图格式，适合分享和打印',
      icon: Image,
    },
    {
      id: 'svg',
      label: 'SVG 矢量图',
      description: '可缩放矢量格式，支持无损缩放',
      icon: Code,
    },
    {
      id: 'json',
      label: 'JSON 数据',
      description: '结构化数据格式，可重新导入',
      icon: FileText,
    },
    {
      id: 'text',
      label: '文本格式',
      description: '纯文本大纲格式，便于编辑',
      icon: Printer,
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* 头部 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          导出思维导图
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          将您的思维导图导出为不同格式
        </p>
      </div>

      {!mindMapData ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            请先生成思维导图后再导出
          </p>
        </div>
      ) : (
        <>
          {/* 格式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              导出格式
            </label>
            <div className="space-y-2">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.id as any }))}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      exportOptions.format === format.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {format.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 图片导出选项 */}
          {(exportOptions.format === 'png' || exportOptions.format === 'svg') && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Settings className="h-4 w-4" />
                <span>图片设置</span>
              </div>

              {/* 尺寸设置 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    宽度 (px)
                  </label>
                  <input
                    type="number"
                    value={exportOptions.width}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      width: parseInt(e.target.value) || 1920 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    高度 (px)
                  </label>
                  <input
                    type="number"
                    value={exportOptions.height}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      height: parseInt(e.target.value) || 1080 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* PNG 质量设置 */}
              {exportOptions.format === 'png' && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    图片质量: {Math.round(exportOptions.quality * 100)}%
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

              {/* 背景色设置 */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  背景色
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={exportOptions.backgroundColor}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      backgroundColor: e.target.value 
                    }))}
                    className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={exportOptions.backgroundColor}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      backgroundColor: e.target.value 
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 导出按钮 */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>
              {isExporting ? '导出中...' : `导出为 ${exportOptions.format.toUpperCase()}`}
            </span>
            {isExporting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>

          {/* 导出状态 */}
          {exportStatus === 'success' && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-400">
                导出成功！
              </span>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="text-sm text-red-700 dark:text-red-400">
                导出失败，请重试
              </span>
            </div>
          )}

          {/* 使用提示 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              导出提示
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p>• PNG: 适合在社交媒体或文档中使用</p>
              <p>• SVG: 矢量格式，可在设计软件中编辑</p>
              <p>• JSON: 保存完整数据，可重新导入</p>
              <p>• 文本: 大纲格式，可在任何编辑器中打开</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportPanel;