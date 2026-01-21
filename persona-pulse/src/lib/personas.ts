// Persona data with full psychological and communication profiles
// Generation color coding for UI theming
// NOTE: All personas are fictional examples for demonstration purposes

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

// MOCK DATA - Fictional personas for demonstration
export const personas: Persona[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    title: 'The Multitasking Manager',
    role: 'Engineering Team Lead',
    location: 'San Francisco, CA',
    age: 42,
    generation: 'Gen X',
    tenure: '7 Years',
    imageQuery: 'professional woman manager',
    quote: "My calendar is my lifeline. If it's not scheduled, it doesn't exist.",
    psychology: {
      stress: 'Constant context-switching between strategic planning and tactical firefighting.',
      motivation: 'Building high-performing teams and seeing her people grow.',
      painPoints: [
        'Too many meetings with no clear outcomes',
        'Unclear priorities from leadership',
      ],
    },
    communication: {
      do: [
        'Send calendar invites with clear agendas',
        'Use bullet points and action items',
      ],
      dont: [
        'Schedule last-minute meetings',
        'Send walls of text without structure',
      ],
    },
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    title: 'The Strategic Thinker',
    role: 'Senior Product Manager',
    location: 'Austin, TX',
    age: 34,
    generation: 'Gen Y',
    tenure: '5 Years',
    imageQuery: 'professional man thinking',
    quote: "Show me the data, and I'll show you the path forward.",
    psychology: {
      stress: 'Making decisions without sufficient market research.',
      motivation: 'Launching products that genuinely solve user problems.',
      painPoints: [
        'Stakeholders who want features without user validation',
        'Rushed timelines that compromise quality',
      ],
    },
    communication: {
      do: [
        'Back up proposals with user research',
        'Present trade-offs clearly',
      ],
      dont: [
        'Push ideas without supporting evidence',
        'Ignore customer feedback',
      ],
    },
  },
  {
    id: 'david',
    name: 'David Williams',
    title: 'The Field Expert',
    role: 'Technical Consultant',
    location: 'Chicago, IL',
    age: 48,
    generation: 'Gen X',
    tenure: '12 Years',
    imageQuery: 'man with laptop coffee shop',
    quote: "I spend more time in airports than in the office. Make it mobile or forget it.",
    psychology: {
      stress: 'Being out of the loop while traveling to client sites.',
      motivation: 'Solving complex client problems and building lasting relationships.',
      painPoints: [
        'Tools that don\'t work offline',
        'Missing important updates while on the road',
      ],
    },
    communication: {
      do: [
        'Send concise mobile-friendly updates',
        'Record key meetings for async viewing',
      ],
      dont: [
        'Require desktop-only tools',
        'Expect immediate responses during travel',
      ],
    },
  },
  {
    id: 'zoe',
    name: 'Zoe Martinez',
    title: 'The Digital Native',
    role: 'UX Designer',
    location: 'Brooklyn, NY',
    age: 26,
    generation: 'Gen Z',
    tenure: '2 Years',
    imageQuery: 'young woman creative office',
    quote: "If you can't explain it in a TikTok, you probably don't understand it yourself.",
    psychology: {
      stress: 'Feeling unheard in meetings dominated by senior voices.',
      motivation: 'Creating inclusive designs that make technology accessible to everyone.',
      painPoints: [
        'Outdated processes that slow innovation',
        'Lack of mentorship opportunities',
      ],
    },
    communication: {
      do: [
        'Use visual formats and short videos',
        'Create space for fresh perspectives',
      ],
      dont: [
        'Dismiss ideas based on experience level',
        'Over-rely on text-heavy documentation',
      ],
    },
  },
  {
    id: 'elena',
    name: 'Elena Kowalski',
    title: 'The Integration Specialist',
    role: 'Systems Analyst',
    location: 'Boston, MA',
    age: 38,
    generation: 'Gen Y',
    tenure: '4 Years',
    imageQuery: 'woman working on computer',
    quote: "I joined through the acquisition. Sometimes I still feel like a guest.",
    psychology: {
      stress: 'Navigating two different company cultures and systems.',
      motivation: 'Proving the value of her team\'s expertise to the parent company.',
      painPoints: [
        'Access issues with core company systems',
        'Feeling excluded from key decisions',
      ],
    },
    communication: {
      do: [
        'Include context about company history and acronyms',
        'Ensure system access before sending tasks',
      ],
      dont: [
        'Assume familiarity with legacy processes',
        'Overlook integration team perspectives',
      ],
    },
  },
  {
    id: 'jayden',
    name: 'Jayden Park',
    title: 'The Culture Champion',
    role: 'Community Manager',
    location: 'Seattle, WA',
    age: 29,
    generation: 'Gen Z',
    tenure: '3 Years',
    imageQuery: 'young man smiling office',
    quote: "Work should be fun. If we're not connecting, we're just coworkers, not a team.",
    psychology: {
      stress: 'Remote work making it harder to build genuine connections.',
      motivation: 'Creating an inclusive workplace where everyone feels they belong.',
      painPoints: [
        'Low engagement on internal platforms',
        'Events that feel forced rather than organic',
      ],
    },
    communication: {
      do: [
        'Make announcements interactive and engaging',
        'Celebrate wins publicly',
      ],
      dont: [
        'Send dry corporate memos',
        'Ignore the human element in communications',
      ],
    },
  },
  {
    id: 'robert',
    name: 'Robert Thompson',
    title: 'The Experienced Voice',
    role: 'Principal Architect',
    location: 'Denver, CO',
    age: 56,
    generation: 'Boomer',
    tenure: '18 Years',
    imageQuery: 'senior man professional office',
    quote: "I've seen technologies come and go. What matters is solving real problems.",
    psychology: {
      stress: 'Constant pressure to adopt new tools without clear benefit.',
      motivation: 'Mentoring the next generation and leaving a lasting legacy.',
      painPoints: [
        'Change for change\'s sake',
        'Being dismissed as "old school"',
      ],
    },
    communication: {
      do: [
        'Explain the "why" behind changes',
        'Value institutional knowledge',
      ],
      dont: [
        'Assume resistance means inability to adapt',
        'Use trendy jargon without substance',
      ],
    },
  },
  {
    id: 'amanda',
    name: 'Amanda Brooks',
    title: 'The Revenue Driver',
    role: 'Account Executive',
    location: 'Miami, FL',
    age: 44,
    generation: 'Gen X',
    tenure: '10 Years',
    imageQuery: 'professional woman confident',
    quote: "Every minute I spend on internal admin is a minute I'm not closing deals.",
    psychology: {
      stress: 'Administrative burden cutting into selling time.',
      motivation: 'Crushing quotas and being recognized as a top performer.',
      painPoints: [
        'Internal processes that slow down deal cycles',
        'Lack of competitive intelligence',
      ],
    },
    communication: {
      do: [
        'Lead with the business impact',
        'Provide ready-to-use sales materials',
      ],
      dont: [
        'Bury important info in long emails',
        'Create more paperwork without clear ROI',
      ],
    },
  },
];

// Helper function to get persona by ID
export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}

// Amdocs personas have local images
const amdocsImageMap: Record<string, { src: string; position?: string }> = {
  maya: { src: '/images/personas/Maya_0.png', position: 'center top' },
  priya: { src: '/images/personas/Priya_slide10_0.png', position: 'center top' },
  anna: { src: '/images/personas/Anna_0.png', position: 'center top' },
  sahil: { src: '/images/personas/Sahil_0.png', position: 'center top' },
  ido: { src: '/images/personas/Ido_0.png', position: 'center top' },
  ben: { src: '/images/personas/Ben_0.png', position: 'center top' },
  alex: { src: '/images/personas/Alex_0.png', position: 'center top' },
  oliver: { src: '/images/personas/Oliver_0.png', position: 'center top' },
};

// Helper function to get image URL for a persona
export function getPersonaImage(persona: Persona): string {
  // Check if persona has a local image (Amdocs personas)
  const imageData = amdocsImageMap[persona.id];
  if (imageData?.src) {
    return imageData.src;
  }
  // Fall back to UI Avatars for mock personas
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&size=200&background=random&color=fff&bold=true`;
}

// Helper function to get image position for a persona (for object-position CSS)
export function getPersonaImagePosition(persona: Persona): string {
  const imageData = amdocsImageMap[persona.id];
  return imageData?.position || 'center';
}
