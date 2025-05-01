"use client";

import { useState, useEffect } from 'react';

export function useLocalStorage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const saveValue = (key: string, value: string) => {
    if (isClient) {
      localStorage.setItem(key, value);
    }
  };

  const getValue = (key: string): string | null => {
    if (isClient) {
      return localStorage.getItem(key);
    }
    return null;
  };

  const removeValue = (key: string) => {
    if (isClient) {
      localStorage.removeItem(key);
    }
  };

  return { saveValue, getValue, removeValue };
}