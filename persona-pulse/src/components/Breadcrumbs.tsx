'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Persona, generationColors } from '@/lib/personas';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  persona?: Persona;
}

export function Breadcrumbs({ items, persona }: BreadcrumbsProps) {
  const colors = persona ? generationColors[persona.generation] : null;

  return (
    <nav 
      className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4"
      aria-label="Breadcrumb"
    >
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span 
              className={`font-medium ${
                colors ? colors.text : 'text-gray-900 dark:text-white'
              }`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}

      {/* Generation badge at the end */}
      {persona && (
        <span 
          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${colors?.badge} text-white`}
        >
          {persona.generation}
        </span>
      )}
    </nav>
  );
}

