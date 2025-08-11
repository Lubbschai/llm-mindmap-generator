import type { MindMapData, ExportOptions } from '../types/mindmap';

export class ExportUtils {
  static exportToPNG(
    svgElement: SVGElement, 
    options: ExportOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

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
          URL.revokeObjectURL(svgUrl);
          resolve(dataUrl);
        };

        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Failed to load SVG image'));
        };

        img.src = svgUrl;
      } catch (error) {
        reject(error);
      }
    });
  }

  static exportToSVG(svgElement: SVGElement): string {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }

  static exportToJSON(data: MindMapData): string {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  static downloadFile(content: string, filename: string, mimeType: string): void {
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

  static downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static generateFilename(title: string, format: string): string {
    const sanitizedTitle = title
      .replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')
      .substring(0, 50);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${sanitizedTitle}_${timestamp}.${format}`;
  }

  static importFromJSON(jsonString: string): MindMapData {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate the structure
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('Invalid mindmap data: missing nodes array');
      }
      
      if (!data.title || typeof data.title !== 'string') {
        throw new Error('Invalid mindmap data: missing title');
      }

      // Ensure dates are properly parsed
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      throw new Error(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static validateExportOptions(options: ExportOptions): ExportOptions {
    const validated: ExportOptions = { ...options };

    // Set defaults
    if (!validated.quality) validated.quality = 1.0;
    if (!validated.width) validated.width = 1200;
    if (!validated.height) validated.height = 800;
    if (!validated.backgroundColor) validated.backgroundColor = '#ffffff';

    // Validate ranges
    validated.quality = Math.max(0.1, Math.min(1.0, validated.quality));
    validated.width = Math.max(100, Math.min(4000, validated.width));
    validated.height = Math.max(100, Math.min(4000, validated.height));

    return validated;
  }
}