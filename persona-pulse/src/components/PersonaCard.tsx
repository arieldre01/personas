'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Persona, generationColors, getPersonaImage } from '@/lib/personas';
import { MapPin, Briefcase } from 'lucide-react';
import Image from 'next/image';

interface PersonaCardProps {
  persona: Persona;
  onClick: (persona: Persona) => void;
}

export function PersonaCard({ persona, onClick }: PersonaCardProps) {
  const colors = generationColors[persona.generation];

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${colors.border} border-2 overflow-hidden h-full flex flex-col`}
      onClick={() => onClick(persona)}
    >
      <div className={`${colors.bg} p-4`}>
        {/* Profile Image */}
        <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800 shadow-md">
          <Image
            src={getPersonaImage(persona)}
            alt={persona.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Name and Title */}
        <div className="text-center">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {persona.name}
          </h3>
          <p className={`text-xs font-medium ${colors.text} line-clamp-1`}>
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
