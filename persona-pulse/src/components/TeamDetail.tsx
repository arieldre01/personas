'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Team } from '@/lib/teams';
import { Persona, generationColors, getPersonaImage, getPersonaImagePosition } from '@/lib/personas';
import {
  Users,
  MessageSquare,
  User,
  X,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface TeamDetailProps {
  team: Team | null;
  members: Persona[];
  open: boolean;
  onClose: () => void;
  onStartGroupChat: (members: Persona[]) => void;
  onViewPersona: (persona: Persona) => void;
}

export function TeamDetail({ 
  team, 
  members, 
  open, 
  onClose,
  onStartGroupChat,
  onViewPersona,
}: TeamDetailProps) {
  const [selectedMember, setSelectedMember] = useState<Persona | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedMember) {
        setSelectedMember(null);
      } else {
        onClose();
      }
    }
  }, [onClose, selectedMember]);

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) {
      setSelectedMember(null);
    }
  }, [open]);

  if (!team) return null;

  const handleGroupChat = () => {
    onStartGroupChat(members);
    onClose();
  };

  const handleViewProfile = (persona: Persona) => {
    onViewPersona(persona);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm transition-all hover:scale-105 z-10"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-14 w-14 flex-shrink-0 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <DialogHeader className="p-0">
                <DialogTitle className="text-xl font-bold text-white truncate">
                  {team.name}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-white/80">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
              {team.description && (
                <p className="text-sm text-white/70 mt-1 line-clamp-1">
                  {team.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 py-3 border-b dark:border-gray-700">
          <Button
            onClick={handleGroupChat}
            className="flex-1 gap-2 bg-gradient-to-r from-indigo-500 to-purple-500"
            disabled={members.length === 0}
          >
            <MessageSquare className="h-4 w-4" />
            Group Chat
          </Button>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Team Members
          </h3>

          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No members in this team yet.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {members.map((member) => {
                const colors = generationColors[member.generation];
                return (
                  <button
                    key={member.id}
                    onClick={() => handleViewProfile(member)}
                    className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-200 dark:ring-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPersonaImage(member)}
                        alt={member.name}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: getPersonaImagePosition(member) }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </span>
                        <Badge className={`${colors.badge} text-white text-xs px-1.5 py-0`}>
                          {member.generation}
                        </Badge>
                      </div>
                      <p className={`text-sm ${colors.text} truncate`}>
                        {member.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.role}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
