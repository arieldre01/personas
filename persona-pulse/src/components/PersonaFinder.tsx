'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FinderGuided } from './FinderGuided';
import { FinderFreeform } from './FinderFreeform';
import { Persona } from '@/lib/personas';
import { Compass, Sparkles, RotateCcw } from 'lucide-react';

interface PersonaFinderProps {
  open: boolean;
  onClose: () => void;
  onPersonaMatch: (persona: Persona) => void;
}

export function PersonaFinder({ open, onClose, onPersonaMatch }: PersonaFinderProps) {
  const [activeTab, setActiveTab] = useState<'guided' | 'freeform'>('freeform');
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  const handlePersonaMatch = (persona: Persona) => {
    onClose();
    onPersonaMatch(persona);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] h-[600px] max-w-2xl flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-purple-500" />
              Find Your Persona
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-500"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'guided' | 'freeform')}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="freeform" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Write Freely
            </TabsTrigger>
            <TabsTrigger value="guided" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Quick Questions
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="freeform" className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
              <FinderFreeform key={`freeform-${key}`} onPersonaMatch={handlePersonaMatch} />
            </TabsContent>

            <TabsContent value="guided" className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
              <FinderGuided key={`guided-${key}`} onPersonaMatch={handlePersonaMatch} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

