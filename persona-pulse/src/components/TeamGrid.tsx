'use client';

import { Team } from '@/lib/teams';
import { Persona } from '@/lib/personas';
import { TeamCard } from './TeamCard';
import { SkeletonGrid } from './ui/skeleton';

interface TeamGridProps {
  teams: Team[];
  allPersonas: Persona[];
  onSelectTeam: (team: Team) => void;
  isLoading?: boolean;
  focusedIndex?: number;
  onFocusChange?: (index: number) => void;
  onEditTeam?: (team: Team) => void;
  onDeleteTeam?: (id: string) => void;
}

export function TeamGrid({ 
  teams, 
  allPersonas,
  onSelectTeam, 
  isLoading = false,
  focusedIndex = -1,
  onFocusChange,
  onEditTeam,
  onDeleteTeam,
}: TeamGridProps) {
  if (isLoading) {
    return <SkeletonGrid count={4} />;
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No teams yet. Create your first team to get started!
        </p>
      </div>
    );
  }

  const getTeamMembers = (team: Team): Persona[] => {
    return team.memberIds
      .map(id => allPersonas.find(p => p.id === id))
      .filter((p): p is Persona => p !== undefined);
  };

  return (
    <div 
      className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
      role="grid"
      aria-label="Team grid"
    >
      {teams.map((team, index) => (
        <div
          key={team.id}
          className={`animate-fade-in-up opacity-0 stagger-${(index % 8) + 1}`}
          role="gridcell"
        >
          <TeamCard
            team={team}
            members={getTeamMembers(team)}
            onClick={onSelectTeam}
            isFocused={focusedIndex === index}
            onFocus={() => onFocusChange?.(index)}
            onEdit={onEditTeam}
            onDelete={onDeleteTeam}
          />
        </div>
      ))}
    </div>
  );
}
