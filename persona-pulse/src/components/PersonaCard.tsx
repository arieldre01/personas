'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Persona, generationColors, getPersonaImage, getPersonaImagePosition } from '@/lib/personas';
import { isCustomPersona, CustomPersona } from '@/lib/custom-personas';
import { MapPin, Briefcase, Pencil, Trash2 } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onClick: (persona: Persona) => void;
  isFocused?: boolean;
  onFocus?: () => void;
  onEdit?: (persona: CustomPersona) => void;
  onDelete?: (id: string) => void;
}

export function PersonaCard({ 
  persona, 
  onClick, 
  isFocused = false, 
  onFocus,
  onEdit,
  onDelete,
}: PersonaCardProps) {
  const colors = generationColors[persona.generation];
  const isCustom = isCustomPersona(persona);

  // Map generation to glow colors
  const glowColors: Record<string, string> = {
    'Gen Z': '#8b5cf6',
    'Gen Y': '#14b8a6',
    'Gen X': '#f59e0b',
    'Boomer': '#1e3a8a',
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCustom && onEdit) {
      onEdit(persona as CustomPersona);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCustom && onDelete) {
      onDelete(persona.id);
    }
  };

  // Get avatar for custom personas (emoji) or image for default personas
  const customPersona = persona as CustomPersona;
  const avatarContent = isCustom && customPersona.customAvatar ? (
    <span className="text-3xl">{customPersona.customAvatar}</span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getPersonaImage(persona)}
      alt={persona.name}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      style={{ objectPosition: getPersonaImagePosition(persona) }}
    />
  );

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
        {/* Edit/Delete buttons for custom personas */}
        {isCustom && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white hover:text-blue-600 transition-colors"
              title="Edit persona"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white hover:text-red-600 transition-colors"
              title="Delete persona"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]" />
        
        {/* Profile Image/Avatar */}
        <div 
          className="avatar-glow relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800 shadow-lg flex items-center justify-center bg-white dark:bg-gray-700"
          style={{ '--glow-color': glowColors[persona.generation] } as React.CSSProperties}
        >
          {avatarContent}
        </div>

        {/* Name and Title */}
        <div className="text-center relative">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
            {persona.name}
          </h3>
          <p className={`text-xs font-medium ${colors.text} line-clamp-1 mt-0.5`}>
            {persona.title || 'Custom Persona'}
          </p>
        </div>
      </div>

      <CardContent className="p-3 flex-1 flex flex-col">
        {/* Generation Badge + Custom Badge */}
        <div className="mb-2 flex justify-center gap-1">
          <Badge className={`${colors.badge} text-white text-xs px-2 py-0.5`}>
            {persona.generation}
          </Badge>
          {isCustom && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
              Custom
            </Badge>
          )}
        </div>

        {/* Details - Compact */}
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{persona.role || 'No role set'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{persona.location || 'No location set'}</span>
          </div>
        </div>

        {/* Quote Preview */}
        <div className="mt-auto pt-2 border-t mt-2">
          <p className="text-xs italic text-gray-500 dark:text-gray-500 line-clamp-2">
            {persona.quote ? `"${persona.quote}"` : 'No quote set'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
