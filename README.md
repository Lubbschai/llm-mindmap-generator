# LLM 思维导图生成器

一个现代化的 Web 应用，能够将大语言模型（LLM）的回答内容转换为交互式思维导图。

## ✨ 功能特性

### 🎯 核心功能
- **智能文本解析**: 自动识别标题、子标题、列表等结构化内容
- **交互式思维导图**: 基于 Markmap 和 D3.js 的高质量思维导图渲染
- **多种布局模式**: 支持树状、放射状、网络状布局
- **实时预览**: 即时生成和更新思维导图
- **Demo 模式**: 无需配置即可体验完整功能

### 🎨 用户体验
- **响应式设计**: 完美适配桌面和移动设备
- **深色/浅色主题**: 护眼的主题切换功能
- **直观操作界面**: 清晰的标签页布局和工具栏
- **快捷键支持**: 高效的操作体验
- **全屏预览模式**: 沉浸式思维导图查看

### 🔧 高级功能
- **AI 内容优化**: 支持 OpenAI 和 Claude API 进行内容结构优化
- **多格式导出**: PNG、SVG、JSON、文本等多种导出格式
- **历史记录**: 自动保存和管理历史记录
- **搜索功能**: 快速查找思维导图节点
- **缩放控制**: 灵活的缩放和平移操作

### 🌐 API 集成
- **OpenAI**: 支持 GPT-4、GPT-3.5-turbo 等模型
- **Claude**: 支持 Claude-3、Claude-2 等模型
- **自定义端点**: 支持代理服务器和自定义 API 基础 URL
- **安全存储**: API 密钥安全存储在本地浏览器中

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **思维导图**: Markmap + D3.js
- **状态管理**: React Hooks
- **HTTP 客户端**: Axios
- **图标库**: Lucide React

## 📦 安装和使用

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/Lubbschai/llm-mindmap-generator.git
cd llm-mindmap-generator
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

## 📖 使用指南

### 快速开始

1. **Demo 模式**: 点击"Demo 模式"按钮快速体验
2. **输入内容**: 在左侧输入框粘贴或输入文本内容
3. **生成导图**: 点击"生成导图"按钮创建思维导图
4. **调整和导出**: 使用工具栏调整布局和缩放，然后导出结果

### API 配置

1. 进入"配置"标签页
2. 选择 API 提供商（OpenAI 或 Claude）
3. 输入您的 API 密钥
4. 可选择性配置自定义基础 URL 和模型
5. 点击"测试连接"验证配置

### 导出功能

支持以下格式导出：
- **PNG**: 高质量位图，适合分享和打印
- **SVG**: 矢量图形，支持无损缩放
- **JSON**: 结构化数据，可重新导入
- **文本**: 大纲格式，便于编辑

## 🎯 项目结构

```
src/
├── components/           # React 组件
│   ├── Layout.tsx       # 主布局组件
│   ├── InputPanel.tsx   # 输入面板
│   ├── ApiConfig.tsx    # API 配置
│   ├── MindMapViewer.tsx # 思维导图显示
│   └── ExportPanel.tsx  # 导出功能
├── services/            # 服务层
│   ├── llmService.ts    # LLM API 调用
│   ├── parseService.ts  # 内容解析
│   └── mindmapService.ts # 思维导图转换
├── utils/               # 工具函数
│   ├── parser.ts        # 文本解析器
│   ├── exportUtils.ts   # 导出工具
│   └── themeUtils.ts    # 主题管理
├── hooks/               # 自定义 Hooks
│   ├── useMindMap.ts    # 思维导图状态
│   ├── useApi.ts        # API 调用
│   └── useLocalStorage.ts # 本地存储
└── types/               # TypeScript 类型
    ├── mindmap.ts       # 思维导图类型
    ├── api.ts           # API 类型
    └── common.ts        # 通用类型
```

## 🌟 核心算法

### 文本解析算法
- 智能识别 Markdown 格式
- 层次化标题结构解析
- 列表和段落自动分类
- 中英文混合内容处理

### 思维导图转换
- 递归节点树构建
- 自动层级分配
- 节点标题优化
- 结构化数据生成

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [问题反馈](https://github.com/Lubbschai/llm-mindmap-generator/issues)
- [功能请求](https://github.com/Lubbschai/llm-mindmap-generator/issues/new)

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [创建 Issue](https://github.com/Lubbschai/llm-mindmap-generator/issues)

---

**开始创建您的思维导图吧！** 🎉
