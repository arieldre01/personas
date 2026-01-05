import fs from 'fs';
import path from 'path';

/**
 * Load the knowledge file for a persona
 * Returns the markdown content as a string
 */
export function loadPersonaKnowledge(personaId: string): string {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'personas', `${personaId}.md`);
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to load knowledge for persona ${personaId}:`, error);
    return '';
  }
}

/**
 * Get all available persona knowledge files
 */
export function getAvailablePersonaKnowledge(): string[] {
  try {
    const dirPath = path.join(process.cwd(), 'src', 'data', 'personas');
    const files = fs.readdirSync(dirPath);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  } catch (error) {
    console.error('Failed to list persona knowledge files:', error);
    return [];
  }
}

