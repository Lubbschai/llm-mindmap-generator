export interface MindMapNode {
  id: string;
  title: string;
  content?: string;
  children: MindMapNode[];
  level: number;
  parent?: string;
  collapsed?: boolean;
  position?: {
    x: number;
    y: number;
  };
}

export interface MindMapData {
  root: MindMapNode;
  totalNodes: number;
  maxDepth: number;
}

export interface MindMapTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
  };
  fontFamily: string;
  fontSize: {
    root: number;
    level1: number;
    level2: number;
    level3: number;
  };
}

export type LayoutType = 'tree' | 'radial' | 'network';

export interface MindMapConfig {
  layout: LayoutType;
  theme: MindMapTheme;
  width: number;
  height: number;
  enableZoom: boolean;
  enablePan: boolean;
  enableCollapse: boolean;
}