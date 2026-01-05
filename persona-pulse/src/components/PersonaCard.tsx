'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Persona, generationColors, getPersonaImage } from '@/lib/personas';
import { MapPin, Briefcase, Clock } from 'lucide-react';
import Image from 'next/image';

interface PersonaCardProps {
  persona: Persona;
  onClick: (persona: Persona) => void;
}

export function PersonaCard({ persona, onClick }: PersonaCardProps) {
  const colors = generationColors[persona.generation];

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${colors.border} border-2 overflow-hidden`}
      onClick={() => onClick(persona)}
    >
      <div className={`${colors.bg} p-6`}>
        {/* Profile Image */}
        <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg">
          <Image
            src={getPersonaImage(persona)}
            alt={persona.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Name and Title */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {persona.name}
          </h3>
          <p className={`text-sm font-medium ${colors.text}`}>
            {persona.title}
          </p>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Generation Badge */}
        <div className="mb-3 flex justify-center">
          <Badge className={`${colors.badge} text-white`}>
            {persona.generation}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{persona.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{persona.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{persona.tenure}</span>
          </div>
        </div>

        {/* Quote Preview */}
        <div className="mt-4 border-t pt-3">
          <p className="text-xs italic text-gray-500 dark:text-gray-500 line-clamp-2">
            &ldquo;{persona.quote}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

