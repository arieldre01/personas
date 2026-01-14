'use client';

import { Scenario, getScenariosForPersona, difficultyColors } from '@/lib/scenarios';
import { Persona, generationColors } from '@/lib/personas';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, Target, ChevronRight } from 'lucide-react';

interface ScenarioListProps {
  persona: Persona;
  onSelectScenario: (scenario: Scenario) => void;
}

export function ScenarioList({ persona, onSelectScenario }: ScenarioListProps) {
  const scenarios = getScenariosForPersona(persona.id);
  const colors = generationColors[persona.generation];

  if (scenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">🎭</div>
        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
          No scenarios available
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">
          Scenarios for {persona.name} are coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Practice with {persona.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select a workplace scenario to role-play. Get real-time feedback on your communication.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            personaColors={colors}
            onClick={() => onSelectScenario(scenario)}
          />
        ))}
      </div>
    </div>
  );
}

interface ScenarioCardProps {
  scenario: Scenario;
  personaColors: typeof generationColors[keyof typeof generationColors];
  onClick: () => void;
}

function ScenarioCard({ scenario, personaColors, onClick }: ScenarioCardProps) {
  const diffColors = difficultyColors[scenario.difficulty];

  return (
    <Card
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] border-l-4 group ${personaColors.bg}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight">
            {scenario.title}
          </h4>
          <Badge className={`${diffColors.badge} text-white text-[10px] px-1.5 py-0 flex-shrink-0`}>
            {scenario.difficulty}
          </Badge>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
          {scenario.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{scenario.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{scenario.userRole}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </div>
      </div>
    </Card>
  );
}
