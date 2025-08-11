import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许函数式更新
      const valueToStore = value instanceof Function ? value(value as T) : value;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue];
}

// 专门用于存储历史记录的Hook
export function useHistory<T>(key: string, maxItems: number = 10) {
  const [history, setHistory] = useLocalStorage<T[]>(key, []);

  const addToHistory = (item: T) => {
    setHistory((prev) => {
      const newHistory = [item, ...prev.filter((_, index) => index < maxItems - 1)];
      return newHistory;
    });
  };

  const removeFromHistory = (index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

// 用于存储应用设置的Hook
export function useSettings() {
  const [settings, setSettings] = useLocalStorage('app-settings', {
    theme: 'default',
    layout: 'tree',
    language: 'zh',
    autoSave: true,
    demoMode: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    settings,
    updateSetting,
  };
}