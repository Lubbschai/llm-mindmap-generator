import type { ParsedContent, ParsedSection } from '../types/mindmap';

export class TextParser {

  static parseContent(text: string): ParsedContent {
    const lines = text.split('\n').filter(line => line.trim());
    const sections: ParsedSection[] = [];
    let title = '';

    // Find title (first heading or first significant line)
    const firstLine = lines[0]?.trim();
    if (firstLine) {
      const headingMatch = firstLine.match(/^#{1,6}\s+(.+)$/);
      title = headingMatch ? headingMatch[1] : firstLine;
    }

    let currentSection: ParsedSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const level = this.getHeadingLevel(trimmedLine);
      
      if (level > 0) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          this.addSectionToHierarchy(sections, currentSection);
        }

        // Start new section
        currentSection = {
          heading: this.extractHeadingText(trimmedLine),
          level,
          content: '',
          subsections: [],
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(trimmedLine);
      } else {
        // Content before any heading
        if (!title && trimmedLine) {
          title = trimmedLine;
        }
      }
    }

    // Add last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      this.addSectionToHierarchy(sections, currentSection);
    }

    return {
      title: title || 'Untitled',
      sections,
    };
  }

  private static getHeadingLevel(line: string): number {
    // Markdown headings
    const markdownMatch = line.match(/^(#{1,6})\s+/);
    if (markdownMatch) {
      return markdownMatch[1].length;
    }

    // Chinese numbering
    const chineseNumbers = ['一', '二', '三', '四', '五', '六'];
    const chineseMatch = line.match(/^([一二三四五六])、/);
    if (chineseMatch) {
      const index = chineseNumbers.indexOf(chineseMatch[1]);
      return index >= 0 ? index + 1 : 1;
    }

    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.?\s+/);
    if (numberedMatch) {
      const num = parseInt(numberedMatch[1]);
      return num <= 6 ? num : 1;
    }

    // Bullet points (level 2)
    if (line.match(/^[•·▪▫\-*+]\s+/)) {
      return 2;
    }

    return 0;
  }

  private static extractHeadingText(line: string): string {
    // Remove heading markers
    return line
      .replace(/^#{1,6}\s+/, '')
      .replace(/^[一二三四五六]、\s*/, '')
      .replace(/^\d+\.?\s+/, '')
      .replace(/^[•·▪▫\-*+]\s+/, '')
      .trim();
  }

  private static addSectionToHierarchy(sections: ParsedSection[], section: ParsedSection): void {
    if (section.level === 1) {
      sections.push(section);
    } else {
      // Find parent section
      const parent = this.findParentSection(sections, section.level);
      if (parent) {
        parent.subsections.push(section);
      } else {
        // If no parent found, add as top-level
        sections.push(section);
      }
    }
  }

  private static findParentSection(sections: ParsedSection[], level: number): ParsedSection | null {
    // Find the most recent section with level < current level
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.level < level) {
        return section;
      }
      
      // Check subsections recursively
      const parent = this.findParentSection(section.subsections, level);
      if (parent) {
        return parent;
      }
    }
    return null;
  }

  static extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // Keep alphanumeric and Chinese characters
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Return top words
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}