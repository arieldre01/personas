import { NextRequest } from 'next/server';
import { loadPersonaKnowledge } from '@/lib/persona-knowledge';
import { getPersonaById } from '@/lib/personas';
import {
  generateText,
  generateTextStream,
  buildPersonaSystemInstruction,
  getActiveProvider,
} from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      personaContext, 
      personaId, 
      stream = true,
      scenarioContext,
    } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get persona data and build system instruction
    const persona = personaId ? getPersonaById(personaId) : null;
    let systemInstruction = personaContext || '';
    
    if (persona) {
      // Load extended knowledge if available
      const extendedKnowledge = loadPersonaKnowledge(personaId);
      systemInstruction = buildPersonaSystemInstruction(persona, extendedKnowledge);
      
      // Add scenario context if provided - this enhances role-play mode
      if (scenarioContext) {
        systemInstruction += `

=== ACTIVE ROLE-PLAY SCENARIO ===
${scenarioContext}

SCENARIO RULES (CRITICAL):
1. You are IN this scenario right now. This is happening live.
2. Respond as ${persona.name} would respond in THIS specific situation.
3. Use your defined psychology and communication style from above.
4. React authentically to what the user says - show emotions, concerns, or enthusiasm as appropriate.
5. Reference specific details from the scenario context when relevant.
6. Stay in the moment - don't break character or acknowledge this is a training exercise.
7. Keep responses natural and conversational (2-4 sentences typically).
=== END SCENARIO ===`;
      }
    }

    // Extract conversation history from personaContext if it contains previous messages
    const conversationHistory = personaContext?.includes('User:') 
      ? personaContext.split('\n\n').filter((line: string) => 
          line.startsWith('User:') || line.startsWith('Assistant:')
        ).join('\n')
      : undefined;

    // Streaming response
    if (stream) {
      try {
        const { stream: responseStream, provider } = await generateTextStream(
          systemInstruction,
          message,
          conversationHistory
        );

        return new Response(responseStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-AI-Provider': provider,
          },
        });
      } catch (streamError) {
        console.error('Stream generation failed:', streamError);
        // Fall through to non-streaming
      }
    }

    // Non-streaming response
    const { text, provider } = await generateText(
      systemInstruction,
      message,
      conversationHistory
    );

    return new Response(
      JSON.stringify({ response: text, provider }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET endpoint to check which AI provider is active
export async function GET() {
  const providerInfo = await getActiveProvider();
  return new Response(
    JSON.stringify(providerInfo),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
