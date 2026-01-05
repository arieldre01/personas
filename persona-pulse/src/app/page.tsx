'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonaGrid } from '@/components/PersonaGrid';
import { PersonaDetail } from '@/components/PersonaDetail';
import { PersonaFinder } from '@/components/PersonaFinder';
import { personas, Persona, generationColors } from '@/lib/personas';
import { Compass, Users, Sparkles, Github, Moon, Sun } from 'lucide-react';

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Calculate grid columns based on screen size (matching the grid layout)
  const getColumnsCount = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3;  // md
    return 2; // default
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (detailOpen || finderOpen) return; // Don't navigate when modals are open
    
    const cols = getColumnsCount();
    const total = personas.length;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % total);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + total) % total);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + cols;
          return next >= total ? prev % cols : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - cols;
          return next < 0 ? prev + Math.floor((total - 1) / cols) * cols : next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < total) {
          handleSelectPersona(personas[focusedIndex]);
        }
        break;
    }
  }, [detailOpen, finderOpen, focusedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Check initial preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setDetailOpen(true);
  };

  const handlePersonaMatch = (persona: Persona) => {
    setSelectedPersona(persona);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen hero-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 text-white shadow-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Persona Pulse</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Explorer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setFinderOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 shadow-lg shadow-purple-500/25"
            >
              <Compass className="h-4 w-4" />
              Find Your Persona
            </Button>
            <button
              onClick={toggleDarkMode}
              className="rounded-full p-2.5 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <a
              href="https://github.com/arieldre01/personas"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <Sparkles className="mr-1 h-3 w-3" />
            Interactive Employee Personas
          </Badge>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Understand Your{' '}
            <span className="animated-gradient-text">
              Team&apos;s Pulse
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Explore employee personas, understand their psychology, and <strong>have real conversations</strong> with them.
            Practice your communication skills, discover your own style, and learn how to connect with every type.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setFinderOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600"
            >
              <Compass className="h-5 w-5" />
              Discover My Persona
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById('personas')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Users className="mr-2 h-5 w-5" />
              Browse All Personas
            </Button>
          </div>
        </div>

        {/* Generation Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {(['Gen Z', 'Gen Y', 'Gen X', 'Boomer'] as const).map((gen) => (
            <div
              key={gen}
              className={`flex items-center gap-2 rounded-full px-4 py-2 ${generationColors[gen].bg} ${generationColors[gen].border} border`}
            >
              <div className={`h-3 w-3 rounded-full ${generationColors[gen].badge}`} />
              <span className={`text-sm font-medium ${generationColors[gen].text}`}>
                {gen}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Persona Grid */}
      <section id="personas" className="container mx-auto px-4 pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">Meet the Personas</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Click on any persona to explore their profile and start a conversation
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Tip: Use arrow keys to navigate, Enter to select
          </p>
        </div>

        <PersonaGrid 
          personas={personas} 
          onSelectPersona={handleSelectPersona}
          focusedIndex={focusedIndex}
          onFocusChange={setFocusedIndex}
        />
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Persona Pulse Explorer</span>
            </div>
            <p className="text-sm text-gray-500">
              Built with Next.js, Tailwind CSS, and Shadcn UI
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PersonaDetail
        persona={selectedPersona}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <PersonaFinder
        open={finderOpen}
        onClose={() => setFinderOpen(false)}
        onPersonaMatch={handlePersonaMatch}
      />
    </div>
  );
}
