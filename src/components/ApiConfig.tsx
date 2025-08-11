import React, { useState, useEffect } from 'react';
import { 
  Key, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Globe
} from 'lucide-react';

interface ApiConfigProps {
  apiHook: any;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ apiHook }) => {
  const [formData, setFormData] = useState({
    provider: 'openai' as 'openai' | 'claude',
    apiKey: '',
    baseUrl: '',
    model: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const { 
    config, 
    updateConfig, 
    testConnection, 
    getSupportedModels, 
    isConfigured,
    error 
  } = apiHook;

  // 初始化表单数据
  useEffect(() => {
    if (config) {
      setFormData({
        provider: config.provider,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl || '',
        model: config.model || '',
      });
    }
  }, [config]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProviderChange = (provider: 'openai' | 'claude') => {
    const supportedModels = getSupportedModels(provider);
    setFormData(prev => ({
      ...prev,
      provider,
      model: supportedModels[0] || '',
      baseUrl: provider === 'openai' ? 'https://api.openai.com/v1' : 'https://api.anthropic.com/v1',
    }));
  };

  const handleSave = () => {
    if (!formData.apiKey.trim()) {
      setTestMessage('请输入API密钥');
      return;
    }

    updateConfig(formData);
    setTestMessage('配置已保存');
    setTestStatus('success');
    
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 2000);
  };

  const handleTest = async () => {
    if (!formData.apiKey.trim()) {
      setTestMessage('请先输入API密钥');
      return;
    }

    setTestStatus('testing');
    setTestMessage('正在测试连接...');

    // 临时更新配置进行测试
    updateConfig(formData);
    
    const success = await testConnection();
    
    if (success) {
      setTestStatus('success');
      setTestMessage('连接测试成功！');
    } else {
      setTestStatus('error');
      setTestMessage(error || '连接测试失败');
    }

    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3000);
  };

  const supportedModels = getSupportedModels(formData.provider);

  return (
    <div className="p-4 space-y-6">
      {/* 头部 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          API 配置
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          配置您的 API 密钥以启用 AI 优化功能
        </p>
      </div>

      {/* 提供商选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          API 提供商
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'openai', name: 'OpenAI', desc: 'GPT-4, GPT-3.5' },
            { id: 'claude', name: 'Claude', desc: 'Claude-3, Claude-2' },
          ].map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderChange(provider.id as any)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                formData.provider === provider.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {provider.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {provider.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API 密钥 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          API 密钥
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={formData.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            placeholder={`请输入您的 ${formData.provider === 'openai' ? 'OpenAI' : 'Claude'} API 密钥`}
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          您的 API 密钥将安全存储在本地浏览器中
        </p>
      </div>

      {/* 基础URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Globe className="inline h-4 w-4 mr-1" />
          API 基础URL (可选)
        </label>
        <input
          type="text"
          value={formData.baseUrl}
          onChange={(e) => handleInputChange('baseUrl', e.target.value)}
          placeholder={formData.provider === 'openai' ? 'https://api.openai.com/v1' : 'https://api.anthropic.com/v1'}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          使用自定义API端点或代理服务器时填写
        </p>
      </div>

      {/* 模型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Settings className="inline h-4 w-4 mr-1" />
          模型选择
        </label>
        <select
          value={formData.model}
          onChange={(e) => handleInputChange('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">选择模型</option>
          {supportedModels.map((model: string) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          disabled={!formData.apiKey.trim()}
          className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Key className="h-4 w-4" />
          <span>保存配置</span>
        </button>

        <button
          onClick={handleTest}
          disabled={!formData.apiKey.trim() || testStatus === 'testing'}
          className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <TestTube className="h-4 w-4" />
          <span>测试连接</span>
          {testStatus === 'testing' && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1"></div>
          )}
        </button>
      </div>

      {/* 状态消息 */}
      {testMessage && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          testStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : testStatus === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          {testStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {testStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
          {testStatus === 'testing' && <AlertCircle className="h-4 w-4 text-blue-500" />}
          <span className={`text-sm ${
            testStatus === 'success' 
              ? 'text-green-700 dark:text-green-400'
              : testStatus === 'error'
              ? 'text-red-700 dark:text-red-400'
              : 'text-blue-700 dark:text-blue-400'
          }`}>
            {testMessage}
          </span>
        </div>
      )}

      {/* 配置状态 */}
      <div className={`p-3 rounded-lg border ${
        isConfigured
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
      }`}>
        <div className="flex items-center space-x-2">
          {isConfigured ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-gray-400" />
          )}
          <span className={`text-sm font-medium ${
            isConfigured
              ? 'text-green-700 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {isConfigured ? '✅ API 已配置' : '⚠️ API 未配置'}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {isConfigured 
            ? '您可以使用 AI 优化功能来改善文本结构'
            : '配置 API 密钥后可使用 AI 优化功能'}
        </p>
      </div>

      {/* 帮助信息 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          如何获取 API 密钥？
        </h4>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          {formData.provider === 'openai' ? (
            <>
              <p>1. 访问 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI API Keys</a></p>
              <p>2. 登录并创建新的 API 密钥</p>
              <p>3. 复制密钥并粘贴到上方输入框</p>
            </>
          ) : (
            <>
              <p>1. 访问 <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Claude Console</a></p>
              <p>2. 创建账户并获取 API 密钥</p>
              <p>3. 复制密钥并粘贴到上方输入框</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;