'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Persona, generationColors, getPersonaImage, getPersonaImagePosition } from '@/lib/personas';
import { Scenario, getScenarioCountForPersona } from '@/lib/scenarios';
import { PersonaChat } from './PersonaChat';
import { ScenarioList } from './ScenarioList';
import { ScenarioChat } from './ScenarioChat';
import {
  Quote,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  User,
  MessageCircle,
  X,
  Theater,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersonaDetailProps {
  persona: Persona | null;
  open: boolean;
  onClose: () => void;
}

export function PersonaDetail({ persona, open, onClose }: PersonaDetailProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'chat' | 'scenarios'>('profile');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!persona) return null;

  const colors = generationColors[persona.generation];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="h-[88vh] max-h-[800px] max-w-3xl overflow-hidden flex flex-col p-0">
        <div className={`flex-shrink-0 ${colors.bg} px-4 py-3 relative`}>
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
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPersonaImage(persona)}
                alt={persona.name}
                className="h-full w-full object-cover"
                style={{ objectPosition: getPersonaImagePosition(persona) }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogHeader className="p-0">
                  <DialogTitle className="text-lg font-bold truncate">
                    {persona.name}
                  </DialogTitle>
                </DialogHeader>
                <Badge className={`${colors.badge} text-white text-xs px-2 py-0`}>
                  {persona.generation}
                </Badge>
              </div>
              <p className={`text-sm font-medium ${colors.text} truncate`}>
                {persona.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                <span>{persona.role}</span>
                <span>•</span>
                <span>{persona.location}</span>
                <span>•</span>
                <span>Age {persona.age}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as 'profile' | 'chat' | 'scenarios');
            if (v !== 'scenarios') {
              setSelectedScenario(null);
            }
          }}
          className="flex-1 flex flex-col min-h-0 px-4 pb-4"
        >
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0 mt-2 h-9">
            <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs py-1.5">
              <User className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1.5 text-xs py-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-1.5 text-xs py-1.5">
              <Theater className="h-3.5 w-3.5" />
              Scenarios
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {getScenarioCountForPersona(persona.id)}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="flex-1 overflow-y-auto mt-3 pr-2">
            <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex gap-3">
                <Quote className={`h-6 w-6 flex-shrink-0 ${colors.text}`} />
                <p className="text-lg italic text-gray-700 dark:text-gray-300">
                  &ldquo;{persona.quote}&rdquo;
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Brain className={`h-5 w-5 ${colors.text}`} />
                Psychological Profile
              </h3>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Stress Triggers
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {persona.psychology.stress}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
                    <Zap className="h-4 w-4" />
                    Motivation
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {persona.psychology.motivation}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    Pain Points
                  </div>
                  <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                    {persona.psychology.painPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MessageSquare className={`h-5 w-5 ${colors.text}`} />
                Communication Protocol
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
                  <div className="mb-3 flex items-center gap-2 font-medium text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-5 w-5" />
                    Do&apos;s
                  </div>
                  <ul className="space-y-2">
                    {persona.communication.do.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
                  <div className="mb-3 flex items-center gap-2 font-medium text-red-700 dark:text-red-300">
                    <XCircle className="h-5 w-5" />
                    Don&apos;ts
                  </div>
                  <ul className="space-y-2">
                    {persona.communication.dont.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 mt-2 overflow-hidden" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <PersonaChat persona={persona} />
          </TabsContent>

          <TabsContent value="scenarios" className="flex-1 min-h-0 mt-2 flex flex-col overflow-hidden">
            {selectedScenario ? (
              <ScenarioChat
                scenario={selectedScenario}
                persona={persona}
                onBack={() => setSelectedScenario(null)}
              />
            ) : (
              <ScenarioList
                persona={persona}
                onSelectScenario={(scenario) => setSelectedScenario(scenario)}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
