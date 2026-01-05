import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';

interface Answer {
  field: string;
  question: string;
  answer: string;
}

export async function POST(request: NextRequest) {
  try {
    const { currentPersona, answers } = await request.json();

    if (!currentPersona || !answers) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Build the prompt with current persona and answers
    const answersText = answers
      .map((a: Answer) => `${a.question}\nAnswer: ${a.answer}`)
      .join('\n\n');

    const prompt = `You are helping complete a workplace persona profile.

Current persona data:
${JSON.stringify(currentPersona, null, 2)}

Additional information provided:
${answersText}

Based on the additional information, update the persona with the new data.
Return ONLY a JSON object with the updated fields (not the entire persona, just the fields that need updating).

For example, if the answer provides the name "Sarah" and the stress trigger is "tight deadlines", return:
{
  "name": "Sarah",
  "psychology": {
    "stress": "tight deadlines"
  }
}

JSON response:`;

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 500,
          num_ctx: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error:', errorText);
      
      // Fall back to simple parsing without AI
      return NextResponse.json({
        persona: parseAnswersSimple(currentPersona, answers),
      });
    }

    const data = await response.json();
    let generatedText = data.response?.trim() || '';

    try {
      // Find JSON in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const updates = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ persona: updates });
      } else {
        // Fall back to simple parsing
        return NextResponse.json({
          persona: parseAnswersSimple(currentPersona, answers),
        });
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({
        persona: parseAnswersSimple(currentPersona, answers),
      });
    }
  } catch (error) {
    console.error('Complete persona error:', error);
    return NextResponse.json({
      error: 'Failed to complete persona',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

// Simple fallback parsing without AI
function parseAnswersSimple(currentPersona: Record<string, unknown>, answers: Answer[]) {
  const updates: Record<string, unknown> = {};

  for (const answer of answers) {
    if (!answer.answer.trim()) continue;

    switch (answer.field) {
      case 'name':
        updates.name = answer.answer.trim();
        break;
      case 'role':
        updates.role = answer.answer.trim();
        break;
      case 'psychology.stress':
        updates.psychology = {
          ...(currentPersona.psychology as Record<string, unknown> || {}),
          ...(updates.psychology as Record<string, unknown> || {}),
          stress: answer.answer.trim(),
        };
        break;
      case 'psychology.motivation':
        updates.psychology = {
          ...(currentPersona.psychology as Record<string, unknown> || {}),
          ...(updates.psychology as Record<string, unknown> || {}),
          motivation: answer.answer.trim(),
        };
        break;
      default:
        // Handle nested fields generically
        if (answer.field.includes('.')) {
          const [parent, child] = answer.field.split('.');
          updates[parent] = {
            ...(currentPersona[parent] as Record<string, unknown> || {}),
            ...(updates[parent] as Record<string, unknown> || {}),
            [child]: answer.answer.trim(),
          };
        } else {
          updates[answer.field] = answer.answer.trim();
        }
    }
  }

  return updates;
}

