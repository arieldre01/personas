/**
 * Custom Personas Storage
 * Manages user-created personas in localStorage
 */

import { Persona, Generation } from './personas';

export interface CustomPersona extends Persona {
  isCustom: true;
  createdAt: string;
  updatedAt: string;
  customAvatar?: string; // Base64 or URL for custom avatar
}

const STORAGE_KEY = 'custom-personas';

/**
 * Get all custom personas from localStorage
 */
export function getCustomPersonas(): CustomPersona[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom personas:', error);
  }
  
  return [];
}

/**
 * Save a new custom persona
 */
export function saveCustomPersona(persona: Omit<CustomPersona, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>): CustomPersona {
  const customPersonas = getCustomPersonas();
  
  const newPersona: CustomPersona = {
    ...persona,
    id: `custom-${Date.now()}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  customPersonas.push(newPersona);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPersonas));
  } catch (error) {
    console.error('Failed to save custom persona:', error);
  }
  
  return newPersona;
}

/**
 * Update an existing custom persona
 */
export function updateCustomPersona(id: string, updates: Partial<CustomPersona>): CustomPersona | null {
  const customPersonas = getCustomPersonas();
  const index = customPersonas.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  customPersonas[index] = {
    ...customPersonas[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPersonas));
  } catch (error) {
    console.error('Failed to update custom persona:', error);
  }
  
  return customPersonas[index];
}

/**
 * Delete a custom persona
 */
export function deleteCustomPersona(id: string): boolean {
  const customPersonas = getCustomPersonas();
  const filtered = customPersonas.filter(p => p.id !== id);
  
  if (filtered.length === customPersonas.length) return false;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete custom persona:', error);
    return false;
  }
}

/**
 * Get a single custom persona by ID
 */
export function getCustomPersonaById(id: string): CustomPersona | undefined {
  return getCustomPersonas().find(p => p.id === id);
}

/**
 * Export all custom personas as JSON string
 */
export function exportCustomPersonas(): string {
  return JSON.stringify(getCustomPersonas(), null, 2);
}

/**
 * Import custom personas from JSON string
 */
export function importCustomPersonas(json: string): CustomPersona[] {
  try {
    const imported = JSON.parse(json) as CustomPersona[];
    const existing = getCustomPersonas();
    
    // Merge, avoiding duplicates by ID
    const existingIds = new Set(existing.map(p => p.id));
    const newPersonas = imported.filter(p => !existingIds.has(p.id));
    
    const merged = [...existing, ...newPersonas];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    return merged;
  } catch (error) {
    console.error('Failed to import custom personas:', error);
    return [];
  }
}

/**
 * Create a blank persona template
 */
export function createBlankPersona(): Omit<CustomPersona, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    title: '',
    role: '',
    location: '',
    age: 30,
    generation: 'Gen Y' as Generation,
    tenure: '',
    imageQuery: '',
    quote: '',
    psychology: {
      stress: '',
      motivation: '',
      painPoints: [],
    },
    communication: {
      do: [],
      dont: [],
    },
  };
}

/**
 * Check if a persona is custom
 */
export function isCustomPersona(persona: Persona | CustomPersona): persona is CustomPersona {
  return 'isCustom' in persona && persona.isCustom === true;
}

