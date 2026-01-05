'use client';

import { Persona } from '@/lib/personas';
import { PersonaCard } from './PersonaCard';

interface PersonaGridProps {
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
}

export function PersonaGrid({ personas, onSelectPersona }: PersonaGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {personas.map((persona, index) => (
        <div
          key={persona.id}
          className={`animate-fade-in-up opacity-0 stagger-${(index % 8) + 1}`}
        >
          <PersonaCard
            persona={persona}
            onClick={onSelectPersona}
          />
        </div>
      ))}
    </div>
  );
}

