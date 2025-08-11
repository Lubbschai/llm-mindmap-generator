import type { ExportOptions } from '../types/common';
import type { MindMapData } from '../types/mindmap';

export class ExportUtils {
  static async exportToPNG(
    svgElement: SVGElement,
    options: ExportOptions = { format: 'png' }
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        canvas.width = options.width || img.width;
        canvas.height = options.height || img.height;
        
        if (options.backgroundColor) {
          ctx.fillStyle = options.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png', options.quality || 1.0);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };
      img.src = url;
    });
  }

  static exportToSVG(svgElement: SVGElement): string {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }

  static exportToJSON(mindMapData: MindMapData): string {
    return JSON.stringify(mindMapData, null, 2);
  }

  static exportToText(mindMapData: MindMapData): string {
    const lines: string[] = [];
    
    const processNode = (node: any, depth: number = 0) => {
      const indent = '  '.repeat(depth);
      const bullet = depth === 0 ? '' : '- ';
      lines.push(`${indent}${bullet}${node.title || node.content || ''}`);
      
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => processNode(child, depth + 1));
      }
    };
    
    processNode(mindMapData.root);
    return lines.join('\n');
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static async downloadImage(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const exportUtils = new ExportUtils();