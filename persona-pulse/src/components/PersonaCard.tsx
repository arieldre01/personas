'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Persona, generationColors, getPersonaImage, getPersonaImagePosition } from '@/lib/personas';
import { MapPin, Briefcase } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onClick: (persona: Persona) => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

export function PersonaCard({ persona, onClick, isFocused = false, onFocus }: PersonaCardProps) {
  const colors = generationColors[persona.generation];

  // Map generation to glow colors
  const glowColors: Record<string, string> = {
    'Gen Z': '#8b5cf6',
    'Gen Y': '#14b8a6',
    'Gen X': '#f59e0b',
    'Boomer': '#1e3a8a',
  };

  return (
    <Card
      className={`group cursor-pointer card-hover ${colors.border} border-2 overflow-hidden h-full flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all ${
        isFocused ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-purple-400' : ''
      }`}
      onClick={() => onClick(persona)}
      onFocus={onFocus}
      tabIndex={0}
      role="button"
      aria-label={`View ${persona.name}'s profile`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(persona);
        }
      }}
    >
      <div className={`${colors.bg} p-4 relative overflow-hidden`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]" />
        
        {/* Profile Image */}
        <div 
          className="avatar-glow relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800 shadow-lg"
          style={{ '--glow-color': glowColors[persona.generation] } as React.CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getPersonaImage(persona)}
            alt={persona.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ objectPosition: getPersonaImagePosition(persona) }}
          />
        </div>

        {/* Name and Title */}
        <div className="text-center relative">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
            {persona.name}
          </h3>
          <p className={`text-xs font-medium ${colors.text} line-clamp-1 mt-0.5`}>
            {persona.title}
          </p>
        </div>
      </div>

      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Generation Badge */}
        <div className="mb-2 flex justify-center">
          <Badge className={`${colors.badge} text-white text-xs px-2 py-0.5`}>
            {persona.generation}
          </Badge>
        </div>

        {/* Details - Compact */}
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{persona.role}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{persona.location}</span>
          </div>
        </div>

        {/* Quote Preview */}
        <div className="mt-auto pt-2 border-t mt-2">
          <p className="text-xs italic text-gray-500 dark:text-gray-500 line-clamp-2">
            &ldquo;{persona.quote}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
