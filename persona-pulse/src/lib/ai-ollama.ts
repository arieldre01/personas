/**
 * Ollama AI Service (Phase 2)
 * 
 * Real implementation using local Ollama LLM.
 * 
 * To use this:
 * 1. Ensure Ollama is running: `ollama serve`
 * 2. Pull a model: `ollama pull phi3:mini` or `ollama pull mistral`
 * 3. Update ai-service.ts to use this implementation
 */

import { Message } from '@/components/ChatMessage';
import { AIService, GuidedResponse, FreeformResponse } from './ai-service';
import { personas, Persona } from './personas';

const OLLAMA_API_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'phi3:mini';

const SYSTEM_PROMPT = `You are a persona matching assistant. You help users discover which employee persona best matches their work style and preferences.

Available personas:
${personas.map(p => `- ${p.id}: ${p.name} (${p.title}) - ${p.psychology.motivation}`).join('\n')}

When matching, consider:
- Communication preferences
- Stress triggers
- Motivations
- Pain points

Always respond in a friendly, professional tone.`;

async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt: `${SYSTEM_PROMPT}\n\n${prompt}`,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return data.response || '';
}

function extractPersonaMatch(text: string): Persona | undefined {
  const lowerText = text.toLowerCase();
  return personas.find(p => lowerText.includes(p.id) || lowerText.includes(p.name.toLowerCase()));
}

export const ollamaService: AIService = {
  async startGuidedDiscovery(): Promise<GuidedResponse> {
    const response = await callOllama(
      'Start a guided discovery to help match the user with a persona. Ask them about their communication preferences. Provide 4-5 options.'
    );

    // Parse options from response (simplified - real implementation would be more robust)
    return {
      message: response,
      options: [
        'Quick bullet points',
        'Detailed reports with data',
        'Short videos or visuals',
        'Face-to-face conversations',
      ],
    };
  },

  async continueGuidedDiscovery(messages: Message[], answer: string): Promise<GuidedResponse> {
    const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const response = await callOllama(
      `Conversation so far:\n${context}\n\nUser answered: "${answer}"\n\nBased on all answers, either ask another question (if less than 4 answers) or provide a persona match with explanation.`
    );

    const matchedPersona = extractPersonaMatch(response);
    
    if (matchedPersona) {
      return {
        message: response,
        matchedPersona,
        confidence: 0.85,
      };
    }

    return {
      message: response,
      options: ['Option A', 'Option B', 'Option C', 'Option D'], // Would be parsed from response
    };
  },

  async analyzeFreeform(messages: Message[], text: string): Promise<FreeformResponse> {
    const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const response = await callOllama(
      `User description and conversation:\n${context}\n\nAnalyze this and match to a persona. If not enough information, ask a clarifying question. If enough info, provide the match with confidence percentage.`
    );

    const matchedPersona = extractPersonaMatch(response);
    const needsMoreInfo = response.toLowerCase().includes('?') && !matchedPersona;

    return {
      message: response,
      matchedPersona,
      confidence: matchedPersona ? 0.8 : 0,
      needsMoreInfo,
    };
  },
};

