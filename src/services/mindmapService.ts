import type { MindMapData, MindMapNode, ParsedContent, ParsedSection, MindMapLayout } from '../types/mindmap';

export class MindMapService {
  private static nodeIdCounter = 0;

  static generateFromParsedContent(content: ParsedContent): MindMapData {
    this.nodeIdCounter = 0;
    const nodes: MindMapNode[] = [];

    // Create root node
    const rootNode: MindMapNode = {
      id: this.generateNodeId(),
      content: content.title,
      level: 0,
      children: [],
      x: 0,
      y: 0,
      collapsed: false,
      color: '#4F46E5',
      size: 16,
    };
    nodes.push(rootNode);

    // Process sections
    content.sections.forEach((section) => {
      const sectionNode = this.createNodeFromSection(section, 1, rootNode.id);
      nodes.push(sectionNode);
      rootNode.children.push(sectionNode.id);

      // Add subsections
      this.addSubsections(section, sectionNode, nodes, 2);
    });

    return {
      nodes,
      title: content.title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private static createNodeFromSection(
    section: ParsedSection,
    level: number,
    parentId?: string
  ): MindMapNode {
    return {
      id: this.generateNodeId(),
      content: section.heading,
      level,
      parentId,
      children: [],
      collapsed: false,
      color: this.getColorForLevel(level),
      size: this.getSizeForLevel(level),
    };
  }

  private static addSubsections(
    section: ParsedSection,
    parentNode: MindMapNode,
    nodes: MindMapNode[],
    level: number
  ): void {
    section.subsections.forEach(subsection => {
      const childNode = this.createNodeFromSection(subsection, level, parentNode.id);
      nodes.push(childNode);
      parentNode.children.push(childNode.id);

      // Recursively add subsections
      this.addSubsections(subsection, childNode, nodes, level + 1);
    });
  }

  private static generateNodeId(): string {
    return `node_${++this.nodeIdCounter}`;
  }

  private static getColorForLevel(level: number): string {
    const colors = [
      '#4F46E5', // Indigo
      '#059669', // Emerald
      '#DC2626', // Red
      '#D97706', // Amber
      '#7C3AED', // Violet
      '#DB2777', // Pink
      '#0891B2', // Cyan
      '#65A30D', // Lime
    ];
    return colors[level % colors.length];
  }

  private static getSizeForLevel(level: number): number {
    const baseSizes = [16, 14, 12, 10, 10, 10];
    return baseSizes[level] || 10;
  }

  static calculateLayout(data: MindMapData, layout: MindMapLayout): MindMapData {
    const updatedNodes = [...data.nodes];
    
    switch (layout.type) {
      case 'radial':
        this.calculateRadialLayout(updatedNodes, layout);
        break;
      case 'tree':
        this.calculateTreeLayout(updatedNodes, layout);
        break;
      case 'network':
        this.calculateNetworkLayout(updatedNodes);
        break;
    }

    return {
      ...data,
      nodes: updatedNodes,
      updatedAt: new Date(),
    };
  }

  private static calculateRadialLayout(nodes: MindMapNode[], layout: MindMapLayout): void {
    const rootNode = nodes.find(node => node.level === 0);
    if (!rootNode) return;

    rootNode.x = 0;
    rootNode.y = 0;

    const childNodes = nodes.filter(node => node.parentId === rootNode.id);
    const angleStep = (2 * Math.PI) / childNodes.length;

    childNodes.forEach((child, index) => {
      const angle = index * angleStep;
      const radius = layout.spacing.level * (child.level || 1);
      
      child.x = Math.cos(angle) * radius;
      child.y = Math.sin(angle) * radius;

      // Position child nodes
      this.positionChildrenRadially(child, nodes, layout, angle, radius);
    });
  }

  private static positionChildrenRadially(
    parentNode: MindMapNode,
    nodes: MindMapNode[],
    layout: MindMapLayout,
    baseAngle: number,
    baseRadius: number
  ): void {
    const children = nodes.filter(node => node.parentId === parentNode.id);
    if (children.length === 0) return;

    const angleSpread = Math.PI / (children.length + 1);
    const startAngle = baseAngle - angleSpread * (children.length / 2);

    children.forEach((child, index) => {
      const angle = startAngle + index * angleSpread;
      const radius = baseRadius + layout.spacing.level;
      
      child.x = Math.cos(angle) * radius;
      child.y = Math.sin(angle) * radius;

      this.positionChildrenRadially(child, nodes, layout, angle, radius);
    });
  }

  private static calculateTreeLayout(nodes: MindMapNode[], layout: MindMapLayout): void {
    const rootNode = nodes.find(node => node.level === 0);
    if (!rootNode) return;

    rootNode.x = 0;
    rootNode.y = 0;

    if (layout.orientation === 'vertical') {
      this.positionTreeVertical(rootNode, nodes, layout, 0, 0);
    } else {
      this.positionTreeHorizontal(rootNode, nodes, layout, 0, 0);
    }
  }

  private static positionTreeHorizontal(
    parentNode: MindMapNode,
    nodes: MindMapNode[],
    layout: MindMapLayout,
    startX: number,
    centerY: number
  ): number {
    const children = nodes.filter(node => node.parentId === parentNode.id);
    if (children.length === 0) return centerY;

    const totalHeight = children.length * layout.spacing.node;
    let currentY = centerY - totalHeight / 2;

    children.forEach(child => {
      child.x = startX + layout.spacing.level;
      child.y = currentY;

      this.positionTreeHorizontal(child, nodes, layout, child.x, child.y);
      currentY += layout.spacing.node;
    });

    return centerY;
  }

  private static positionTreeVertical(
    parentNode: MindMapNode,
    nodes: MindMapNode[],
    layout: MindMapLayout,
    centerX: number,
    startY: number
  ): number {
    const children = nodes.filter(node => node.parentId === parentNode.id);
    if (children.length === 0) return centerX;

    const totalWidth = children.length * layout.spacing.node;
    let currentX = centerX - totalWidth / 2;

    children.forEach(child => {
      child.x = currentX;
      child.y = startY + layout.spacing.level;

      this.positionTreeVertical(child, nodes, layout, child.x, child.y);
      currentX += layout.spacing.node;
    });

    return centerX;
  }

  private static calculateNetworkLayout(nodes: MindMapNode[]): void {
    // Simple force-directed layout simulation
    const iterations = 50;
    const repulsion = 1000;
    const attraction = 0.1;

    for (let i = 0; i < iterations; i++) {
      // Apply repulsion forces
      nodes.forEach(node1 => {
        nodes.forEach(node2 => {
          if (node1.id !== node2.id) {
            const dx = (node1.x || 0) - (node2.x || 0);
            const dy = (node1.y || 0) - (node2.y || 0);
            const distance = Math.sqrt(dx * dx + dy * dy) + 1;
            const force = repulsion / (distance * distance);

            node1.x = (node1.x || 0) + (dx / distance) * force;
            node1.y = (node1.y || 0) + (dy / distance) * force;
          }
        });
      });

      // Apply attraction forces for connected nodes
      nodes.forEach(node => {
        if (node.parentId) {
          const parent = nodes.find(n => n.id === node.parentId);
          if (parent) {
            const dx = (parent.x || 0) - (node.x || 0);
            const dy = (parent.y || 0) - (node.y || 0);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = distance * attraction;

            node.x = (node.x || 0) + dx * force;
            node.y = (node.y || 0) + dy * force;
            parent.x = (parent.x || 0) - dx * force;
            parent.y = (parent.y || 0) - dy * force;
          }
        }
      });
    }
  }

  static toggleNodeCollapse(data: MindMapData, nodeId: string): MindMapData {
    const updatedNodes = data.nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, collapsed: !node.collapsed };
      }
      return node;
    });

    return {
      ...data,
      nodes: updatedNodes,
      updatedAt: new Date(),
    };
  }

  static searchNodes(data: MindMapData, query: string): string[] {
    const lowercaseQuery = query.toLowerCase();
    return data.nodes
      .filter(node => node.content.toLowerCase().includes(lowercaseQuery))
      .map(node => node.id);
  }
}