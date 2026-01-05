import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';

export async function POST(request: NextRequest) {
  try {
    const { message, personaContext } = await request.json();

    if (!message || !personaContext) {
      return NextResponse.json(
        { error: 'Message and persona context are required' },
        { status: 400 }
      );
    }

    // Call Ollama API
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${personaContext}\n\nUser: ${message}\n\n${personaContext.split('\n')[0].replace('You are ', '')}:`,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          num_predict: 150, // Keep responses concise
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get response from Ollama', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedResponse = data.response?.trim() || '';

    return NextResponse.json({ response: generatedResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

