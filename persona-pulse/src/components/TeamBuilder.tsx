'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Persona, getPersonaImage } from '@/lib/personas';
import { Team, saveTeam, updateTeam, createBlankTeam } from '@/lib/teams';
import { 
  Users, 
  Plus,
  X,
  Save,
  Search,
  UserPlus,
  Check,
} from 'lucide-react';

interface TeamBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (team: Team) => void;
  editTeam?: Team | null;
  availablePersonas: Persona[];
  onCreatePersona?: () => void;
}

export function TeamBuilder({ 
  open, 
  onClose, 
  onSave, 
  editTeam,
  availablePersonas,
  onCreatePersona,
}: TeamBuilderProps) {
  const [formData, setFormData] = useState(() => 
    editTeam ? { name: editTeam.name, description: editTeam.description || '', memberIds: [...editTeam.memberIds] } : createBlankTeam()
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Reset form when dialog opens/closes or editTeam changes
  useState(() => {
    if (open) {
      if (editTeam) {
        setFormData({ name: editTeam.name, description: editTeam.description || '', memberIds: [...editTeam.memberIds] });
      } else {
        setFormData(createBlankTeam());
      }
    }
  });

  const filteredPersonas = useMemo(() => {
    if (!searchQuery.trim()) return availablePersonas;
    const query = searchQuery.toLowerCase();
    return availablePersonas.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query)
    );
  }, [availablePersonas, searchQuery]);

  const selectedMembers = useMemo(() => {
    return formData.memberIds
      .map(id => availablePersonas.find(p => p.id === id))
      .filter((p): p is Persona => p !== undefined);
  }, [formData.memberIds, availablePersonas]);

  const toggleMember = (personaId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(personaId)
        ? prev.memberIds.filter(id => id !== personaId)
        : [...prev.memberIds, personaId],
    }));
  };

  const removeMember = (personaId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.filter(id => id !== personaId),
    }));
  };

  const handleSave = () => {
    let savedTeam: Team;
    
    if (editTeam) {
      savedTeam = updateTeam(editTeam.id, {
        name: formData.name,
        description: formData.description,
        memberIds: formData.memberIds,
      }) as Team;
    } else {
      savedTeam = saveTeam({
        name: formData.name,
        description: formData.description,
        memberIds: formData.memberIds,
      });
    }

    onSave(savedTeam);
    handleClose();
  };

  const handleClose = () => {
    setFormData(createBlankTeam());
    setSearchQuery('');
    onClose();
  };

  const isValid = formData.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            {editTeam ? 'Edit Team' : 'Create New Team'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-1">
          {/* Team Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Marketing Team"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What is this team about?"
                rows={2}
              />
            </div>
          </div>

          {/* Selected Members */}
          <div>
            <Label className="mb-2 block">
              Team Members ({selectedMembers.length})
            </Label>
            {selectedMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPersonaImage(member)}
                      alt={member.name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{member.name}</span>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No members selected yet. Add members from the list below.
              </p>
            )}
          </div>

          {/* Add Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Add Members</Label>
              {onCreatePersona && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreatePersona}
                  className="gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Create New Persona
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search personas..."
                className="pl-9"
              />
            </div>

            {/* Persona List */}
            <div className="border rounded-lg max-h-[250px] overflow-y-auto">
              {filteredPersonas.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No personas found
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {filteredPersonas.map((persona) => {
                    const isSelected = formData.memberIds.includes(persona.id);
                    return (
                      <button
                        key={persona.id}
                        onClick={() => toggleMember(persona.id)}
                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getPersonaImage(persona)}
                            alt={persona.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {persona.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {persona.generation}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {persona.role}
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="gap-1 bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Save className="h-4 w-4" />
            {editTeam ? 'Save Changes' : 'Create Team'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
