export interface ParsedContent {
  sections: ContentSection[];
  metadata: {
    totalSections: number;
    maxDepth: number;
    hasCode: boolean;
    hasList: boolean;
  };
}

export interface ContentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'quote';
  level: number;
  text: string;
  children: ContentSection[];
  raw: string;
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'json' | 'text';
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface AppState {
  inputText: string;
  parsedContent: ParsedContent | null;
  mindMapData: import('./mindmap').MindMapData | null;
  isLoading: boolean;
  error: string | null;
  demoMode: boolean;
}