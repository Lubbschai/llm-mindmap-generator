import type { MindMapNode, MindMapData } from '../types/mindmap';
import type { ParsedContent, ContentSection } from '../types/common';

export class MindMapService {
  private nodeIdCounter = 0;

  convertToMindMap(parsedContent: ParsedContent): MindMapData {
    this.nodeIdCounter = 0;
    
    // 创建根节点
    const root: MindMapNode = {
      id: this.generateNodeId(),
      title: this.extractRootTitle(parsedContent),
      children: [],
      level: 0,
    };

    // 转换内容为思维导图节点
    root.children = this.convertSections(parsedContent.sections, 1);

    return {
      root,
      totalNodes: this.countNodes(root),
      maxDepth: this.calculateMaxDepth(root),
    };
  }

  private extractRootTitle(parsedContent: ParsedContent): string {
    // 尝试从第一个标题提取根节点标题
    const firstHeading = parsedContent.sections.find(s => s.type === 'heading');
    if (firstHeading) {
      return firstHeading.text;
    }

    // 如果没有标题，生成一个通用标题
    return '思维导图';
  }

  private convertSections(sections: ContentSection[], level: number): MindMapNode[] {
    const nodes: MindMapNode[] = [];

    for (const section of sections) {
      const node = this.convertSection(section, level);
      nodes.push(node);
    }

    return nodes;
  }

  private convertSection(section: ContentSection, level: number): MindMapNode {
    const node: MindMapNode = {
      id: this.generateNodeId(),
      title: this.formatNodeTitle(section),
      content: section.raw,
      children: [],
      level,
    };

    // 递归转换子节点
    if (section.children.length > 0) {
      node.children = this.convertSections(section.children, level + 1);
    }

    return node;
  }

  private formatNodeTitle(section: ContentSection): string {
    // 清理和格式化节点标题
    let title = section.text.trim();
    
    // 移除Markdown格式字符
    title = title.replace(/\*\*(.*?)\*\*/g, '$1'); // 粗体
    title = title.replace(/\*(.*?)\*/g, '$1'); // 斜体
    title = title.replace(/`(.*?)`/g, '$1'); // 代码
    title = title.replace(/#{1,6}\s*/, ''); // 标题符号
    
    // 限制标题长度
    if (title.length > 50) {
      title = title.slice(0, 47) + '...';
    }

    return title || '未命名节点';
  }

  private generateNodeId(): string {
    return `node_${++this.nodeIdCounter}`;
  }

  private countNodes(node: MindMapNode): number {
    let count = 1; // 当前节点
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  private calculateMaxDepth(node: MindMapNode, currentDepth: number = 0): number {
    let maxDepth = currentDepth;
    for (const child of node.children) {
      const childDepth = this.calculateMaxDepth(child, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    return maxDepth;
  }

  // 搜索节点
  searchNodes(root: MindMapNode, query: string): MindMapNode[] {
    const results: MindMapNode[] = [];
    const searchQuery = query.toLowerCase();

    const search = (node: MindMapNode) => {
      if (node.title.toLowerCase().includes(searchQuery) ||
          (node.content && node.content.toLowerCase().includes(searchQuery))) {
        results.push(node);
      }
      
      for (const child of node.children) {
        search(child);
      }
    };

    search(root);
    return results;
  }

  // 展开/折叠节点
  toggleNodeCollapse(root: MindMapNode, nodeId: string): MindMapNode {
    const toggleNode = (node: MindMapNode): MindMapNode => {
      if (node.id === nodeId) {
        return { ...node, collapsed: !node.collapsed };
      }
      
      return {
        ...node,
        children: node.children.map(child => toggleNode(child)),
      };
    };

    return toggleNode(root);
  }

  // 获取节点路径
  getNodePath(root: MindMapNode, nodeId: string): MindMapNode[] | null {
    const path: MindMapNode[] = [];
    
    const findPath = (node: MindMapNode): boolean => {
      path.push(node);
      
      if (node.id === nodeId) {
        return true;
      }
      
      for (const child of node.children) {
        if (findPath(child)) {
          return true;
        }
      }
      
      path.pop();
      return false;
    };

    return findPath(root) ? path : null;
  }
}

export const mindMapService = new MindMapService();