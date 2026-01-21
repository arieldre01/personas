import { NextRequest } from 'next/server';
import { loadPersonaKnowledge } from '@/lib/persona-knowledge';
import { getPersonaById } from '@/lib/personas';
import {
  generateText,
  generateTextStream,
  buildPersonaSystemInstruction,
  getActiveProvider,
} from '@/lib/ai-provider';
import {
  ChatMessage,
  buildConversationWindow,
  formatConversationContext,
} from '@/lib/conversation-manager';

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      personaContext, 
      personaId, 
      stream = true,
      scenarioContext,
      messages: messageHistory, // NEW: Structured message array for token efficiency
    } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get persona data and build system instruction (now optimized/compressed)
    const persona = personaId ? getPersonaById(personaId) : null;
    let systemInstruction = personaContext || '';
    
    if (persona) {
      // Load extended knowledge if available
      const extendedKnowledge = loadPersonaKnowledge(personaId);
      systemInstruction = buildPersonaSystemInstruction(persona, extendedKnowledge);
      
      // Add scenario context if provided (compressed version)
      if (scenarioContext) {
        systemInstruction += `\n\n[SCENARIO] ${scenarioContext}\nStay in character. React authentically. 2-4 sentences.`;
      }
    }

    // Build conversation history using sliding window for token efficiency
    let conversationHistory: string | undefined;
    
    if (messageHistory && Array.isArray(messageHistory) && messageHistory.length > 0) {
      // NEW: Use efficient windowed history
      const window = buildConversationWindow(messageHistory as ChatMessage[]);
      conversationHistory = formatConversationContext(window, persona?.name || 'Assistant');
    } else if (personaContext?.includes('User:')) {
      // LEGACY: Fall back to old format for backwards compatibility
      conversationHistory = personaContext.split('\n\n').filter((line: string) => 
        line.startsWith('User:') || line.startsWith('Assistant:')
      ).join('\n');
    }

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
