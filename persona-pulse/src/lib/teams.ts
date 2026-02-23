/**
 * Teams Storage
 * Manages user-created teams in localStorage
 */

export interface Team {
  id: string;
  name: string;
  description?: string;
  memberIds: string[]; // Persona IDs (existing or custom)
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'persona-teams';

/**
 * Get all teams from localStorage
 */
export function getTeams(): Team[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load teams:', error);
  }
  
  return [];
}

/**
 * Save a new team
 */
export function saveTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Team {
  const teams = getTeams();
  
  const newTeam: Team = {
    ...team,
    id: `team-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  teams.push(newTeam);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch (error) {
    console.error('Failed to save team:', error);
  }
  
  return newTeam;
}

/**
 * Update an existing team
 */
export function updateTeam(id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>): Team | null {
  const teams = getTeams();
  const index = teams.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  teams[index] = {
    ...teams[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch (error) {
    console.error('Failed to update team:', error);
  }
  
  return teams[index];
}

/**
 * Delete a team
 */
export function deleteTeam(id: string): boolean {
  const teams = getTeams();
  const filtered = teams.filter(t => t.id !== id);
  
  if (filtered.length === teams.length) return false;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete team:', error);
    return false;
  }
}

/**
 * Get a single team by ID
 */
export function getTeamById(id: string): Team | undefined {
  return getTeams().find(t => t.id === id);
}

/**
 * Add a member to a team
 */
export function addTeamMember(teamId: string, personaId: string): Team | null {
  const team = getTeamById(teamId);
  if (!team) return null;
  
  if (team.memberIds.includes(personaId)) {
    return team; // Already a member
  }
  
  return updateTeam(teamId, {
    memberIds: [...team.memberIds, personaId],
  });
}

/**
 * Remove a member from a team
 */
export function removeTeamMember(teamId: string, personaId: string): Team | null {
  const team = getTeamById(teamId);
  if (!team) return null;
  
  return updateTeam(teamId, {
    memberIds: team.memberIds.filter(id => id !== personaId),
  });
}

/**
 * Create a blank team template
 */
export function createBlankTeam(): Omit<Team, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    memberIds: [],
  };
}
