/**
 * Mock AI Service
 * 
 * Provides realistic mock responses for the Persona Finder.
 * Includes simulated delays for a realistic feel.
 */

import { Message } from '@/components/ChatMessage';
import { AIService, GuidedResponse, FreeformResponse } from './ai-service';
import { Persona, personas, getPersonaById } from './personas';

// Simulated delay for realistic feel
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Guided discovery questions
const guidedQuestions = [
  {
    question: "Let's start! How do you typically prefer to receive work updates?",
    options: [
      'Quick bullet points',
      'Detailed reports with data',
      'Short videos or visuals',
      'Face-to-face conversations',
      'Mobile notifications',
    ],
  },
  {
    question: "What's your biggest frustration at work?",
    options: [
      'Information overload',
      'Vague messaging without metrics',
      'Feeling disconnected from HQ',
      'Too much corporate jargon',
      'Boring top-down updates',
    ],
  },
  {
    question: 'What motivates you the most?',
    options: [
      'Helping my team succeed',
      'Career advancement & data-driven wins',
      'Social connection & recognition',
      'Being the go-to expert',
      'Loyalty & genuine relationships',
    ],
  },
  {
    question: 'How do you feel about change at work?',
    options: [
      "Cautious - I've seen too many initiatives fail",
      'Skeptical until I see the data',
      'Excited if it means growth opportunities',
      'Frustrated if it breaks my workflow',
      'Open if it improves team connection',
    ],
  },
];

// Mapping answers to persona traits
const answerPersonaMapping: Record<string, string[]> = {
  'Quick bullet points': ['maya', 'alex'],
  'Detailed reports with data': ['ben'],
  'Short videos or visuals': ['priya', 'sahil'],
  'Face-to-face conversations': ['ido'],
  'Mobile notifications': ['oliver'],
  'Information overload': ['maya', 'priya'],
  'Vague messaging without metrics': ['ben'],
  'Feeling disconnected from HQ': ['oliver', 'anna'],
  'Too much corporate jargon': ['ido'],
  'Boring top-down updates': ['sahil'],
  'Helping my team succeed': ['maya'],
  'Career advancement & data-driven wins': ['ben', 'alex'],
  'Social connection & recognition': ['sahil'],
  'Being the go-to expert': ['oliver'],
  'Loyalty & genuine relationships': ['ido'],
  "Cautious - I've seen too many initiatives fail": ['ido'],
  'Skeptical until I see the data': ['ben'],
  'Excited if it means growth opportunities': ['priya', 'sahil'],
  'Frustrated if it breaks my workflow': ['oliver', 'alex'],
  'Open if it improves team connection': ['anna'],
};

// Keywords for free-form analysis
const personaKeywords: Record<string, string[]> = {
  maya: ['manager', 'team', 'cascade', 'overwhelmed', 'information overload', 'sandwich', 'actionable'],
  ben: ['data', 'metrics', 'logic', 'skeptical', 'ambitious', 'strategic', 'fluff'],
  oliver: ['mobile', 'field', 'disconnected', 'vpn', 'login', 'on-site', 'notifications'],
  priya: ['junior', 'new', 'growth', 'validation', 'visual', 'complexity', 'belonging'],
  anna: ['acquired', 'outsider', 'access', 'integration', 'limbo', 'second class'],
  sahil: ['social', 'connection', 'recognition', 'expat', 'culture', 'interactive', 'engagement'],
  ido: ['traditional', 'face-to-face', 'change fatigue', 'cynical', 'loyalty', 'honest'],
  alex: ['sales', 'time', 'wiifm', 'competition', 'closing', 'bottom line', 'tools'],
};

function calculatePersonaScores(answers: string[]): Map<string, number> {
  const scores = new Map<string, number>();
  
  for (const answer of answers) {
    const matchedPersonas = answerPersonaMapping[answer] || [];
    for (const personaId of matchedPersonas) {
      scores.set(personaId, (scores.get(personaId) || 0) + 1);
    }
  }
  
  return scores;
}

function findBestMatch(scores: Map<string, number>): Persona | undefined {
  let bestId = '';
  let bestScore = 0;
  
  scores.forEach((score, id) => {
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  });
  
  return getPersonaById(bestId);
}

function analyzeTextForPersona(text: string): { persona: Persona | null; confidence: number } {
  const lowerText = text.toLowerCase();
  const scores = new Map<string, number>();
  
  for (const [personaId, keywords] of Object.entries(personaKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores.set(personaId, score);
    }
  }
  
  if (scores.size === 0) {
    return { persona: null, confidence: 0 };
  }
  
  let bestId = '';
  let bestScore = 0;
  
  scores.forEach((score, id) => {
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  });
  
  const maxPossible = personaKeywords[bestId]?.length || 1;
  const confidence = Math.min(0.95, (bestScore / maxPossible) * 1.2);
  
  return {
    persona: getPersonaById(bestId) || null,
    confidence,
  };
}

export const mockAIService: AIService = {
  async startGuidedDiscovery(): Promise<GuidedResponse> {
    await delay(800);
    
    return {
      message: guidedQuestions[0].question,
      options: guidedQuestions[0].options,
    };
  },

  async continueGuidedDiscovery(
    messages: Message[],
    answer: string
  ): Promise<GuidedResponse> {
    await delay(1000);
    
    // Count how many user messages (answers) we have
    const userAnswers = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content);
    
    const currentQuestionIndex = userAnswers.length;
    
    // If we have all answers, calculate the match
    if (currentQuestionIndex >= guidedQuestions.length) {
      const scores = calculatePersonaScores(userAnswers);
      const matchedPersona = findBestMatch(scores);
      
      if (matchedPersona) {
        const confidence = Math.round((scores.get(matchedPersona.id) || 0) / guidedQuestions.length * 100);
        return {
          message: `Based on your responses, you strongly align with **${matchedPersona.name}** - "${matchedPersona.title}"!\n\n${matchedPersona.quote}\n\nConfidence: ${Math.min(95, confidence + 40)}%`,
          matchedPersona,
          confidence: Math.min(0.95, confidence / 100 + 0.4),
        };
      }
    }
    
    // Return next question
    const nextQuestion = guidedQuestions[currentQuestionIndex];
    if (nextQuestion) {
      return {
        message: nextQuestion.question,
        options: nextQuestion.options,
      };
    }
    
    // Fallback - shouldn't reach here
    return {
      message: "Thanks for your answers! Let me find your best match...",
      options: [],
    };
  },

  async analyzeFreeform(
    messages: Message[],
    text: string
  ): Promise<FreeformResponse> {
    await delay(1500);
    
    // Combine all user text
    const allUserText = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');
    
    const { persona, confidence } = analyzeTextForPersona(allUserText);
    
    // If not enough info, ask follow-up
    if (!persona || confidence < 0.4) {
      const followUps = [
        "I'd love to understand you better. What's your biggest frustration when receiving work communications?",
        "Can you tell me more about what motivates you at work? What makes a good day for you?",
        "How do you prefer to stay informed about company updates - quick summaries, detailed reports, or something else?",
      ];
      
      // Pick a follow-up we haven't asked
      const assistantMessages = messages.filter((m) => m.role === 'assistant');
      const usedFollowUps = new Set(assistantMessages.map((m) => m.content));
      const availableFollowUp = followUps.find((f) => !usedFollowUps.has(f));
      
      if (availableFollowUp && messages.length < 6) {
        return {
          message: availableFollowUp,
          needsMoreInfo: true,
        };
      }
      
      // If we've asked enough, make a best guess
      const fallbackPersona = personas[Math.floor(Math.random() * personas.length)];
      return {
        message: `Based on what you've shared, you seem to align with **${fallbackPersona.name}** - "${fallbackPersona.title}"!\n\n"${fallbackPersona.quote}"\n\nThis matches your communication style and work preferences. Click below to learn more about this persona and how to communicate effectively with similar colleagues.`,
        matchedPersona: fallbackPersona,
        confidence: 0.6,
      };
    }
    
    // Found a match!
    return {
      message: `Great insights! Based on your description, you strongly align with **${persona.name}** - "${persona.title}"!\n\n"${persona.quote}"\n\nConfidence: ${Math.round(confidence * 100)}%\n\nYour communication style, motivations, and pain points closely match this persona profile.`,
      matchedPersona: persona,
      confidence,
    };
  },
};

