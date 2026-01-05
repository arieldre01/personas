// Persona data with full psychological and communication profiles
// Generation color coding for UI theming

export type Generation = 'Gen Z' | 'Gen Y' | 'Gen X' | 'Boomer';

export interface Psychology {
  stress: string;
  motivation: string;
  painPoints: string[];
}

export interface Communication {
  do: string[];
  dont: string[];
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  role: string;
  location: string;
  age: number;
  generation: Generation;
  tenure: string;
  imageQuery: string;
  quote: string;
  psychology: Psychology;
  communication: Communication;
}

// Generation color mapping
export const generationColors: Record<Generation, { bg: string; text: string; border: string; badge: string }> = {
  'Gen Z': {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-500',
  },
  'Gen Y': {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-500',
  },
  'Gen X': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-500',
  },
  'Boomer': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-800',
  },
};

export const personas: Persona[] = [
  {
    id: 'maya',
    name: 'Maya',
    title: 'The Burdened Manager',
    role: 'Software Engineering Manager',
    location: "Israel (Ra'anana)",
    age: 47,
    generation: 'Gen X',
    tenure: '8 Years',
    imageQuery: 'stressed corporate woman manager 40s',
    quote: "Vacation without limits? For me that just means work without limits.",
    psychology: {
      stress: "The 'Sandwich' Effect: Pressured by HQ to cascade messages, pressured by team to solve local problems.",
      motivation: 'Wants to be a trusted messenger but feels ill-equipped.',
      painPoints: [
        'Information overload',
        'Fear of missing out (FOMO) on critical info for her team',
      ],
    },
    communication: {
      do: [
        "Provide 'Pre-brief Kits' & talking points",
        'Keep it bulleted and actionable',
      ],
      dont: [
        'Send long newsletters',
        "Assume she has time to read 'nice-to-have' content",
      ],
    },
  },
  {
    id: 'ben',
    name: 'Ben',
    title: 'The Data-Driven Analyst',
    role: 'Product Marketing Lead',
    location: 'USA (New Jersey)',
    age: 35,
    generation: 'Gen Y',
    tenure: '4 Years',
    imageQuery: 'confident corporate man 30s office',
    quote: "I trust logic and data. Emotional appeals are just fluff.",
    psychology: {
      stress: 'Skeptical of corporate optimism.',
      motivation: 'Ambition, Executive Trajectory, Intellectual challenge.',
      painPoints: [
        'Wasting time on social fluff',
        'Vague messaging without metrics',
      ],
    },
    communication: {
      do: [
        'Use dashboards & metrics',
        'Explain the strategic rationale',
      ],
      dont: [
        'Use emotional language',
        'Send generic corporate optimism',
      ],
    },
  },
  {
    id: 'oliver',
    name: 'Oliver',
    title: 'The Isolated Operator',
    role: 'Service Partner',
    location: 'UK',
    age: 44,
    generation: 'Gen X',
    tenure: '15 Years',
    imageQuery: 'busy man on mobile phone construction site or office',
    quote: "If the link doesn't work on my mobile, I'm not reading it.",
    psychology: {
      stress: 'Mobile Hostility: Frustrated by non-mobile friendly tools.',
      motivation: "Being the 'Go-To' guy for his site.",
      painPoints: [
        'Feeling disconnected from HQ',
        'Broken links',
        'Login walls',
      ],
    },
    communication: {
      do: [
        'Push notifications',
        'Zero-friction mobile content',
      ],
      dont: [
        'Require VPN logins for simple updates',
        'Send long emails',
      ],
    },
  },
  {
    id: 'priya',
    name: 'Priya',
    title: 'The Anxious Zoomer',
    role: 'Junior Developer',
    location: 'India (Pune)',
    age: 24,
    generation: 'Gen Z',
    tenure: '6 Months',
    imageQuery: 'young indian woman software developer office',
    quote: "Just tell me how this impacts my role. Not paragraphs.",
    psychology: {
      stress: "Content Fatigue: Can't distinguish critical policy from cafeteria updates.",
      motivation: "Validation: Needs to feel 'seen' and that she is growing.",
      painPoints: [
        'Overwhelmed by complexity',
        'Need for social belonging',
      ],
    },
    communication: {
      do: [
        'Visual formats',
        'Short videos',
        "Framing things as 'growth opportunities'",
      ],
      dont: [
        'Jargon-heavy updates',
        'Ambiguous instructions',
      ],
    },
  },
  {
    id: 'anna',
    name: 'Anna',
    title: 'Out of Site, Out of Mind',
    role: 'Network Expert (Acquired Company)',
    location: 'Dublin',
    age: 36,
    generation: 'Gen Y',
    tenure: '3 Years (Acquired)',
    imageQuery: 'woman in casual office setting looking at laptop',
    quote: "We don't feel part of the company yet. We are missing info all the time.",
    psychology: {
      stress: 'Limbo State: Feels like an outsider; fears for job security.',
      motivation: "Wants 'Big Picture' info to validate she belongs.",
      painPoints: [
        'Broken links (no access to main IT systems)',
        "Feeling 'second class'",
      ],
    },
    communication: {
      do: [
        'Localized onboarding kits',
        'Ensure access rights work before sending',
      ],
      dont: [
        'Assume she understands legacy acronyms',
      ],
    },
  },
  {
    id: 'sahil',
    name: 'Sahil',
    title: 'The Social Engager',
    role: 'Program Manager',
    location: 'Dallas (Expat)',
    age: 28,
    generation: 'Gen Z',
    tenure: '6 Years',
    imageQuery: 'young man happy office social event',
    quote: "Town halls are just an opportunity to meet the guys.",
    psychology: {
      stress: 'Social Isolation (as an expat).',
      motivation: 'Recognition, Connection, Building culture.',
      painPoints: [
        'Boring top-down updates',
        'Lack of social interaction',
      ],
    },
    communication: {
      do: [
        'Interactive campaigns',
        'Public recognition',
        'Social media style updates',
      ],
      dont: [
        'Dry corporate memos with no engagement hooks',
      ],
    },
  },
  {
    id: 'ido',
    name: 'Ido',
    title: 'The Traditionalist Connector',
    role: 'Software Engineering Manager',
    location: "Israel (Ra'anana)",
    age: 58,
    generation: 'Boomer',
    tenure: '15 Years',
    imageQuery: 'older man glasses manager office',
    quote: "Do they genuinely want to hear my input? I find it hard to believe.",
    psychology: {
      stress: 'Change Fatigue.',
      motivation: 'Loyalty, Face-to-face connection, Volunteering.',
      painPoints: [
        "Cynicism toward 'corporate speak'",
        'Digital-only communication',
      ],
    },
    communication: {
      do: [
        'Face-to-face meetings',
        "Honest 'no spin' messages",
      ],
      dont: [
        'Over-polished videos',
        'Scripted language',
      ],
    },
  },
  {
    id: 'alex',
    name: 'Alex',
    title: 'The Sales Achiever',
    role: 'Customer Business Executive',
    location: 'USA (Plano)',
    age: 49,
    generation: 'Gen X',
    tenure: '17 Years',
    imageQuery: 'man suit sales confident',
    quote: "What's in it for me? (WIIFM)",
    psychology: {
      stress: "Time is money; ignores 'Monday Morning' fluff.",
      motivation: 'Beating the competition, Closing deals.',
      painPoints: [
        "Generic updates that don't help him sell",
      ],
    },
    communication: {
      do: [
        'Bottom Line Up Front (BLUF)',
        'Competitor Intel',
        'Sales Tools',
      ],
      dont: [
        'One-size-fits-all newsletters',
      ],
    },
  },
];

// Helper function to get persona by ID
export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

// Helper function to get image URL for a persona
export function getPersonaImage(persona: Persona): string {
  // Try local image first, fall back to UI Avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&size=200&background=random&color=fff&bold=true`;
}

