'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Team } from '@/lib/teams';
import { Persona, getPersonaImage } from '@/lib/personas';
import { Users, Pencil, Trash2 } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  members: Persona[];
  onClick: (team: Team) => void;
  isFocused?: boolean;
  onFocus?: () => void;
  onEdit?: (team: Team) => void;
  onDelete?: (id: string) => void;
}

export function TeamCard({ 
  team, 
  members,
  onClick, 
  isFocused = false, 
  onFocus,
  onEdit,
  onDelete,
}: TeamCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(team);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(team.id);
    }
  };

  const displayedMembers = members.slice(0, 4);
  const extraCount = members.length - 4;

  return (
    <Card
      className={`persona-card-glass group cursor-pointer overflow-hidden h-full flex flex-col rounded-xl ${
        isFocused ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-purple-400' : ''
      }`}
      onClick={() => onClick(team)}
      onFocus={onFocus}
      tabIndex={0}
      role="button"
      aria-label={`View ${team.name} team`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(team);
        }
      }}
    >
      {/* Header with gradient background */}
      <div className="persona-card-header bg-gradient-to-br from-indigo-500 to-purple-600 p-4 relative overflow-hidden">
        {/* Edit/Delete buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white hover:text-blue-600 hover:scale-110 transition-all shadow-sm"
            title="Edit team"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white hover:text-red-600 hover:scale-110 transition-all shadow-sm"
            title="Delete team"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* Decorative light beam effect */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.8),transparent_60%)]" />
        
        {/* Team Icon */}
        <div 
          className="avatar-glow avatar-float relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/80 dark:ring-white/20 shadow-lg flex items-center justify-center bg-white/20 backdrop-blur-sm z-10"
          style={{ '--glow-color': '#8b5cf6' } as React.CSSProperties}
        >
          <Users className="h-8 w-8 text-white" />
        </div>

        {/* Team Name */}
        <div className="text-center relative z-10">
          <h3 className="text-base font-semibold text-white tracking-tight drop-shadow-sm">
            {team.name}
          </h3>
          <p className="text-xs font-medium text-white/80 line-clamp-1 mt-0.5">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>

      <CardContent className="p-3 flex-1 flex flex-col relative z-10">
        {/* Member Avatars */}
        <div className="mb-2 flex justify-center">
          <div className="flex -space-x-2">
            {displayedMembers.map((member) => (
              <div
                key={member.id}
                className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700"
                title={member.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPersonaImage(member)}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {extraCount > 0 && (
              <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  +{extraCount}
                </span>
              </div>
            )}
            {members.length === 0 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                No members yet
              </div>
            )}
          </div>
        </div>

        {/* Badge */}
        <div className="mb-2 flex justify-center">
          <Badge className="bg-indigo-500 text-white text-xs px-2.5 py-0.5 shadow-sm">
            Team
          </Badge>
        </div>

        {/* Description */}
        <div className="mt-auto pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
          <p className="text-xs italic text-gray-500 dark:text-gray-400 line-clamp-2">
            {team.description || 'No description'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
