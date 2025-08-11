import type { ParsedContent, ContentSection } from '../types/common';

export class TextParser {
  private idCounter = 0;

  parse(text: string): ParsedContent {
    this.idCounter = 0;
    const lines = text.split('\n').filter(line => line.trim());
    const sections = this.parseLines(lines);
    
    return {
      sections,
      metadata: {
        totalSections: this.countSections(sections),
        maxDepth: this.getMaxDepth(sections),
        hasCode: this.hasCodeBlocks(text),
        hasList: this.hasLists(text),
      },
    };
  }

  private parseLines(lines: string[]): ContentSection[] {
    const sections: ContentSection[] = [];
    const stack: ContentSection[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const section = this.parseLine(trimmed);
      
      // 找到正确的父级
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        sections.push(section);
      } else {
        const parent = stack[stack.length - 1];
        parent.children.push(section);
      }

      if (section.type === 'heading') {
        stack.push(section);
      }
    }

    return sections;
  }

  private parseLine(line: string): ContentSection {
    const id = this.generateId();
    
    // 标题检测 (# ## ### 或 1. 2. 3.)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      return {
        id,
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
        children: [],
        raw: line,
      };
    }

    // 数字标题检测
    const numberedHeadingMatch = line.match(/^(\d+\.)+\s*(.+)$/);
    if (numberedHeadingMatch) {
      const level = (numberedHeadingMatch[1].match(/\d+\./g) || []).length;
      return {
        id,
        type: 'heading',
        level: Math.min(level, 6),
        text: numberedHeadingMatch[2].trim(),
        children: [],
        raw: line,
      };
    }

    // 列表检测
    const listMatch = line.match(/^[\s]*[-*+]\s+(.+)$/) || line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (listMatch) {
      const indentLevel = (line.match(/^[\s]*/)?.[0].length || 0) / 2;
      return {
        id,
        type: 'list',
        level: indentLevel + 1,
        text: listMatch[1].trim(),
        children: [],
        raw: line,
      };
    }

    // 代码块检测
    if (line.startsWith('```') || line.startsWith('`')) {
      return {
        id,
        type: 'code',
        level: 1,
        text: line.replace(/`/g, ''),
        children: [],
        raw: line,
      };
    }

    // 引用检测
    if (line.startsWith('>')) {
      return {
        id,
        type: 'quote',
        level: 1,
        text: line.replace(/^>\s*/, ''),
        children: [],
        raw: line,
      };
    }

    // 默认为段落
    return {
      id,
      type: 'paragraph',
      level: 1,
      text: line,
      children: [],
      raw: line,
    };
  }

  private generateId(): string {
    return `section_${++this.idCounter}`;
  }

  private countSections(sections: ContentSection[]): number {
    let count = sections.length;
    for (const section of sections) {
      count += this.countSections(section.children);
    }
    return count;
  }

  private getMaxDepth(sections: ContentSection[], currentDepth = 0): number {
    let maxDepth = currentDepth;
    for (const section of sections) {
      const childDepth = this.getMaxDepth(section.children, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    return maxDepth;
  }

  private hasCodeBlocks(text: string): boolean {
    return text.includes('```') || text.includes('`');
  }

  private hasLists(text: string): boolean {
    return /^[\s]*[-*+]\s+/.test(text) || /^[\s]*\d+\.\s+/.test(text);
  }
}

export const textParser = new TextParser();