import { NextRequest, NextResponse } from 'next/server';
import { personas } from '@/lib/personas';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';

// Build a summary of all personas for the AI
const personaSummaries = personas.map(p => 
  `${p.id}: ${p.name} - "${p.title}" (${p.generation}, ${p.role})
   Quote: "${p.quote}"
   Stress: ${p.psychology.stress}
   Motivation: ${p.psychology.motivation}
   Pain Points: ${p.psychology.painPoints.join(', ')}`
).join('\n\n');

const SYSTEM_PROMPT = `You are an expert at matching people to workplace persona profiles. 
Based on the user's description of their work style, frustrations, and preferences, 
determine which persona matches them best.

Here are the available personas:

${personaSummaries}

INSTRUCTIONS:
1. Analyze the user's message for key traits: communication preferences, frustrations, motivations, and work style
2. Match them to the SINGLE best persona from the list above
3. Respond in this EXACT JSON format (nothing else):
{"personaId": "id_here", "confidence": 0.85, "reason": "Brief 1-2 sentence explanation"}

The personaId MUST be one of: maya, ben, oliver, priya, anna, sahil, ido, alex
The confidence should be between 0.5 and 0.95
Keep the reason brief and focused on the key matching traits.`;

export async function POST(request: NextRequest) {
  try {
    const { userText, context } = await request.json();

    if (!userText) {
      return NextResponse.json(
        { error: 'User text is required' },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = context 
      ? `Previous context:\n${context}\n\nLatest message: ${userText}`
      : userText;

    // Call Ollama API
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${SYSTEM_PROMPT}\n\nUser description: ${prompt}\n\nRespond with JSON only:`,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more consistent JSON output
          top_p: 0.9,
          num_predict: 150,
          num_ctx: 4096,
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
    const generatedText = data.response?.trim() || '';

    // Try to parse the JSON response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate the persona ID
        const validIds = personas.map(p => p.id);
        if (!validIds.includes(parsed.personaId)) {
          // Fallback to first persona if invalid
          parsed.personaId = 'maya';
          parsed.confidence = 0.6;
        }

        return NextResponse.json({
          personaId: parsed.personaId,
          confidence: Math.min(0.95, Math.max(0.5, parsed.confidence || 0.7)),
          reason: parsed.reason || 'Based on your description',
        });
      }
    } catch (parseError) {
      console.error('Failed to parse Ollama response as JSON:', generatedText);
    }

    // Fallback: use keyword matching if AI fails
    return NextResponse.json({
      personaId: 'maya',
      confidence: 0.6,
      reason: 'Based on general analysis of your work style',
    });

  } catch (error) {
    console.error('Persona match API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

