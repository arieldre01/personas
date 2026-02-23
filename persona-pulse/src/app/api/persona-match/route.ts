import { NextRequest, NextResponse } from 'next/server';
import { personas } from '@/lib/personas';
import { amdocsPersonas } from '@/lib/amdocs-personas';
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

// Keyword-based Amdocs persona matching profiles
const amdocsPersonaKeywords: Record<string, { keywords: string[]; weight: number }[]> = {
  maya: [
    { keywords: ['manager', 'team lead', 'leading', 'management', 'supervise', 'busy'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties', '47'], weight: 3 },
    { keywords: ['software', 'engineering', 'developer'], weight: 2 },
    { keywords: ['stress', 'pressure', 'cascade', 'meetings'], weight: 2 },
  ],
  priya: [
    { keywords: ['junior', 'new', 'young', 'digital', 'fresh', 'graduate'], weight: 4 },
    { keywords: ['20s', 'gen z', 'twenties', '24', '25'], weight: 4 },
    { keywords: ['software', 'engineer', 'developer', 'coding'], weight: 2 },
    { keywords: ['modern', 'short', 'visual', 'video'], weight: 2 },
  ],
  anna: [
    { keywords: ['acquisition', 'acquired', 'merger', 'integration', 'new company'], weight: 5 },
    { keywords: ['30s', 'gen y', 'millennial', 'thirties'], weight: 3 },
    { keywords: ['network', 'expert', 'technical'], weight: 2 },
    { keywords: ['disconnected', 'left out', 'access'], weight: 2 },
  ],
  sahil: [
    { keywords: ['social', 'connector', 'community', 'events', 'networking'], weight: 4 },
    { keywords: ['20s', '30s', 'gen y', 'millennial', '28'], weight: 3 },
    { keywords: ['program', 'manager', 'expat', 'remote'], weight: 3 },
    { keywords: ['fun', 'connection', 'team building'], weight: 2 },
  ],
  ido: [
    { keywords: ['senior', 'veteran', 'experienced', 'skeptical', 'long tenure'], weight: 4 },
    { keywords: ['50s', 'boomer', 'fifties', '58'], weight: 4 },
    { keywords: ['manager', 'software', 'engineering'], weight: 2 },
    { keywords: ['traditional', 'volunteering', 'honest'], weight: 2 },
  ],
  ben: [
    { keywords: ['career', 'ambitious', 'growth', 'advancement', 'climber'], weight: 4 },
    { keywords: ['30s', 'gen y', 'millennial', '35'], weight: 3 },
    { keywords: ['marketing', 'product', 'lead'], weight: 3 },
    { keywords: ['leadership', 'visibility', 'networking'], weight: 2 },
  ],
  alex: [
    { keywords: ['executive', 'business', 'sales', 'customer', 'account'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties', '49'], weight: 3 },
    { keywords: ['busy', 'meetings', 'email', 'mobile'], weight: 3 },
    { keywords: ['concise', 'short', 'quick'], weight: 2 },
  ],
  oliver: [
    { keywords: ['site', 'leader', 'local', 'service', 'partner'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties', '44'], weight: 3 },
    { keywords: ['mobile', 'engagement', 'recognition'], weight: 3 },
    { keywords: ['uk', 'europe', 'regional'], weight: 2 },
  ],
  mateo: [
    { keywords: ['tech', 'technical', 'developer', 'engineer', 'early adopter', 'innovator'], weight: 4 },
    { keywords: ['30s', 'gen y', 'millennial', '33'], weight: 3 },
    { keywords: ['ai', 'tools', 'learning', 'skills', 'upskill'], weight: 4 },
    { keywords: ['short', 'clear', 'concise', 'bullets', 'direct'], weight: 3 },
    { keywords: ['latin', 'cala', 'individual contributor'], weight: 2 },
  ],
};

// Reason templates for Amdocs personas
const amdocsPersonaReasons: Record<string, string[]> = {
  maya: [
    "Your profile as a busy manager balancing team needs matches Maya, the Busy Bee Manager.",
    "Like Maya, you deal with constant pressure and need support to cascade information effectively.",
  ],
  priya: [
    "Your digital-native approach and preference for modern formats matches Priya, the Digital Native.",
    "Like Priya, you want clear, relevant information about how things impact your role.",
  ],
  anna: [
    "Your experience joining through acquisition matches Anna, the Acquired Talent.",
    "Like Anna, you navigate the challenges of integrating into a new company culture.",
  ],
  sahil: [
    "Your focus on social connection and events matches Sahil, the Social Connector.",
    "Like Sahil, you value face-to-face interaction and building community.",
  ],
  ido: [
    "Your extensive experience and thoughtful approach matches Ido, the Skeptical Veteran.",
    "Like Ido, you value honesty and sincerity over corporate messaging.",
  ],
  ben: [
    "Your career-focused mindset matches Ben, the Career Climber.",
    "Like Ben, you're driven by growth and leadership opportunities.",
  ],
  alex: [
    "Your busy, customer-focused role matches Alex, the Business Executive.",
    "Like Alex, you need concise, actionable information delivered efficiently.",
  ],
  oliver: [
    "Your site leadership role matches Oliver, the Site Leader.",
    "Like Oliver, you're a go-to person who values mobile-friendly, concise communications.",
  ],
  mateo: [
    "Your tech-savvy approach and love for early adoption matches Mateo, the Early Adopter.",
    "Like Mateo, you value technical depth, clear communication, and staying ahead with new tools.",
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
function matchPersonaByKeywords(text: string, personaSet: 'amdocs' | 'mock' = 'amdocs'): { personaId: string; confidence: number; reason: string } {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Select the correct keyword map and reasons based on persona set
  const keywordMap = personaSet === 'amdocs' ? amdocsPersonaKeywords : personaKeywords;
  const reasonMap = personaSet === 'amdocs' ? amdocsPersonaReasons : personaReasons;
  const personaList = personaSet === 'amdocs' ? amdocsPersonas : personas;
  
  // Calculate scores for each persona
  for (const [personaId, keywordGroups] of Object.entries(keywordMap)) {
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
  
  const reasons = reasonMap[topPersonaId] || ["Based on your work style description."];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  
  return {
    personaId: topScore > 0 ? topPersonaId : personaList[Math.floor(Math.random() * personaList.length)].id,
    confidence: Math.round(confidence * 100) / 100,
    reason,
  };
}

// Build persona summaries for AI prompt
function buildPersonaSummaries(personaList: typeof personas) {
  return personaList.map(p => 
    `${p.id}: ${p.name} - "${p.title}" (${p.generation}, ${p.role})
   Quote: "${p.quote}"
   Stress: ${p.psychology.stress}
   Motivation: ${p.psychology.motivation}
   Pain Points: ${p.psychology.painPoints.join(', ')}`
  ).join('\n\n');
}

function buildSystemPrompt(personaList: typeof personas) {
  const summaries = buildPersonaSummaries(personaList);
  return `You are an expert at matching people to workplace persona profiles. 
Based on the user's description of their work style, frustrations, and preferences, 
determine which persona matches them best.

Here are the available personas:

${summaries}

INSTRUCTIONS:
1. Analyze the user's message for key traits: communication preferences, frustrations, motivations, and work style
2. Match them to the SINGLE best persona from the list above
3. Respond in this EXACT JSON format (nothing else):
{"personaId": "id_here", "confidence": 0.85, "reason": "Brief 1-2 sentence explanation"}

IMPORTANT: 
- personaId must be one of: ${personaList.map(p => p.id).join(', ')}
- confidence should be between 0.5 and 0.95
- Keep the reason concise (1-2 sentences max)`;
}

export async function POST(request: NextRequest) {
  try {
    const { userText, context, personaSet = 'amdocs' } = await request.json();

    if (!userText) {
      return NextResponse.json(
        { error: 'User text is required' },
        { status: 400 }
      );
    }

    const fullText = context ? `${context}\n${userText}` : userText;
    
    // Select the correct persona list based on persona set
    const personaList = personaSet === 'amdocs' ? amdocsPersonas : personas;
    const systemPrompt = buildSystemPrompt(personaList);

    // Try AI-based matching first (Gemini or Ollama)
    const canUseAI = isGeminiAvailable() || await isOllamaAvailable();
    
    if (canUseAI) {
      try {
        const { text: aiResponse, provider } = await generateText(
          systemPrompt,
          `User description: ${fullText}\n\nRespond with JSON only:`
        );

        // Try to parse the JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Validate the persona ID
          const validIds = personaList.map(p => p.id);
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
    const keywordMatch = matchPersonaByKeywords(fullText, personaSet);
    
    return NextResponse.json({
      ...keywordMatch,
      source: 'keywords',
    });

  } catch (error) {
    console.error('Persona match API error:', error);
    
    const fallbackMatch = matchPersonaByKeywords('general workplace', 'amdocs');
    return NextResponse.json({
      ...fallbackMatch,
      source: 'fallback',
    });
  }
}
