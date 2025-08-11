import type { MindMapTheme } from '../types/mindmap';

export const defaultTheme: MindMapTheme = {
  id: 'default',
  name: '默认主题',
  colors: {
    background: '#ffffff',
    text: '#2d3748',
    primary: '#4299e1',
    secondary: '#63b3ed',
    accent: '#ed8936',
    border: '#e2e8f0',
  },
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: {
    root: 18,
    level1: 16,
    level2: 14,
    level3: 12,
  },
};

export const darkTheme: MindMapTheme = {
  id: 'dark',
  name: '暗色主题',
  colors: {
    background: '#1a202c',
    text: '#f7fafc',
    primary: '#63b3ed',
    secondary: '#4299e1',
    accent: '#f6ad55',
    border: '#2d3748',
  },
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: {
    root: 18,
    level1: 16,
    level2: 14,
    level3: 12,
  },
};

export const colorfulTheme: MindMapTheme = {
  id: 'colorful',
  name: '彩色主题',
  colors: {
    background: '#f7fafc',
    text: '#2d3748',
    primary: '#e53e3e',
    secondary: '#38b2ac',
    accent: '#d69e2e',
    border: '#cbd5e0',
  },
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: {
    root: 18,
    level1: 16,
    level2: 14,
    level3: 12,
  },
};

export const availableThemes: MindMapTheme[] = [
  defaultTheme,
  darkTheme,
  colorfulTheme,
];

export const getThemeById = (id: string): MindMapTheme => {
  return availableThemes.find(theme => theme.id === id) || defaultTheme;
};

export const applyThemeToElement = (element: HTMLElement, theme: MindMapTheme) => {
  element.style.backgroundColor = theme.colors.background;
  element.style.color = theme.colors.text;
  element.style.fontFamily = theme.fontFamily;
};