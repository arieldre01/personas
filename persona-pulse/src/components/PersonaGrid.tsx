'use client';

import { Persona } from '@/lib/personas';
import { PersonaCard } from './PersonaCard';
import { SkeletonGrid } from './ui/skeleton';

interface PersonaGridProps {
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
  isLoading?: boolean;
  focusedIndex?: number;
  onFocusChange?: (index: number) => void;
}

export function PersonaGrid({ 
  personas, 
  onSelectPersona, 
  isLoading = false,
  focusedIndex = -1,
  onFocusChange,
}: PersonaGridProps) {
  if (isLoading) {
    return <SkeletonGrid count={8} />;
  }

  return (
    <div 
      className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
      role="grid"
      aria-label="Persona grid"
    >
      {personas.map((persona, index) => (
        <div
          key={persona.id}
          className={`animate-fade-in-up opacity-0 stagger-${(index % 8) + 1}`}
          role="gridcell"
        >
          <PersonaCard
            persona={persona}
            onClick={onSelectPersona}
            isFocused={focusedIndex === index}
            onFocus={() => onFocusChange?.(index)}
          />
        </div>
      ))}
    </div>
  );
}
