import { NextRequest, NextResponse } from 'next/server';
import { personas } from '@/lib/personas';
import { generateText, isGeminiAvailable, isOllamaAvailable } from '@/lib/ai-provider';

// Keyword-based persona matching profiles for fallback
const personaKeywords: Record<string, { keywords: string[]; weight: number }[]> = {
  sarah: [
    { keywords: ['manager', 'team lead', 'leading', 'management', 'supervise'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties', '42', '43', '44'], weight: 3 },
    { keywords: ['engineering', 'software', 'tech', 'developer'], weight: 2 },
    { keywords: ['calendar', 'meetings', 'scheduling'], weight: 2 },
  ],
  marcus: [
    { keywords: ['product', 'strategy', 'data', 'analytics', 'research'], weight: 4 },
    { keywords: ['30s', 'millennial', 'gen y', 'thirties'], weight: 3 },
    { keywords: ['decisions', 'evidence', 'validation'], weight: 2 },
  ],
  david: [
    { keywords: ['field', 'travel', 'mobile', 'on the go', 'consultant'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties', '48'], weight: 3 },
    { keywords: ['client', 'remote', 'airport'], weight: 2 },
  ],
  zoe: [
    { keywords: ['design', 'ux', 'creative', 'visual', 'user experience'], weight: 4 },
    { keywords: ['20s', 'gen z', 'twenties', 'young', '26'], weight: 3 },
    { keywords: ['tiktok', 'video', 'inclusive'], weight: 2 },
  ],
  elena: [
    { keywords: ['acquisition', 'merger', 'integration', 'systems'], weight: 5 },
    { keywords: ['30s', 'millennial', 'gen y'], weight: 2 },
    { keywords: ['analyst', 'technical'], weight: 2 },
  ],
  jayden: [
    { keywords: ['community', 'culture', 'engagement', 'team building'], weight: 4 },
    { keywords: ['20s', 'gen z', 'twenties'], weight: 3 },
    { keywords: ['remote', 'connection', 'fun'], weight: 2 },
  ],
  robert: [
    { keywords: ['senior', 'veteran', 'experienced', 'architect', 'principal'], weight: 4 },
    { keywords: ['50s', 'boomer', 'fifties', '56'], weight: 4 },
    { keywords: ['mentor', 'legacy', 'long tenure'], weight: 3 },
  ],
  amanda: [
    { keywords: ['sales', 'revenue', 'deals', 'account', 'closing'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties'], weight: 3 },
    { keywords: ['quota', 'customer', 'business'], weight: 2 },
  ],
};

// Reason templates for each persona
const personaReasons: Record<string, string[]> = {
  sarah: [
    "Your profile as a manager with a focus on organization matches Sarah, the Multitasking Manager.",
    "Like Sarah, you balance strategic planning with day-to-day team management.",
  ],
  marcus: [
    "Your data-driven, strategic approach matches Marcus, the Strategic Thinker.",
    "Like Marcus, you value research and evidence-based decision making.",
  ],
  david: [
    "Your mobile, field-based work style matches David, the Field Expert.",
    "Like David, you need information accessible on the go.",
  ],
  zoe: [
    "Your creative, digital-native approach matches Zoe, the Digital Native.",
    "Like Zoe, you value visual communication and fresh perspectives.",
  ],
  elena: [
    "Your experience with company integration matches Elena, the Integration Specialist.",
    "Like Elena, you navigate multiple organizational cultures.",
  ],
  jayden: [
    "Your focus on team connection matches Jayden, the Culture Champion.",
    "Like Jayden, you believe work should be engaging and fun.",
  ],
  robert: [
    "Your extensive experience matches Robert, the Experienced Voice.",
    "Like Robert, you bring deep institutional knowledge and mentorship.",
  ],
  amanda: [
    "Your results-driven sales focus matches Amanda, the Revenue Driver.",
    "Like Amanda, you prioritize efficiency and closing deals.",
  ],
};

// Smart keyword-based matching function
function matchPersonaByKeywords(text: string): { personaId: string; confidence: number; reason: string } {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Calculate scores for each persona
  for (const [personaId, keywordGroups] of Object.entries(personaKeywords)) {
    scores[personaId] = 0;
    
    for (const group of keywordGroups) {
      for (const keyword of group.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          scores[personaId] += group.weight;
        }
      }
    }
  }
  
  // Find the best match
  const sortedPersonas = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topPersonaId, topScore] = sortedPersonas[0];
  const [, secondScore] = sortedPersonas[1] || [null, 0];
  
  // Calculate confidence
  let confidence: number;
  if (topScore === 0) {
    confidence = 0.55;
  } else if (topScore >= 8) {
    confidence = Math.min(0.92, 0.75 + (topScore - secondScore) * 0.03);
  } else if (topScore >= 5) {
    confidence = Math.min(0.85, 0.65 + (topScore - secondScore) * 0.03);
  } else {
    confidence = Math.min(0.75, 0.55 + topScore * 0.04);
  }
  
  const reasons = personaReasons[topPersonaId] || ["Based on your work style description."];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  
  return {
    personaId: topScore > 0 ? topPersonaId : personas[Math.floor(Math.random() * personas.length)].id,
    confidence: Math.round(confidence * 100) / 100,
    reason,
  };
}

// Build persona summaries for AI prompt
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

IMPORTANT: 
- personaId must be one of: ${personas.map(p => p.id).join(', ')}
- confidence should be between 0.5 and 0.95
- Keep the reason concise (1-2 sentences max)`;

export async function POST(request: NextRequest) {
  try {
    const { userText, context } = await request.json();

    if (!userText) {
      return NextResponse.json(
        { error: 'User text is required' },
        { status: 400 }
      );
    }

    const fullText = context ? `${context}\n${userText}` : userText;

    // Try AI-based matching first (Gemini or Ollama)
    const canUseAI = isGeminiAvailable() || await isOllamaAvailable();
    
    if (canUseAI) {
      try {
        const { text: aiResponse, provider } = await generateText(
          SYSTEM_PROMPT,
          `User description: ${fullText}\n\nRespond with JSON only:`
        );

        // Try to parse the JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Validate the persona ID
          const validIds = personas.map(p => p.id);
          if (validIds.includes(parsed.personaId)) {
            return NextResponse.json({
              personaId: parsed.personaId,
              confidence: Math.min(0.95, Math.max(0.5, parsed.confidence || 0.7)),
              reason: parsed.reason || 'Based on your description',
              source: provider,
            });
          }
        }
      } catch (aiError) {
        console.warn('AI matching failed, using keyword fallback:', aiError);
      }
    }

    // Fallback: Smart keyword-based matching
    const keywordMatch = matchPersonaByKeywords(fullText);
    
    return NextResponse.json({
      ...keywordMatch,
      source: 'keywords',
    });

  } catch (error) {
    console.error('Persona match API error:', error);
    
    const fallbackMatch = matchPersonaByKeywords('general workplace');
    return NextResponse.json({
      ...fallbackMatch,
      source: 'fallback',
    });
  }
}
