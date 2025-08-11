import { textParser } from '../utils/parser';
import type { ParsedContent } from '../types/common';

export class ParseService {
  parse(text: string): ParsedContent {
    return textParser.parse(text);
  }

  // 预处理文本，清理格式
  preprocess(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // 统一换行符
      .replace(/\t/g, '  ') // 将Tab转换为空格
      .replace(/\n{3,}/g, '\n\n') // 合并多余的空行
      .trim();
  }

  // 检测内容类型
  detectContentType(text: string): {
    hasMarkdown: boolean;
    hasLists: boolean;
    hasHeadings: boolean;
    hasCode: boolean;
    language: 'zh' | 'en' | 'mixed';
  } {
    const hasMarkdown = /#{1,6}\s|```|\*\*|\*|_|`/.test(text);
    const hasLists = /^[\s]*[-*+]\s|^[\s]*\d+\.\s/.test(text);
    const hasHeadings = /^#{1,6}\s|\n#{1,6}\s/.test(text);
    const hasCode = /```[\s\S]*?```|`[^`]+`/.test(text);
    
    // 简单的语言检测
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    const chineseRatio = chineseChars / totalChars;
    
    let language: 'zh' | 'en' | 'mixed' = 'en';
    if (chineseRatio > 0.3) {
      language = chineseRatio > 0.7 ? 'zh' : 'mixed';
    }

    return {
      hasMarkdown,
      hasLists,
      hasHeadings,
      hasCode,
      language,
    };
  }

  // 提取关键词
  extractKeywords(text: string, maxKeywords: number = 10): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, '') // 保留中文字符
      .split(/\s+/)
      .filter(word => word.length > 2);

    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  // 生成摘要
  generateSummary(text: string, maxLength: number = 200): string {
    const sentences = text
      .split(/[.!?。！？]/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    if (sentences.length === 0) return text.slice(0, maxLength);

    let summary = sentences[0];
    for (let i = 1; i < sentences.length && summary.length < maxLength; i++) {
      const nextSentence = sentences[i];
      if (summary.length + nextSentence.length + 1 <= maxLength) {
        summary += '。' + nextSentence;
      } else {
        break;
      }
    }

    return summary.length > maxLength ? summary.slice(0, maxLength) + '...' : summary;
  }
}

export const parseService = new ParseService();