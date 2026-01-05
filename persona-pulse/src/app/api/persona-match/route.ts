import { NextRequest, NextResponse } from 'next/server';
import { personas } from '@/lib/personas';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';

// Keyword-based persona matching profiles - based on concrete details
const personaKeywords: Record<string, { keywords: string[]; weight: number }[]> = {
  maya: [
    // Role: Software Engineering Manager, 47, Gen X, 8 years
    { keywords: ['manager', 'team lead', 'leading', 'management', 'supervise', 'manage people', 'manage a team'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties', '45', '46', '47', '48', '49'], weight: 3 },
    { keywords: ['engineering', 'software', 'tech', 'developer', 'development'], weight: 2 },
    { keywords: ['8 years', '7 years', '9 years', '10 years', 'several years'], weight: 2 },
    { keywords: ['israel', 'raanana', 'tel aviv'], weight: 2 },
    { keywords: ['desk', 'office'], weight: 1 },
  ],
  ben: [
    // Role: Product Marketing Lead, 35, Gen Y/Millennial, 4 years
    { keywords: ['product', 'marketing', 'product marketing', 'product manager', 'pm'], weight: 4 },
    { keywords: ['30s', 'millennial', 'gen y', 'thirties', '33', '34', '35', '36', '37'], weight: 3 },
    { keywords: ['4 years', '3 years', '5 years', 'few years'], weight: 2 },
    { keywords: ['individual contributor', 'ic', 'not managing'], weight: 2 },
    { keywords: ['usa', 'us', 'america', 'new jersey', 'east coast'], weight: 2 },
    { keywords: ['desk', 'office', 'laptop'], weight: 1 },
  ],
  oliver: [
    // Role: Service Partner, 44, Gen X, 15 years, UK, Field/Mobile
    { keywords: ['field', 'on the go', 'mobile', 'frontline', 'on-site', 'site', 'deskless'], weight: 4 },
    { keywords: ['service', 'partner', 'technician', 'engineer', 'operations'], weight: 3 },
    { keywords: ['40s', 'gen x', 'forties', '42', '43', '44', '45', '46'], weight: 2 },
    { keywords: ['15 years', '10+ years', 'more than 10', 'long time', 'many years', 'veteran'], weight: 3 },
    { keywords: ['uk', 'britain', 'england', 'london'], weight: 2 },
    { keywords: ['not at desk', 'rarely at desk', 'always moving'], weight: 2 },
  ],
  priya: [
    // Role: Junior Developer, 24, Gen Z, 6 months, India
    { keywords: ['junior', 'new', 'entry level', 'fresh', 'graduate', 'intern', 'starting out'], weight: 4 },
    { keywords: ['20s', 'gen z', 'twenties', '22', '23', '24', '25', '26', 'young'], weight: 3 },
    { keywords: ['developer', 'engineer', 'programmer', 'software', 'coding'], weight: 2 },
    { keywords: ['less than 1 year', '6 months', 'few months', 'just started', 'recently joined', 'new employee'], weight: 3 },
    { keywords: ['india', 'pune', 'bangalore', 'mumbai'], weight: 2 },
    { keywords: ['desk', 'office', 'hybrid'], weight: 1 },
  ],
  anna: [
    // Role: Network Expert (Acquired), 36, Gen Y, 3 years (acquired), Dublin
    { keywords: ['acquired', 'acquisition', 'merger', 'bought', 'joined through'], weight: 5 },
    { keywords: ['recently joined', 'new to company', '3 years', '2 years', 'joined acquisition'], weight: 3 },
    { keywords: ['30s', 'millennial', 'gen y', 'thirties', '34', '35', '36', '37', '38'], weight: 2 },
    { keywords: ['network', 'expert', 'specialist', 'technical'], weight: 2 },
    { keywords: ['dublin', 'ireland', 'europe'], weight: 2 },
    { keywords: ['remote', 'work from home', 'hybrid'], weight: 1 },
  ],
  sahil: [
    // Role: Program Manager, 28, Gen Z, 6 years, Dallas (Expat)
    { keywords: ['program manager', 'project manager', 'coordinator', 'program'], weight: 3 },
    { keywords: ['20s', 'gen z', 'late twenties', '27', '28', '29'], weight: 3 },
    { keywords: ['6 years', '5 years', '7 years', 'several years'], weight: 2 },
    { keywords: ['expat', 'relocated', 'moved', 'international', 'abroad', 'foreign'], weight: 4 },
    { keywords: ['dallas', 'texas', 'usa', 'us'], weight: 2 },
    { keywords: ['mix', 'hybrid', 'office'], weight: 1 },
  ],
  ido: [
    // Role: Software Engineering Manager, 58, Boomer, 15 years, Israel
    { keywords: ['50s', '60s', 'boomer', 'fifties', 'sixties', '55', '56', '57', '58', '59', '60', 'older', 'senior'], weight: 4 },
    { keywords: ['15 years', '10+ years', 'more than 10', 'long time', 'many years', 'veteran', '20 years'], weight: 3 },
    { keywords: ['manager', 'team lead', 'engineering manager', 'software manager'], weight: 2 },
    { keywords: ['israel', 'raanana', 'tel aviv'], weight: 2 },
    { keywords: ['traditional', 'experienced', 'long tenure'], weight: 2 },
    { keywords: ['desk', 'office'], weight: 1 },
  ],
  alex: [
    // Role: Customer Business Executive (Sales), 49, Gen X, 17 years, USA
    { keywords: ['sales', 'business', 'executive', 'customer', 'account', 'revenue', 'deals'], weight: 4 },
    { keywords: ['customer facing', 'client facing', 'external'], weight: 3 },
    { keywords: ['40s', 'gen x', 'late forties', '47', '48', '49', '50'], weight: 2 },
    { keywords: ['17 years', '15 years', '10+ years', 'more than 10', 'long time', 'veteran'], weight: 2 },
    { keywords: ['usa', 'us', 'plano', 'texas', 'dallas'], weight: 2 },
    { keywords: ['on the go', 'mobile', 'traveling', 'client meetings'], weight: 2 },
  ],
};

// Reason templates for each persona
const personaReasons: Record<string, string[]> = {
  maya: [
    "Your profile as a manager in your 40s with several years at the company matches Maya, a Software Engineering Manager.",
    "Like Maya, you're in a management role balancing team needs with organizational demands.",
    "Your experience level and leadership role aligns with Maya's position as The Burdened Manager.",
  ],
  ben: [
    "Your profile as a product/marketing professional in your 30s matches Ben, the Data-Driven Analyst.",
    "Like Ben, you're a mid-career professional focused on strategic work.",
    "Your role and experience level aligns with Ben's position as a Product Marketing Lead.",
  ],
  oliver: [
    "Your work in the field and mobile-first work style matches Oliver, The Isolated Operator.",
    "Like Oliver, you work away from a traditional desk and need information on-the-go.",
    "Your long tenure and field-based role aligns with Oliver's experience as a Service Partner.",
  ],
  priya: [
    "As a newer, younger employee, your profile matches Priya, The Anxious Zoomer.",
    "Like Priya, you're early in your career and still learning the ropes.",
    "Your junior role and Gen Z age group aligns with Priya's profile as a Junior Developer.",
  ],
  anna: [
    "Your background of joining through an acquisition matches Anna, who came from an acquired company.",
    "Like Anna, you're integrating into a new organizational culture.",
    "Your experience joining through a merger aligns with Anna's 'Out of Site, Out of Mind' persona.",
  ],
  sahil: [
    "Your profile as a program manager who relocated internationally matches Sahil, The Social Engager.",
    "Like Sahil, you're building connections in a new location.",
    "Your expat experience and role aligns with Sahil's position as a Program Manager abroad.",
  ],
  ido: [
    "Your profile as a senior professional in your 50s+ with long tenure matches Ido, The Traditionalist Connector.",
    "Like Ido, you bring years of experience and perspective to the organization.",
    "Your seniority and long tenure aligns with Ido's role as a veteran manager.",
  ],
  alex: [
    "Your sales/customer-facing role matches Alex, The Sales Achiever.",
    "Like Alex, you're focused on customers and driving business results.",
    "Your client-facing role and experience level aligns with Alex's position as a Customer Business Executive.",
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
  
  // Calculate confidence based on score difference and absolute score
  let confidence: number;
  if (topScore === 0) {
    // No keywords matched - low confidence random match
    confidence = 0.55;
  } else if (topScore >= 8) {
    confidence = Math.min(0.92, 0.75 + (topScore - secondScore) * 0.03);
  } else if (topScore >= 5) {
    confidence = Math.min(0.85, 0.65 + (topScore - secondScore) * 0.03);
  } else {
    confidence = Math.min(0.75, 0.55 + topScore * 0.04);
  }
  
  // Pick a random reason for variety
  const reasons = personaReasons[topPersonaId] || ["Based on your work style description."];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  
  return {
    personaId: topScore > 0 ? topPersonaId : personas[Math.floor(Math.random() * personas.length)].id,
    confidence: Math.round(confidence * 100) / 100,
    reason,
  };
}

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

// Smart keyword-based matching function
function matchPersonaByKeywords(text: string): { personaId: string | null; confidence: number; reason: string } {
  const lowerText = text.toLowerCase();
  
  // First check if we have meaningful content
  if (!hasMeaningfulContent(text)) {
    return {
      personaId: null,
      confidence: 0,
      reason: "I need more information about you to find a match. Please tell me about your job role, how long you've been working, your age group, or whether you work at a desk or in the field.",
    };
  }
  
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
  
  // If no keywords matched at all, ask for more info
  if (topScore === 0) {
    return {
      personaId: null,
      confidence: 0,
      reason: "I couldn't find enough details to match you. Could you tell me more about your role, experience level, or how you typically work?",
    };
  }
  
  // Calculate confidence based on score
  let confidence: number;
  if (topScore >= 8) {
    confidence = Math.min(0.92, 0.75 + (topScore - secondScore) * 0.03);
  } else if (topScore >= 5) {
    confidence = Math.min(0.80, 0.60 + (topScore - secondScore) * 0.03);
  } else if (topScore >= 3) {
    confidence = Math.min(0.65, 0.45 + topScore * 0.05);
  } else {
    // Score too low - not confident enough
    return {
      personaId: null,
      confidence: topScore * 0.15,
      reason: "I need a bit more information to find your best match. What's your job role? How long have you been at the company? Do you manage people?",
    };
  }
  
  // Generate reason based on the persona
  const persona = personas.find(p => p.id === topPersonaId);
  const reason = persona 
    ? `Your profile matches ${persona.name}, ${persona.title}. ${persona.role} with similar characteristics.`
    : 'Based on your description.';
  
  return {
    personaId: topPersonaId,
    confidence: Math.round(confidence * 100) / 100,
    reason,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userText, context } = await request.json();

    if (!userText) {
      return NextResponse.json(
        { error: 'User text is required' },
        { status: 400 }
      );
    }

    // Build the full text for analysis
    const fullText = context 
      ? `${context}\n${userText}`
      : userText;

    // Try Ollama first, but don't wait too long
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          prompt: `${SYSTEM_PROMPT}\n\nUser description: ${fullText}\n\nRespond with JSON only:`,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            num_predict: 150,
            num_ctx: 4096,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.response?.trim() || '';

        // Try to parse the JSON response
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Validate the persona ID
          const validIds = personas.map(p => p.id);
          if (validIds.includes(parsed.personaId)) {
            return NextResponse.json({
              personaId: parsed.personaId,
              confidence: Math.min(0.95, Math.max(0.5, parsed.confidence || 0.7)),
              reason: parsed.reason || 'Based on your description',
              source: 'ai',
            });
          }
        }
      }
    } catch (ollamaError) {
      // Ollama not available or timed out - continue to keyword matching
      console.log('Ollama unavailable, using keyword matching');
    }

    // Fallback: Smart keyword-based matching
    const keywordMatch = matchPersonaByKeywords(fullText);
    
    return NextResponse.json({
      ...keywordMatch,
      source: 'keywords',
    });

  } catch (error) {
    console.error('Persona match API error:', error);
    
    // Even on error, try to return something useful
    const fallbackMatch = matchPersonaByKeywords('general workplace');
    return NextResponse.json({
      ...fallbackMatch,
      source: 'fallback',
    });
  }
}

