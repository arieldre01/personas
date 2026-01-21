'use client';

import { useEffect, useState } from 'react';
import { Monitor, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Theme = 'system' | 'opposite';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Get what the system preference is
  const getSystemPrefersDark = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Apply the correct theme based on mode
  const applyTheme = (mode: Theme) => {
    const systemDark = getSystemPrefersDark();
    const shouldBeDark = mode === 'system' ? systemDark : !systemDark;
    document.documentElement.classList.toggle('dark', shouldBeDark);
  };

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'opposite') {
      setTheme('opposite');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }
    applyTheme(theme);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme(theme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === 'system' ? 'opposite' : 'system');
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  const isOpposite = theme === 'opposite';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`h-9 w-9 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
        isOpposite 
          ? 'bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-800/40' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      title={isOpposite ? 'Theme: Opposite of system (click for System)' : 'Theme: System (click for Opposite)'}
    >
      {isOpposite ? (
        <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      ) : (
        <Monitor className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

