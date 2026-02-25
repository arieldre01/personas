'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonaGrid } from '@/components/PersonaGrid';
import { PersonaDetail } from '@/components/PersonaDetail';
import { PersonaFinder } from '@/components/PersonaFinder';
import { PersonaBuilder } from '@/components/PersonaBuilder';
import { MultiPersonaChat } from '@/components/MultiPersonaChat';
import { TeamGrid } from '@/components/TeamGrid';
import { TeamBuilder } from '@/components/TeamBuilder';
import { TeamDetail } from '@/components/TeamDetail';
import { personas, Persona, generationColors, Generation } from '@/lib/personas';
import { amdocsPersonas } from '@/lib/amdocs-personas';
import { getCustomPersonas, CustomPersona, deleteCustomPersona } from '@/lib/custom-personas';
import { Team, getTeams, deleteTeam } from '@/lib/teams';
import { Compass, Users, Sparkles, Github, Plus, Building2, FlaskConical, MessageCircle, UsersRound, User, Search, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

type PersonaSet = 'amdocs' | 'mock';
type ViewMode = 'personas' | 'teams';

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [multiChatOpen, setMultiChatOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<CustomPersona | null>(null);
  const [customPersonas, setCustomPersonas] = useState<CustomPersona[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [personaSet, setPersonaSet] = useState<PersonaSet>('amdocs');
  const [viewMode, setViewMode] = useState<ViewMode>('personas');
  
  // Team state
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDetailOpen, setTeamDetailOpen] = useState(false);
  const [teamBuilderOpen, setTeamBuilderOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [groupChatPersonas, setGroupChatPersonas] = useState<Persona[]>([]);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGeneration, setFilterGeneration] = useState<Generation | 'All'>('All');

  // Load custom personas and teams on mount
  useEffect(() => {
    setCustomPersonas(getCustomPersonas());
    setTeams(getTeams());
  }, []);

  // Get the base personas based on selected set
  const basePersonas = personaSet === 'amdocs' ? amdocsPersonas : personas;
  
  // Merge base and custom personas
  const allPersonas = [...basePersonas, ...customPersonas] as Persona[];

  // Filtered personas for the grid
  const filteredPersonas = allPersonas.filter(p => {
    const matchesGen = filterGeneration === 'All' || p.generation === filterGeneration;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGen && matchesSearch;
  });

  const hasActiveFilters = searchQuery !== '' || filterGeneration !== 'All';

  // Calculate grid columns based on screen size (matching the grid layout)
  const getColumnsCount = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3;  // md
    return 2; // default
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (detailOpen || finderOpen || builderOpen) return; // Don't navigate when modals are open
    
    const cols = getColumnsCount();
    const total = allPersonas.length;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % total);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + total) % total);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + cols;
          return next >= total ? prev % cols : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - cols;
          return next < 0 ? prev + Math.floor((total - 1) / cols) * cols : next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < total) {
          handleSelectPersona(allPersonas[focusedIndex]);
        }
        break;
    }
  }, [detailOpen, finderOpen, builderOpen, focusedIndex, filteredPersonas]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setDetailOpen(true);
  };

  const handlePersonaMatch = (persona: Persona) => {
    setSelectedPersona(persona);
    setDetailOpen(true);
  };

  const handleCreatePersona = () => {
    setEditingPersona(null);
    setBuilderOpen(true);
  };

  const handleEditPersona = (persona: CustomPersona) => {
    setEditingPersona(persona);
    setBuilderOpen(true);
  };

  const handleDeletePersona = (id: string) => {
    if (confirm('Are you sure you want to delete this persona?')) {
      deleteCustomPersona(id);
      setCustomPersonas(getCustomPersonas());
    }
  };

  const handlePersonaSaved = () => {
    setCustomPersonas(getCustomPersonas());
  };

  // Team handlers
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setTeamDetailOpen(true);
  };

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setTeamBuilderOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamBuilderOpen(true);
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      deleteTeam(id);
      setTeams(getTeams());
    }
  };

  const handleTeamSaved = () => {
    setTeams(getTeams());
  };

  const handleStartGroupChat = (members: Persona[]) => {
    setGroupChatPersonas(members);
    setMultiChatOpen(true);
  };

  const handleViewPersonaFromTeam = (persona: Persona) => {
    setSelectedPersona(persona);
    setDetailOpen(true);
  };

  const getTeamMembers = (team: Team): Persona[] => {
    return team.memberIds
      .map(id => allPersonas.find(p => p.id === id))
      .filter((p): p is Persona => p !== undefined);
  };

  return (
    <div className="min-h-screen hero-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 text-white shadow-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Persona Pulse</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Explorer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Persona Set Toggle */}
            <div className="flex items-center rounded-full border bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => setPersonaSet('amdocs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  personaSet === 'amdocs'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Amdocs
              </button>
              <button
                onClick={() => setPersonaSet('mock')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  personaSet === 'mock'
                    ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FlaskConical className="h-4 w-4" />
                Mock
              </button>
            </div>

            <Button
              onClick={() => {
                setGroupChatPersonas([]);
                setMultiChatOpen(true);
              }}
              variant="outline"
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Group Chat
            </Button>
            {viewMode === 'personas' ? (
              <Button
                onClick={handleCreatePersona}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Persona
              </Button>
            ) : (
              <Button
                onClick={handleCreateTeam}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Team
              </Button>
            )}
            <Button
              onClick={() => setFinderOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 shadow-lg shadow-purple-500/25"
            >
              <Compass className="h-4 w-4" />
              Find Your Persona
            </Button>
            <ThemeToggle />
            <a
              href="https://github.com/arieldre01/personas"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <Sparkles className="mr-1 h-3 w-3" />
            Interactive Employee Personas
          </Badge>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Understand Your{' '}
            <span className="animated-gradient-text">
              Team&apos;s Pulse
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Explore employee personas, understand their psychology, and <strong>have real conversations</strong> with them.
            Practice your communication skills, discover your own style, and learn how to connect with every type.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setFinderOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600"
            >
              <Compass className="h-5 w-5" />
              Discover My Persona
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById('personas')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Users className="mr-2 h-5 w-5" />
              Browse All Personas
            </Button>
          </div>
        </div>

        {/* Generation Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {(['Gen Z', 'Gen Y', 'Gen X', 'Boomer'] as const).map((gen) => (
            <div
              key={gen}
              className={`flex items-center gap-2 rounded-full px-4 py-2 ${generationColors[gen].bg} ${generationColors[gen].border} border`}
            >
              <div className={`h-3 w-3 rounded-full ${generationColors[gen].badge}`} />
              <span className={`text-sm font-medium ${generationColors[gen].text}`}>
                {gen}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Personas/Teams Section */}
      <section id="personas" className="container mx-auto px-4 pb-20">
        {/* View Mode Toggle */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center rounded-full border bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => setViewMode('personas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'personas'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <User className="h-4 w-4" />
                Personas
              </button>
              <button
                onClick={() => setViewMode('teams')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'teams'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <UsersRound className="h-4 w-4" />
                Teams
              </button>
            </div>
          </div>

          <div className="text-center">
            {viewMode === 'personas' ? (
              <>
                <h2 className="text-2xl font-bold">Meet the Personas</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Click on any persona to explore their profile and start a conversation
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Tip: Use arrow keys to navigate, Enter to select
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Your Teams</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Create teams to group personas and start group conversations
                </p>
              </>
            )}
          </div>
        </div>

        {viewMode === 'personas' ? (
          <>
            {/* Search & Filter Bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Generation pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setFilterGeneration('All')}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    filterGeneration === 'All'
                      ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-800 dark:border-gray-100'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                >
                  All
                </button>
                {(['Gen Z', 'Gen Y', 'Gen X', 'Boomer'] as Generation[]).map(gen => {
                  const colors = generationColors[gen];
                  const active = filterGeneration === gen;
                  return (
                    <button
                      key={gen}
                      onClick={() => setFilterGeneration(active ? 'All' : gen)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                        active
                          ? `${colors.badge} text-white border-transparent`
                          : `bg-white dark:bg-gray-900 ${colors.border} ${colors.text} hover:${colors.bg}`
                      }`}
                    >
                      {gen}
                    </button>
                  );
                })}
              </div>

              {/* Result count + reset */}
              <div className="flex items-center gap-2 ml-auto shrink-0">
                {hasActiveFilters && (
                  <>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {filteredPersonas.length} of {allPersonas.length}
                    </span>
                    <button
                      onClick={() => { setSearchQuery(''); setFilterGeneration('All'); }}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            <PersonaGrid 
              personas={filteredPersonas} 
              onSelectPersona={handleSelectPersona}
              focusedIndex={focusedIndex}
              onFocusChange={setFocusedIndex}
              onEditPersona={handleEditPersona}
              onDeletePersona={handleDeletePersona}
            />
          </>
        ) : (
          <TeamGrid
            teams={teams}
            allPersonas={allPersonas}
            onSelectTeam={handleSelectTeam}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
          />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Persona Pulse Explorer</span>
            </div>
            <p className="text-sm text-gray-500">
              Built with Next.js, Tailwind CSS, and Shadcn UI
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PersonaDetail
        persona={selectedPersona}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <PersonaFinder
        open={finderOpen}
        onClose={() => setFinderOpen(false)}
        onPersonaMatch={handlePersonaMatch}
        personaSet={personaSet}
      />

      <PersonaBuilder
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setEditingPersona(null);
        }}
        onSave={handlePersonaSaved}
        editPersona={editingPersona}
      />

      <MultiPersonaChat
        open={multiChatOpen}
        onClose={() => {
          setMultiChatOpen(false);
          setGroupChatPersonas([]);
        }}
        initialPersonas={groupChatPersonas}
        availablePersonas={allPersonas}
      />

      <TeamBuilder
        open={teamBuilderOpen}
        onClose={() => {
          setTeamBuilderOpen(false);
          setEditingTeam(null);
        }}
        onSave={handleTeamSaved}
        editTeam={editingTeam}
        availablePersonas={allPersonas}
        onCreatePersona={() => {
          setTeamBuilderOpen(false);
          handleCreatePersona();
        }}
      />

      <TeamDetail
        team={selectedTeam}
        members={selectedTeam ? getTeamMembers(selectedTeam) : []}
        open={teamDetailOpen}
        onClose={() => setTeamDetailOpen(false)}
        onStartGroupChat={handleStartGroupChat}
        onViewPersona={handleViewPersonaFromTeam}
      />
    </div>
  );
}
