import type { ParsedContent, ParsedSection } from '../types/mindmap';
import { TextParser } from '../utils/textParser';

export class ParseService {
  static parseContent(text: string): ParsedContent {
    return TextParser.parseContent(text);
  }

  static extractStructure(content: ParsedContent): {
    headings: string[];
    hierarchy: { [key: string]: string[] };
    keywords: string[];
  } {
    const headings: string[] = [];
    const hierarchy: { [key: string]: string[] } = {};
    
    const processSection = (section: ParsedSection, parentHeading?: string) => {
      headings.push(section.heading);
      
      if (parentHeading) {
        if (!hierarchy[parentHeading]) {
          hierarchy[parentHeading] = [];
        }
        hierarchy[parentHeading].push(section.heading);
      }

      section.subsections.forEach(subsection => {
        processSection(subsection, section.heading);
      });
    };

    content.sections.forEach(section => processSection(section));

    // Extract keywords from all content
    const allText = content.sections
      .map(section => this.getSectionText(section))
      .join(' ');
    
    const keywords = TextParser.extractKeywords(allText);

    return {
      headings,
      hierarchy,
      keywords,
    };
  }

  private static getSectionText(section: ParsedSection): string {
    let text = section.heading + ' ' + section.content;
    section.subsections.forEach(subsection => {
      text += ' ' + this.getSectionText(subsection);
    });
    return text;
  }

  static identifyRelationships(content: ParsedContent): {
    related: { [key: string]: string[] };
    concepts: string[];
  } {
    const related: { [key: string]: string[] } = {};
    const concepts: string[] = [];

    // Simple relationship identification based on common words
    const sections = this.getAllSections(content);
    
    sections.forEach(section => {
      concepts.push(section.heading);
      
      const sectionWords = this.getWordsFromText(section.heading + ' ' + section.content);
      
      sections.forEach(otherSection => {
        if (section.heading !== otherSection.heading) {
          const otherWords = this.getWordsFromText(otherSection.heading + ' ' + otherSection.content);
          const commonWords = sectionWords.filter(word => otherWords.includes(word));
          
          if (commonWords.length > 2) {
            if (!related[section.heading]) {
              related[section.heading] = [];
            }
            related[section.heading].push(otherSection.heading);
          }
        }
      });
    });

    return {
      related,
      concepts,
    };
  }

  private static getAllSections(content: ParsedContent): ParsedSection[] {
    const sections: ParsedSection[] = [];
    
    const addSections = (sectionList: ParsedSection[]) => {
      sectionList.forEach(section => {
        sections.push(section);
        addSections(section.subsections);
      });
    };
    
    addSections(content.sections);
    return sections;
  }

  private static getWordsFromText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }
}