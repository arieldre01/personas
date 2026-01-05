import { NextRequest, NextResponse } from 'next/server';
import { personas } from '@/lib/personas';

// Minimum confidence threshold to declare a match
const MIN_CONFIDENCE_THRESHOLD = 0.5;
const MIN_WORDS_REQUIRED = 3;

// Keywords that indicate meaningful work-related content
const meaningfulKeywords = [
  // Roles
  'manager', 'developer', 'engineer', 'sales', 'marketing', 'analyst', 'lead', 'junior', 'senior',
  'executive', 'director', 'coordinator', 'specialist', 'consultant', 'designer', 'pm', 'product',
  // Work context
  'team', 'work', 'job', 'company', 'office', 'remote', 'field', 'desk', 'mobile', 'client',
  'customer', 'project', 'meeting', 'email', 'report', 'deadline', 'boss', 'employee', 'staff',
  // Time/tenure
  'years', 'months', 'new', 'experienced', 'veteran', 'started', 'joined', 'tenure',
  // Age/generation
  '20s', '30s', '40s', '50s', '60s', 'young', 'older', 'millennial', 'gen z', 'gen x', 'boomer',
  // Work style
  'manage', 'lead', 'report', 'travel', 'commute', 'hybrid', 'frontline', 'deskless',
];

// Keyword-based persona matching profiles
const personaKeywords: Record<string, { keywords: string[]; weight: number }[]> = {
  maya: [
    { keywords: ['manager', 'team lead', 'leading', 'management', 'supervise', 'manage people', 'manage a team'], weight: 4 },
    { keywords: ['40s', 'gen x', 'forties', '45', '46', '47', '48', '49'], weight: 3 },
    { keywords: ['engineering', 'software', 'tech', 'developer', 'development'], weight: 2 },
    { keywords: ['8 years', '7 years', '9 years', '10 years', 'several years'], weight: 2 },
    { keywords: ['israel', 'raanana', 'tel aviv'], weight: 2 },
    { keywords: ['desk', 'office'], weight: 1 },
  ],
  ben: [
    { keywords: ['product', 'marketing', 'product marketing', 'product manager', 'pm'], weight: 4 },
    { keywords: ['30s', 'millennial', 'gen y', 'thirties', '33', '34', '35', '36', '37'], weight: 3 },
    { keywords: ['4 years', '3 years', '5 years', 'few years'], weight: 2 },
    { keywords: ['individual contributor', 'ic', 'not managing'], weight: 2 },
    { keywords: ['usa', 'us', 'america', 'new jersey', 'east coast'], weight: 2 },
    { keywords: ['desk', 'office', 'laptop'], weight: 1 },
  ],
  oliver: [
    { keywords: ['field', 'on the go', 'mobile', 'frontline', 'on-site', 'site', 'deskless'], weight: 4 },
    { keywords: ['service', 'partner', 'technician', 'engineer', 'operations'], weight: 3 },
    { keywords: ['40s', 'gen x', 'forties', '42', '43', '44', '45', '46'], weight: 2 },
    { keywords: ['15 years', '10+ years', 'more than 10', 'long time', 'many years', 'veteran'], weight: 3 },
    { keywords: ['uk', 'britain', 'england', 'london'], weight: 2 },
    { keywords: ['not at desk', 'rarely at desk', 'always moving'], weight: 2 },
  ],
  priya: [
    { keywords: ['junior', 'new', 'entry level', 'fresh', 'graduate', 'intern', 'starting out'], weight: 4 },
    { keywords: ['20s', 'gen z', 'twenties', '22', '23', '24', '25', '26', 'young'], weight: 3 },
    { keywords: ['developer', 'engineer', 'programmer', 'software', 'coding'], weight: 2 },
    { keywords: ['less than 1 year', '6 months', 'few months', 'just started', 'recently joined', 'new employee'], weight: 3 },
    { keywords: ['india', 'pune', 'bangalore', 'mumbai'], weight: 2 },
    { keywords: ['desk', 'office', 'hybrid'], weight: 1 },
  ],
  anna: [
    { keywords: ['acquired', 'acquisition', 'merger', 'bought', 'joined through'], weight: 5 },
    { keywords: ['recently joined', 'new to company', '3 years', '2 years', 'joined acquisition'], weight: 3 },
    { keywords: ['30s', 'millennial', 'gen y', 'thirties', '34', '35', '36', '37', '38'], weight: 2 },
    { keywords: ['network', 'expert', 'specialist', 'technical'], weight: 2 },
    { keywords: ['dublin', 'ireland', 'europe'], weight: 2 },
    { keywords: ['remote', 'work from home', 'hybrid'], weight: 1 },
  ],
  sahil: [
    { keywords: ['program manager', 'project manager', 'coordinator', 'program'], weight: 3 },
    { keywords: ['20s', 'gen z', 'late twenties', '27', '28', '29'], weight: 3 },
    { keywords: ['6 years', '5 years', '7 years', 'several years'], weight: 2 },
    { keywords: ['expat', 'relocated', 'moved', 'international', 'abroad', 'foreign'], weight: 4 },
    { keywords: ['dallas', 'texas', 'usa', 'us'], weight: 2 },
    { keywords: ['mix', 'hybrid', 'office'], weight: 1 },
  ],
  ido: [
    { keywords: ['50s', '60s', 'boomer', 'fifties', 'sixties', '55', '56', '57', '58', '59', '60', 'older', 'senior'], weight: 4 },
    { keywords: ['15 years', '10+ years', 'more than 10', 'long time', 'many years', 'veteran', '20 years'], weight: 3 },
    { keywords: ['manager', 'team lead', 'engineering manager', 'software manager'], weight: 2 },
    { keywords: ['israel', 'raanana', 'tel aviv'], weight: 2 },
    { keywords: ['traditional', 'experienced', 'long tenure'], weight: 2 },
    { keywords: ['desk', 'office'], weight: 1 },
  ],
  alex: [
    { keywords: ['sales', 'business', 'executive', 'customer', 'account', 'revenue', 'deals'], weight: 4 },
    { keywords: ['customer facing', 'client facing', 'external'], weight: 3 },
    { keywords: ['40s', 'gen x', 'late forties', '47', '48', '49', '50'], weight: 2 },
    { keywords: ['17 years', '15 years', '10+ years', 'more than 10', 'long time', 'veteran'], weight: 2 },
    { keywords: ['usa', 'us', 'plano', 'texas', 'dallas'], weight: 2 },
    { keywords: ['on the go', 'mobile', 'traveling', 'client meetings'], weight: 2 },
  ],
};

// Check if text contains meaningful work-related content
function hasMeaningfulContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(w => w.length > 2);
  
  // Must have at least MIN_WORDS_REQUIRED words
  if (words.length < MIN_WORDS_REQUIRED) {
    return false;
  }
  
  // Check for meaningful keywords
  const foundKeywords = meaningfulKeywords.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  return foundKeywords.length >= 1;
}

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

    // Use keyword-based matching
    const keywordMatch = matchPersonaByKeywords(fullText);
    
    // If no match found (not enough info), return needMoreInfo flag
    if (!keywordMatch.personaId) {
      return NextResponse.json({
        personaId: null,
        confidence: keywordMatch.confidence,
        reason: keywordMatch.reason,
        needMoreInfo: true,
      });
    }
    
    return NextResponse.json({
      personaId: keywordMatch.personaId,
      confidence: keywordMatch.confidence,
      reason: keywordMatch.reason,
      needMoreInfo: false,
    });

  } catch (error) {
    console.error('Persona match API error:', error);
    return NextResponse.json({
      personaId: null,
      confidence: 0,
      reason: "Something went wrong. Please try again with more details about yourself.",
      needMoreInfo: true,
    });
  }
}

