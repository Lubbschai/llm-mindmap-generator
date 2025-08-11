export interface MindMapNode {
  id: string;
  content: string;
  level: number;
  parentId?: string;
  children: string[];
  x?: number;
  y?: number;
  collapsed?: boolean;
  color?: string;
  size?: number;
}

export interface MindMapData {
  nodes: MindMapNode[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMapLayout {
  type: 'radial' | 'tree' | 'network';
  orientation?: 'horizontal' | 'vertical';
  spacing: {
    node: number;
    level: number;
  };
}

export interface MindMapTheme {
  name: string;
  colors: {
    background: string;
    node: string[];
    text: string;
    link: string;
  };
  fonts: {
    family: string;
    sizes: number[];
  };
}

export interface ParsedContent {
  title: string;
  sections: ParsedSection[];
}

export interface ParsedSection {
  heading: string;
  level: number;
  content: string;
  subsections: ParsedSection[];
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'json' | 'pdf';
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}