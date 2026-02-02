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
      className="min-w-full min-h-full object-cover transition-transform duration-500 group-hover:scale-110"
      style={{ objectPosition: getPersonaImagePosition(persona) }}
    />
  );

  return (
    <Card
      className={`persona-card-glass group cursor-pointer overflow-hidden h-full flex flex-col rounded-xl ${
        isFocused ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-purple-400' : ''
      }`}
      data-generation={persona.generation}
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
      {/* Header with gradient background */}
      <div className={`persona-card-header ${colors.bg} p-4 relative overflow-hidden`}>
        {/* Edit/Delete buttons for custom personas */}
        {isCustom && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white hover:text-blue-600 hover:scale-110 transition-all shadow-sm"
              title="Edit persona"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white hover:text-red-600 hover:scale-110 transition-all shadow-sm"
              title="Delete persona"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Decorative light beam effect */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.8),transparent_60%)]" />
        
        {/* Profile Image/Avatar with animated ring */}
        <div 
          className="avatar-glow avatar-float avatar-ring-animated relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/80 dark:ring-white/20 shadow-lg flex items-center justify-center bg-white dark:bg-gray-700 z-10"
          style={{ '--glow-color': glowColors[persona.generation] } as React.CSSProperties}
        >
          {avatarContent}
        </div>

        {/* Name and Title */}
        <div className="text-center relative z-10">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
            {persona.name}
          </h3>
          <p className={`text-xs font-medium ${colors.text} line-clamp-1 mt-0.5`}>
            {persona.title || 'Custom Persona'}
          </p>
        </div>
      </div>

      <CardContent className="p-3 flex-1 flex flex-col relative z-10">
        {/* Generation Badge + Custom Badge */}
        <div className="mb-2 flex justify-center gap-1.5">
          <Badge className={`${colors.badge} text-white text-xs px-2.5 py-0.5 shadow-sm`}>
            {persona.generation}
          </Badge>
          {isCustom && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
              Custom
            </Badge>
          )}
        </div>

        {/* Details - Compact with subtle icons */}
        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2 group/item">
            <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 group-hover/item:bg-gray-200 dark:group-hover/item:bg-gray-700 transition-colors">
              <Briefcase className="h-3 w-3" />
            </div>
            <span className="truncate">{persona.role || 'No role set'}</span>
          </div>
          <div className="flex items-center gap-2 group/item">
            <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 group-hover/item:bg-gray-200 dark:group-hover/item:bg-gray-700 transition-colors">
              <MapPin className="h-3 w-3" />
            </div>
            <span className="truncate">{persona.location || 'No location set'}</span>
          </div>
        </div>

        {/* Quote Preview with decorative quote mark */}
        <div className="mt-auto pt-2 border-t border-gray-200/60 dark:border-gray-700/60 mt-2">
          <p className="persona-quote text-xs italic text-gray-500 dark:text-gray-400 line-clamp-2">
            {persona.quote || 'No quote set'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}