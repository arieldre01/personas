import { NextRequest } from 'next/server';
import { getPersonaById } from '@/lib/personas';

interface Message {
  role: 'user' | 'persona';
  content: string;
}

interface ScenarioInfo {
  title: string;
  userGoal: string;
  evaluationCriteria: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { messages, scenario, personaId } = await request.json();

    if (!messages || !scenario || !personaId) {
      return new Response(
        JSON.stringify({ error: 'Messages, scenario, and persona ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const persona = getPersonaById(personaId);
    if (!persona) {
      return new Response(
        JSON.stringify({ error: 'Persona not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const feedback = await evaluateConversation(messages, scenario, persona.name);

    return new Response(JSON.stringify(feedback), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scenario feedback API error:', error);
    return new Response(
      JSON.stringify({
        score: 3,
        summary: 'Thanks for completing the scenario!',
        strengths: ['Engaged with the conversation'],
        improvements: ['Keep practicing'],
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function evaluateConversation(
  messages: Message[],
  scenario: ScenarioInfo,
  personaName: string
): Promise<{ score: number; summary: string; strengths: string[]; improvements: string[] }> {
  
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : personaName}: ${m.content}`)
    .join('\n');

  const evaluationPrompt = `You are an expert communication coach. Evaluate this workplace conversation.

SCENARIO: ${scenario.title}
USER'S GOAL: ${scenario.userGoal}

EVALUATION CRITERIA:
${scenario.evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

CONVERSATION:
${conversationText}

Evaluate the USER's communication (not the persona's). Be encouraging but honest.

Respond in this exact JSON format:
{
  "score": <number 1-5>,
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}

Only output the JSON.`;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: evaluationPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            score: Math.min(5, Math.max(1, parsed.score || 3)),
            summary: parsed.summary || 'Good effort!',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
          };
        }
      }
    } catch (error) {
      console.error('Gemini evaluation error:', error);
    }
  }

  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'phi3:mini';

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: evaluationPrompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 500 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.response || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(5, Math.max(1, parsed.score || 3)),
          summary: parsed.summary || 'Good effort!',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
        };
      }
    }
  } catch (error) {
    console.error('Ollama evaluation error:', error);
  }

  const userMessages = messages.filter(m => m.role === 'user');
  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / (userMessages.length || 1);
  
  let score = 3;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (userMessages.length >= 3) { strengths.push('Engaged in a meaningful conversation'); score += 0.5; }
  if (avgLength > 50) { strengths.push('Provided detailed responses'); score += 0.5; }
  if (userMessages.some(m => m.content.includes('?'))) { strengths.push('Asked questions'); score += 0.5; }
  if (userMessages.length < 3) improvements.push('Try engaging more deeply');
  if (avgLength < 30) improvements.push('Consider more detailed responses');

  return {
    score: Math.min(5, Math.max(1, Math.round(score))),
    summary: `You completed the "${scenario.title}" scenario. ${strengths.length > 0 ? 'Good job!' : 'Keep practicing!'}`,
    strengths: strengths.length > 0 ? strengths : ['Completed the scenario'],
    improvements: improvements.length > 0 ? improvements : ['Practice asking open-ended questions'],
  };
}