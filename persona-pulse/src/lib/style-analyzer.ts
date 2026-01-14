/**
 * Style Analyzer for Instant Feedback Feature
 * Analyzes user messages against persona communication preferences
 */

import { Persona } from './personas';

export type FeedbackScore = 'great' | 'good' | 'caution' | 'warning';

export interface FeedbackResult {
  score: FeedbackScore;
  message: string;
  tip?: string;
  matchedDo?: string;
  matchedDont?: string;
}

// Common positive communication patterns
const POSITIVE_PATTERNS = {
  hasData: /\b(\d+%?|\$\d+|data|metrics|numbers|statistics|results)\b/i,
  isSpecific: /\b(specifically|exactly|precisely|the following|here's|these are)\b/i,
  asksPerspective: /\b(what do you think|your opinion|your thoughts|how do you feel|what's your take)\b/i,
  showsRespect: /\b(appreciate|thank you|thanks|respect|understand|acknowledge)\b/i,
  isConcise: (msg: string) => msg.length < 200,
  hasBullets: /^[\s]*[-•*]\s/m,
  hasQuestion: /\?/,
  isDirective: /\b(please|could you|would you|can you|let's|we should)\b/i,
};

// Common negative communication patterns
const NEGATIVE_PATTERNS = {
  isVague: /\b(maybe|perhaps|possibly|kind of|sort of|might|could be|not sure)\b/i,
  isTooLong: (msg: string) => msg.length > 500,
  hasFluff: /\b(just wanted to|I was wondering if|I thought maybe|if you don't mind)\b/i,
  isDemanding: /\b(you must|you need to|immediately|ASAP|urgent|now)\b/i,
  isPassiveAggressive: /\b(as I mentioned|per my last|already told you|obviously|clearly)\b/i,
  lacksStructure: (msg: string) => msg.length > 300 && !msg.includes('\n') && !/[-•*]/.test(msg),
};

/**
 * Check if message matches any of the persona's "do" preferences
 */
function checkDoMatches(message: string, persona: Persona): { matched: boolean; which?: string; reason?: string } {
  const lowerMessage = message.toLowerCase();
  const doStatements = persona.communication.do;
  
  // Check for structured communication (bullet points, lists)
  if (POSITIVE_PATTERNS.hasBullets.test(message)) {
    const bulletDo = doStatements.find(d => d.toLowerCase().includes('bullet') || d.toLowerCase().includes('list'));
    if (bulletDo) {
      return { matched: true, which: bulletDo, reason: 'Used clear bullet points' };
    }
  }
  
  // Check for data/metrics
  if (POSITIVE_PATTERNS.hasData.test(message)) {
    const dataDo = doStatements.find(d => 
      d.toLowerCase().includes('data') || 
      d.toLowerCase().includes('fact') ||
      d.toLowerCase().includes('evidence')
    );
    if (dataDo) {
      return { matched: true, which: dataDo, reason: 'Included specific data' };
    }
  }
  
  // Check for asking perspective
  if (POSITIVE_PATTERNS.asksPerspective.test(message)) {
    const perspectiveDo = doStatements.find(d => 
      d.toLowerCase().includes('opinion') || 
      d.toLowerCase().includes('perspective') ||
      d.toLowerCase().includes('input')
    );
    if (perspectiveDo) {
      return { matched: true, which: perspectiveDo, reason: 'Asked for their perspective' };
    }
  }
  
  // Check for directness/conciseness
  if (POSITIVE_PATTERNS.isConcise(message) && POSITIVE_PATTERNS.isSpecific.test(message)) {
    const directDo = doStatements.find(d => 
      d.toLowerCase().includes('direct') || 
      d.toLowerCase().includes('concise') ||
      d.toLowerCase().includes('clear')
    );
    if (directDo) {
      return { matched: true, which: directDo, reason: 'Clear and direct communication' };
    }
  }
  
  // Check for context/background
  if (lowerMessage.includes('because') || lowerMessage.includes('context') || lowerMessage.includes('background')) {
    const contextDo = doStatements.find(d => 
      d.toLowerCase().includes('context') || 
      d.toLowerCase().includes('why') ||
      d.toLowerCase().includes('reason')
    );
    if (contextDo) {
      return { matched: true, which: contextDo, reason: 'Provided helpful context' };
    }
  }
  
  // Check for appreciation/respect
  if (POSITIVE_PATTERNS.showsRespect.test(message)) {
    return { matched: true, reason: 'Showed appreciation and respect' };
  }
  
  return { matched: false };
}

/**
 * Check if message matches any of the persona's "don't" preferences
 */
function checkDontMatches(message: string, persona: Persona): { matched: boolean; which?: string; reason?: string } {
  const lowerMessage = message.toLowerCase();
  const dontStatements = persona.communication.dont;
  
  // Check for vague language
  if (NEGATIVE_PATTERNS.isVague.test(message)) {
    const vagueDont = dontStatements.find(d => 
      d.toLowerCase().includes('vague') || 
      d.toLowerCase().includes('unclear') ||
      d.toLowerCase().includes('ambiguous')
    );
    if (vagueDont) {
      return { matched: true, which: vagueDont, reason: 'Message sounds uncertain' };
    }
  }
  
  // Check for overly long unstructured messages
  if (NEGATIVE_PATTERNS.isTooLong(message) || NEGATIVE_PATTERNS.lacksStructure(message)) {
    const longDont = dontStatements.find(d => 
      d.toLowerCase().includes('wall') || 
      d.toLowerCase().includes('long') ||
      d.toLowerCase().includes('structure')
    );
    if (longDont) {
      return { matched: true, which: longDont, reason: 'Message could use more structure' };
    }
  }
  
  // Check for demanding tone
  if (NEGATIVE_PATTERNS.isDemanding.test(message)) {
    const demandingDont = dontStatements.find(d => 
      d.toLowerCase().includes('demand') || 
      d.toLowerCase().includes('urgent') ||
      d.toLowerCase().includes('last-minute') ||
      d.toLowerCase().includes('pressure')
    );
    if (demandingDont) {
      return { matched: true, which: demandingDont, reason: 'Tone may seem demanding' };
    }
  }
  
  // Check for passive-aggressive patterns
  if (NEGATIVE_PATTERNS.isPassiveAggressive.test(message)) {
    return { matched: true, reason: 'Phrasing might come across as passive-aggressive' };
  }
  
  // Check for fluffy/indirect language
  if (NEGATIVE_PATTERNS.hasFluff.test(message)) {
    const fluffDont = dontStatements.find(d => 
      d.toLowerCase().includes('fluff') || 
      d.toLowerCase().includes('indirect')
    );
    if (fluffDont) {
      return { matched: true, which: fluffDont, reason: 'Could be more direct' };
    }
  }
  
  // Check for assumptions
  if (lowerMessage.includes('obviously') || lowerMessage.includes('clearly') || lowerMessage.includes('everyone knows')) {
    const assumptionDont = dontStatements.find(d => 
      d.toLowerCase().includes('assume') || 
      d.toLowerCase().includes('assumption')
    );
    if (assumptionDont) {
      return { matched: true, which: assumptionDont, reason: 'Avoid making assumptions' };
    }
  }
  
  return { matched: false };
}

/**
 * Generate a helpful tip based on persona's communication preferences
 */
function generateTip(persona: Persona, score: FeedbackScore): string {
  const tips: Record<FeedbackScore, string[]> = {
    great: [
      `Perfect approach for ${persona.name}!`,
      `This communication style works well with ${persona.generation}.`,
    ],
    good: [
      `Try adding specific data or examples.`,
      `Consider using bullet points for clarity.`,
    ],
    caution: [
      `${persona.name} prefers: "${persona.communication.do[0]}"`,
      `Try being more specific and direct.`,
    ],
    warning: [
      `Remember: "${persona.communication.dont[0]}"`,
      `Consider rephrasing to match ${persona.name}'s style.`,
    ],
  };
  
  const tipList = tips[score];
  return tipList[Math.floor(Math.random() * tipList.length)];
}

/**
 * Main function: Analyze a user message against a persona's preferences
 */
export function analyzeMessage(message: string, persona: Persona): FeedbackResult {
  // Skip very short messages
  if (message.trim().length < 10) {
    return {
      score: 'good',
      message: 'Message received',
    };
  }
  
  const doMatch = checkDoMatches(message, persona);
  const dontMatch = checkDontMatches(message, persona);
  
  // Determine score based on matches
  let score: FeedbackScore;
  let feedbackMessage: string;
  
  if (doMatch.matched && !dontMatch.matched) {
    // Strong positive match
    score = 'great';
    feedbackMessage = doMatch.reason || 'Great communication style!';
  } else if (doMatch.matched && dontMatch.matched) {
    // Mixed signals
    score = 'caution';
    feedbackMessage = `Good start, but: ${dontMatch.reason || 'could be improved'}`;
  } else if (!doMatch.matched && dontMatch.matched) {
    // Negative match
    score = 'warning';
    feedbackMessage = dontMatch.reason || 'This might cause friction';
  } else {
    // Neutral - no strong matches either way
    score = 'good';
    feedbackMessage = 'Clear communication';
  }
  
  return {
    score,
    message: feedbackMessage,
    tip: generateTip(persona, score),
    matchedDo: doMatch.which,
    matchedDont: dontMatch.which,
  };
}

/**
 * Get color classes for a feedback score
 */
export function getFeedbackColors(score: FeedbackScore): { bg: string; text: string; border: string } {
  const colors: Record<FeedbackScore, { bg: string; text: string; border: string }> = {
    great: {
      bg: 'bg-green-50 dark:bg-green-950/40',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
    },
    good: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
    },
    caution: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
    },
    warning: {
      bg: 'bg-red-50 dark:bg-red-950/40',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
  };
  
  return colors[score];
}
