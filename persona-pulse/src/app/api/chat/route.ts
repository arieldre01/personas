import { NextRequest } from 'next/server';
import { loadPersonaKnowledge } from '@/lib/persona-knowledge';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';

export async function POST(request: NextRequest) {
  try {
    const { message, personaContext, personaId, stream = true } = await request.json();

    if (!message || !personaContext) {
      return new Response(
        JSON.stringify({ error: 'Message and persona context are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Load extended knowledge for the persona if available
    let knowledgeContext = '';
    if (personaId) {
      const knowledge = loadPersonaKnowledge(personaId);
      if (knowledge) {
        knowledgeContext = `\n\nEXTENDED KNOWLEDGE BASE:\n${knowledge}`;
      }
    }

    // Build the full context with knowledge
    const fullContext = `${personaContext}${knowledgeContext}`;
    const prompt = `${fullContext}\n\nUser: ${message}\n\n${personaContext.split('\n')[0].replace('You are ', '')}:`;

    // Call Ollama API with streaming
    const ollamaResponse = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: stream,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 150,
          num_ctx: 4096,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from Ollama', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If streaming is disabled, return the full response
    if (!stream) {
      const data = await ollamaResponse.json();
      let generatedResponse = data.response?.trim() || '';
      
      // Remove surrounding quotes if the model wrapped the response
      if ((generatedResponse.startsWith('"') && generatedResponse.endsWith('"')) ||
          (generatedResponse.startsWith("'") && generatedResponse.endsWith("'"))) {
        generatedResponse = generatedResponse.slice(1, -1);
      }

      return new Response(
        JSON.stringify({ response: generatedResponse }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response using SSE
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let fullResponse = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.response) {
                  fullResponse += json.response;
                  // Send the token as SSE
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: json.response })}\n\n`));
                }
                if (json.done) {
                  // Clean up the full response
                  let cleaned = fullResponse.trim();
                  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
                      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
                    cleaned = cleaned.slice(1, -1);
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse: cleaned })}\n\n`));
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
