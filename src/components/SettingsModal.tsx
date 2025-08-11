import React, { useState } from 'react';
import { X, Palette, Type, Save } from 'lucide-react';
import type { MindMapTheme } from '../types/mindmap';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: MindMapTheme;
  onThemeChange: (theme: Partial<MindMapTheme>) => void;
}

const predefinedThemes: MindMapTheme[] = [
  {
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
  },
  {
    name: 'dark',
    colors: {
      background: '#1F2937',
      node: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
      text: '#F9FAFB',
      link: '#9CA3AF',
    },
    fonts: {
      family: 'Inter, system-ui, sans-serif',
      sizes: [16, 14, 12, 10],
    },
  },
  {
    name: 'nature',
    colors: {
      background: '#F0FDF4',
      node: ['#16A34A', '#65A30D', '#CA8A04', '#DC2626', '#9333EA', '#C2410C', '#0891B2', '#7C3AED'],
      text: '#14532D',
      link: '#22C55E',
    },
    fonts: {
      family: 'Inter, system-ui, sans-serif',
      sizes: [16, 14, 12, 10],
    },
  },
  {
    name: 'ocean',
    colors: {
      background: '#F0F9FF',
      node: ['#0EA5E9', '#0891B2', '#0D9488', '#059669', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7'],
      text: '#0C4A6E',
      link: '#0284C7',
    },
    fonts: {
      family: 'Inter, system-ui, sans-serif',
      sizes: [16, 14, 12, 10],
    },
  },
];

const fontFamilies = [
  'Inter, system-ui, sans-serif',
  'Roboto, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Microsoft YaHei, sans-serif',
  'SimHei, sans-serif',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
}) => {
  const [localTheme, setLocalTheme] = useState<MindMapTheme>(theme);

  if (!isOpen) return null;

  const handleSave = () => {
    onThemeChange(localTheme);
    onClose();
  };

  const handlePredefinedTheme = (predefinedTheme: MindMapTheme) => {
    setLocalTheme(predefinedTheme);
  };

  const handleColorChange = (type: 'background' | 'text' | 'link', value: string) => {
    setLocalTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [type]: value,
      },
    }));
  };

  const handleNodeColorChange = (index: number, value: string) => {
    setLocalTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        node: prev.colors.node.map((color, i) => i === index ? value : color),
      },
    }));
  };

  const handleFontChange = (family: string) => {
    setLocalTheme(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        family,
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">主题设置</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Predefined Themes */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">预设主题</h3>
            <div className="grid grid-cols-2 gap-3">
              {predefinedThemes.map((predefinedTheme) => (
                <button
                  key={predefinedTheme.name}
                  onClick={() => handlePredefinedTheme(predefinedTheme)}
                  className={`p-4 border rounded-lg hover:shadow-md transition-all ${
                    localTheme.name === predefinedTheme.name 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium capitalize mb-2">{predefinedTheme.name}</div>
                    <div className="flex space-x-1 mb-2">
                      {predefinedTheme.colors.node.slice(0, 6).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div 
                      className="w-full h-6 rounded"
                      style={{ backgroundColor: predefinedTheme.colors.background }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              <Palette size={20} className="inline mr-2" />
              颜色设置
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    背景颜色
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={localTheme.colors.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={localTheme.colors.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文字颜色
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={localTheme.colors.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={localTheme.colors.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    连线颜色
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={localTheme.colors.link}
                      onChange={(e) => handleColorChange('link', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={localTheme.colors.link}
                      onChange={(e) => handleColorChange('link', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  节点颜色
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {localTheme.colors.node.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleNodeColorChange(index, e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300"
                      />
                      <span className="text-xs text-gray-600">Level {index}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Font Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              <Type size={20} className="inline mr-2" />
              字体设置
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                字体族
              </label>
              <select
                value={localTheme.fonts.family}
                onChange={(e) => handleFontChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">预览</h3>
            <div 
              className="border rounded-lg p-4 min-h-[100px] flex items-center justify-center"
              style={{ 
                backgroundColor: localTheme.colors.background,
                fontFamily: localTheme.fonts.family,
              }}
            >
              <div className="text-center space-y-2">
                <div 
                  className="inline-block px-4 py-2 rounded-full"
                  style={{ 
                    backgroundColor: localTheme.colors.node[0],
                    color: localTheme.colors.text,
                  }}
                >
                  示例节点
                </div>
                <div 
                  className="text-sm"
                  style={{ color: localTheme.colors.text }}
                >
                  这是一个预览示例
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center space-x-2 transition-colors"
          >
            <Save size={20} />
            <span>保存设置</span>
          </button>
        </div>
      </div>
    </div>
  );
};