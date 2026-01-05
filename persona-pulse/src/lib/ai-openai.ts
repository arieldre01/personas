/**
 * OpenAI AI Service (Phase 2)
 * 
 * Real implementation using OpenAI API.
 * 
 * To use this:
 * 1. Get an API key from https://platform.openai.com
 * 2. Set NEXT_PUBLIC_OPENAI_API_KEY in .env.local
 * 3. Update ai-service.ts to use this implementation
 */

import { Message } from '@/components/ChatMessage';
import { AIService, GuidedResponse, FreeformResponse } from './ai-service';
import { personas, Persona } from './personas';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';

const SYSTEM_PROMPT = `You are a persona matching assistant. You help users discover which employee persona best matches their work style and preferences.

Available personas:
${personas.map(p => `- ${p.id}: ${p.name} (${p.title}) - ${p.psychology.motivation}`).join('\n')}

When matching, consider:
- Communication preferences
- Stress triggers  
- Motivations
- Pain points

Always respond in a friendly, professional tone. When you have enough information to match, include the persona ID in your response.`;

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Set NEXT_PUBLIC_OPENAI_API_KEY in .env.local');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractPersonaMatch(text: string): Persona | undefined {
  const lowerText = text.toLowerCase();
  return personas.find(p => lowerText.includes(p.id) || lowerText.includes(p.name.toLowerCase()));
}

export const openAIService: AIService = {
  async startGuidedDiscovery(): Promise<GuidedResponse> {
    const response = await callOpenAI([
      { role: 'user', content: 'Start a guided discovery to help me find my persona match. Ask me about my communication preferences and provide 4-5 options to choose from.' },
    ]);

    return {
      message: response,
      options: [
        'Quick bullet points',
        'Detailed reports with data',
        'Short videos or visuals',
        'Face-to-face conversations',
        'Mobile notifications',
      ],
    };
  },

  async continueGuidedDiscovery(messages: Message[], answer: string): Promise<GuidedResponse> {
    const openAIMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await callOpenAI([
      ...openAIMessages,
      { role: 'user', content: answer },
    ]);

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
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
    };
  },

  async analyzeFreeform(messages: Message[], text: string): Promise<FreeformResponse> {
    const openAIMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await callOpenAI([
      ...openAIMessages,
      { role: 'user', content: text },
    ]);

    const matchedPersona = extractPersonaMatch(response);
    const needsMoreInfo = response.includes('?') && !matchedPersona;

    return {
      message: response,
      matchedPersona,
      confidence: matchedPersona ? 0.85 : 0,
      needsMoreInfo,
    };
  },
};

