/**
 * Amdocs Employee Personas
 * Based on real employee research and communication preferences
 */

import { Persona, Generation } from './personas';

export const amdocsPersonas: Persona[] = [
  {
    id: 'maya',
    name: 'Maya',
    title: 'The Busy Bee Manager',
    role: 'Software Engineering Manager',
    location: "Ra'anana, Israel",
    age: 47,
    generation: 'Gen X' as Generation,
    tenure: '8 Years',
    imageQuery: 'professional woman manager',
    quote: "Vacation without limits - Seriously? For me it's just 'work without limits'. More vacation days for my employees = more stress for me.",
    psychology: {
      stress: 'Caught in the middle - expected to explain changes to her team while being left out of key processes.',
      motivation: 'Staying with the company long-term and taking on more responsibilities.',
      painPoints: [
        'Limited time and constant pressure',
        'Vague updates that add to frustration',
        'Lacks tools to cascade messages without support',
        'Carries emotional weight of team anxiety',
      ],
    },
    communication: {
      do: [
        'Send pre-brief kits before announcements (TL;DR + sample answers)',
        'Position her as a trusted messenger, not a last-minute echo',
        'Give her space to ask questions before she cascades information',
        'Use concise, summarized "bite size" content',
      ],
      dont: [
        'Send vague updates without context',
        'Overwhelm with long-form content',
        'Leave her out of the loop on changes affecting her team',
        'Expect her to cascade messages without preparation',
      ],
    },
  },
  {
    id: 'priya',
    name: 'Priya',
    title: 'The Digital Native',
    role: 'Software Engineer',
    location: 'Pune, India',
    age: 24,
    generation: 'Gen Z' as Generation,
    tenure: '6 Months',
    imageQuery: 'young professional woman engineer',
    quote: "I love the CEO Town Hall, it's fascinating listening to him. Just tell me how this impacts my role. Not paragraphs.",
    psychology: {
      stress: 'Content fatigue - overwhelmed by the volume and complexity of internal communications.',
      motivation: 'Growing, building something meaningful, and understanding her place in the company.',
      painPoints: [
        'Too much complex information to digest',
        'Unclear how company news impacts her role',
        'Seeks reassurance about growth opportunities',
        'Wants modern, digestible content formats',
      ],
    },
    communication: {
      do: [
        'Use short, vibrant, modern formats (speed, style, design)',
        'Clearly explain how updates impact her role',
        'Provide interactive experiences like forums and online communities',
        'Reinforce that she is seen, growing, and part of the next chapter',
      ],
      dont: [
        'Send long paragraphs without clear relevance',
        'Use outdated communication formats',
        'Ignore her need for skill development content',
        'Forget to show how her role fits the bigger picture',
      ],
    },
  },
  {
    id: 'anna',
    name: 'Anna',
    title: 'The Acquired Talent',
    role: 'Network Expert',
    location: 'Dublin, Ireland',
    age: 36,
    generation: 'Gen Y' as Generation,
    tenure: 'Joined via acquisition',
    imageQuery: 'professional woman network engineer',
    quote: "We don't feel a part of Amdocs yet. We are left out. We are not connected to the IT systems.",
    psychology: {
      stress: 'Low job security and limited access to information, leaving her feeling disconnected.',
      motivation: 'Establishing her identity within the company and finding balance between her old company and Amdocs.',
      painPoints: [
        'Feels left out of the loop',
        'Receives forwarded messages with broken links',
        'Identifies more with former company culture',
        'Direct manager is also disconnected from Amdocs',
      ],
    },
    communication: {
      do: [
        'Provide access to professional and personal development materials',
        'Give visibility into the big picture and make her feel part of it',
        'Create opportunities for social connection with colleagues',
        'Use official, branded communications for important updates',
      ],
      dont: [
        'Forward messages with broken links or missing content',
        'Assume she has access to all Amdocs systems',
        'Rely on informal channels as primary communication',
        'Ignore her need to feel included in the company culture',
      ],
    },
  },
  {
    id: 'sahil',
    name: 'Sahil',
    title: 'The Social Connector',
    role: 'Program Manager, AT&T',
    location: 'Dallas, TX (Expat)',
    age: 28,
    generation: 'Gen Y' as Generation,
    tenure: '6 Years',
    imageQuery: 'young professional man manager',
    quote: "The town halls are an opportunity to meet the guys. Why don't we have the same cool events here as they do in Ra'anana?",
    psychology: {
      stress: 'Feeling left out of company events and culture compared to headquarters.',
      motivation: 'Building social connections and being recognized for his initiatives.',
      painPoints: [
        'Company events are disappointing compared to HQ',
        'Feels isolated as an expat',
        'Leads social activities without company support',
        'Remote manager is less relevant for daily needs',
      ],
    },
    communication: {
      do: [
        'Provide opportunities to be seen and heard',
        'Support and leverage his social initiatives',
        'Enable connecting with colleagues outside work hours',
        'Build networks of employees like him across sites',
      ],
      dont: [
        'Rely only on digital channels - he prefers face-to-face',
        'Ignore the social aspect of Town Halls',
        'Assume remote employees feel included automatically',
        'Overlook expat-specific challenges',
      ],
    },
  },
  {
    id: 'ido',
    name: 'Ido',
    title: 'The Skeptical Veteran',
    role: 'Software Engineering Manager',
    location: "Ra'anana, Israel",
    age: 58,
    generation: 'Boomer' as Generation,
    tenure: '15 Years',
    imageQuery: 'senior professional man manager',
    quote: "ESPP - Finally! But why is it happening now? What's the motivation behind it? Do they genuinely want to hear my input?",
    psychology: {
      stress: 'Feeling detached from the core business and skeptical of corporate messaging.',
      motivation: 'Finding meaning through volunteering and external activities.',
      painPoints: [
        'Distrusts senior management communications',
        'Resistant to new technologies and change',
        'Prefers traditional methods',
        'Hot topics are personal (family, volunteering), not work',
      ],
    },
    communication: {
      do: [
        'Send sincere, honest messages with no sugarcoating',
        'Use trustworthy, reliable channels (like a colleague)',
        'Share information about volunteering initiatives',
        'Give opportunities to ask questions and be heard',
      ],
      dont: [
        'Use corporate jargon or overly polished messaging',
        'Push new digital tools without support',
        'Ignore his feedback or dismiss his concerns',
        'Assume he cares about the same topics as younger employees',
      ],
    },
  },
  {
    id: 'ben',
    name: 'Ben',
    title: 'The Career Climber',
    role: 'Product Marketing Lead',
    location: 'New Jersey, USA',
    age: 35,
    generation: 'Gen Y' as Generation,
    tenure: '4 Years',
    imageQuery: 'professional man marketing',
    quote: "It's important for me to read the CEO letters, to learn how he thinks... it's like an autobiography of a leader.",
    psychology: {
      stress: 'Balancing visibility goals with limited time for social activities.',
      motivation: 'Career advancement and being seen as someone who gets things done.',
      painPoints: [
        'Not very socially involved in the company',
        'Limited time for anything beyond career-focused activities',
        'Needs to be seen at Town Halls',
        'Autodidactic - prefers DIY learning tools',
      ],
    },
    communication: {
      do: [
        'Provide leadership content from senior executives',
        'Help him network with similar mindset people',
        'Share relevant career opportunity information',
        'Use precise, technical, "bite size" content',
      ],
      dont: [
        'Waste his time with social content he wont engage with',
        'Send long-form content without clear value',
        'Ignore his interest in leadership insights',
        'Overlook his career development needs',
      ],
    },
  },
  {
    id: 'alex',
    name: 'Alex',
    title: 'The Business Executive',
    role: 'Customer Business Executive',
    location: 'Plano, TX',
    age: 49,
    generation: 'Gen X' as Generation,
    tenure: '17 Years',
    imageQuery: 'senior business executive man',
    quote: "I set aside all the emails I receive on Monday morning. Sometimes, they just disappear. Every email should clearly highlight what's in it for me.",
    psychology: {
      stress: 'Back-to-back meetings and high volume of emails make it hard to stay informed.',
      motivation: 'Performing better with the right tools and information.',
      painPoints: [
        'Misses personal touch in large Town Halls',
        'Cant read entire Monday Mail edition',
        'Emails get lost in the volume',
        'Wants account-specific topics, not general ones',
      ],
    },
    communication: {
      do: [
        'Send short, concise emails with "read more" option',
        'Provide clear updates on sales strategies and competitor performance',
        'Share sales training and new tools that help performance',
        'Use push notifications - his Teams is always open',
      ],
      dont: [
        'Send long emails without clear "whats in it for me"',
        'Rely only on email - use Teams notifications',
        'Include too many general topics in Town Halls',
        'Forget mobile-friendly formatting',
      ],
    },
  },
  {
    id: 'oliver',
    name: 'Oliver',
    title: 'The Site Leader',
    role: 'Service Partner, CSU',
    location: 'UK',
    age: 44,
    generation: 'Gen X' as Generation,
    tenure: '15 Years',
    imageQuery: 'senior professional man leader',
    quote: "I often struggle with communications that aren't mobile-friendly. I don't have time for long emails, especially when links don't work on my mobile.",
    psychology: {
      stress: 'Responsibility for site engagement while feeling under-recognized.',
      motivation: 'Fostering greater engagement and connection at his site.',
      painPoints: [
        'Employees reach out with questions beyond his domain',
        'Insufficient recognition for his efforts',
        'Non-mobile-friendly communications are frustrating',
        'Long emails with broken links waste his time',
      ],
    },
    communication: {
      do: [
        'Ensure all communications are mobile-friendly',
        'Keep emails short and actionable',
        'Recognize his contributions to site engagement',
        'Support employee-led local initiatives',
      ],
      dont: [
        'Send long emails with broken mobile links',
        'Ignore his role as a go-to person on site',
        'Overlook local initiatives formed by employees',
        'Forget to test links on mobile devices',
      ],
    },
  },
];

// Helper to get Amdocs persona by ID
export function getAmdocsPersonaById(id: string): Persona | undefined {
  return amdocsPersonas.find(p => p.id === id);
}

