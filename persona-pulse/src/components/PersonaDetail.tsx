'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Persona, generationColors, getPersonaImage } from '@/lib/personas';
import { PersonaChat } from './PersonaChat';
import {
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Quote,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  User,
  MessageCircle,
} from 'lucide-react';

interface PersonaDetailProps {
  persona: Persona | null;
  open: boolean;
  onClose: () => void;
}

export function PersonaDetail({ persona, open, onClose }: PersonaDetailProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'chat'>('profile');

  if (!persona) return null;

  const colors = generationColors[persona.generation];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          {/* Profile Header */}
          <div className={`-mx-6 -mt-6 mb-4 ${colors.bg} p-6`}>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPersonaImage(persona)}
                  alt={persona.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl font-bold">
                    {persona.name}
                  </DialogTitle>
                  <Badge className={`${colors.badge} text-white`}>
                    {persona.generation}
                  </Badge>
                </div>
                <p className={`mt-1 text-lg font-medium ${colors.text}`}>
                  {persona.title}
                </p>

                {/* Quick Stats */}
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span className="text-xs">{persona.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{persona.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">Age {persona.age}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{persona.tenure}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'profile' | 'chat')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat with {persona.name}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="flex-1 overflow-y-auto mt-4 pr-2">
            {/* Quote */}
            <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex gap-3">
                <Quote className={`h-6 w-6 flex-shrink-0 ${colors.text}`} />
                <p className="text-lg italic text-gray-700 dark:text-gray-300">
                  &ldquo;{persona.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Psychological Profile */}
            <div className="mb-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Brain className={`h-5 w-5 ${colors.text}`} />
                Psychological Profile
              </h3>

              <div className="space-y-4">
                {/* Stress */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Stress Triggers
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {persona.psychology.stress}
                  </p>
                </div>

                {/* Motivation */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
                    <Zap className="h-4 w-4" />
                    Motivation
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {persona.psychology.motivation}
                  </p>
                </div>

                {/* Pain Points */}
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

            {/* Communication Protocol */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MessageSquare className={`h-5 w-5 ${colors.text}`} />
                Communication Protocol
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Do's */}
                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
                  <div className="mb-3 flex items-center gap-2 font-medium text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-5 w-5" />
                    Do&apos;s
                  </div>
                  <ul className="space-y-2">
                    {persona.communication.do.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
                  <div className="mb-3 flex items-center gap-2 font-medium text-red-700 dark:text-red-300">
                    <XCircle className="h-5 w-5" />
                    Don&apos;ts
                  </div>
                  <ul className="space-y-2">
                    {persona.communication.dont.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col min-h-0">
            <PersonaChat persona={persona} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
