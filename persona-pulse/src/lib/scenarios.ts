// Role-Play Scenarios for Persona Pulse Explorer

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  personaId: string;
  context: string;
  userGoal: string;
  userRole: string;
  evaluationCriteria: string[];
  estimatedMinutes: number;
}

export interface ScenarioFeedback {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

export const difficultyColors: Record<Difficulty, { bg: string; text: string; badge: string }> = {
  Easy: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-500',
  },
  Medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-500',
  },
  Hard: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-500',
  },
};

export const scenarios: Scenario[] = [
  // SARAH - Marketing Specialist (Gen Y)
  {
    id: 'sarah-campaign-pitch',
    title: 'Campaign Pitch',
    description: 'Present a new marketing campaign idea to get buy-in from leadership.',
    difficulty: 'Easy',
    personaId: 'sarah',
    userRole: 'Marketing Director',
    context: `You are Sarah, and your manager (the user) is asking you to pitch a new campaign idea. You're excited about a social media campaign targeting Gen Z audiences. You have data showing competitors are succeeding with this approach. Be enthusiastic but also ready to defend your idea with data.`,
    userGoal: 'Evaluate the campaign proposal and ask probing questions. Practice giving constructive feedback while maintaining enthusiasm.',
    evaluationCriteria: ['Asked clarifying questions', 'Showed interest in data', 'Provided constructive feedback', 'Maintained collaborative tone'],
    estimatedMinutes: 5,
  },
  {
    id: 'sarah-negative-feedback',
    title: 'Campaign Review',
    description: 'A recent campaign underperformed. Discuss what went wrong.',
    difficulty: 'Medium',
    personaId: 'sarah',
    userRole: 'Marketing Director',
    context: `You are Sarah, and your recent email campaign had a 2% open rate (well below the 15% target). You feel defensive because you worked hard on it, but you're also a professional who wants to learn. You suspect the timing was off.`,
    userGoal: 'Deliver negative feedback constructively while keeping Sarah motivated.',
    evaluationCriteria: ['Started with empathy', 'Focused on work not person', 'Asked for perspective first', 'Collaborated on solutions'],
    estimatedMinutes: 7,
  },
  {
    id: 'sarah-budget-request',
    title: 'Budget Request',
    description: 'Sarah is requesting additional budget for a new marketing tool.',
    difficulty: 'Medium',
    personaId: 'sarah',
    userRole: 'Finance Manager',
    context: `You are Sarah, requesting a $5,000/year marketing automation tool. You believe it will save 10 hours per week. You have ROI calculations ready if asked.`,
    userGoal: 'Evaluate the budget request and practice making a decision.',
    evaluationCriteria: ['Asked about ROI', 'Considered alternatives', 'Made clear decision', 'Explained reasoning'],
    estimatedMinutes: 5,
  },

  // MARCUS - Project Manager (Gen X)
  {
    id: 'marcus-deadline-slip',
    title: 'Deadline Extension',
    description: 'The project deadline needs to be pushed back. Break the news.',
    difficulty: 'Hard',
    personaId: 'marcus',
    userRole: 'Product Owner',
    context: `You are Marcus, and the project is behind due to technical debt. You need a 2-week extension. You've tried to compress the timeline but it's not feasible without sacrificing quality.`,
    userGoal: 'Communicate the delay professionally and negotiate a new timeline.',
    evaluationCriteria: ['Acknowledged impact', 'Explained root cause', 'Proposed new timeline', 'Discussed mitigation'],
    estimatedMinutes: 8,
  },
  {
    id: 'marcus-resource-conflict',
    title: 'Resource Conflict',
    description: 'Two projects need the same developer. Negotiate priorities.',
    difficulty: 'Medium',
    personaId: 'marcus',
    userRole: 'Department Head',
    context: `You are Marcus, and your key developer is being pulled onto another project mid-sprint. You need this developer to finish critical features.`,
    userGoal: 'Mediate the resource conflict and find a fair solution.',
    evaluationCriteria: ['Understood both sides', 'Asked about priorities', 'Proposed creative solutions', 'Made clear decision'],
    estimatedMinutes: 6,
  },
  {
    id: 'marcus-stakeholder-update',
    title: 'Stakeholder Update',
    description: 'Give Marcus a project status update.',
    difficulty: 'Easy',
    personaId: 'marcus',
    userRole: 'Team Lead',
    context: `You are Marcus, and your team lead is giving you a project status update. You want straight facts - what's on track, what's at risk.`,
    userGoal: 'Deliver a clear, honest project update.',
    evaluationCriteria: ['Provided specific metrics', 'Highlighted risks proactively', 'Was direct and concise', 'Answered follow-ups honestly'],
    estimatedMinutes: 5,
  },

  // DAVID - HR Manager (Boomer)
  {
    id: 'david-difficult-news',
    title: 'Delivering Bad News',
    description: 'Inform David about budget cuts affecting his department.',
    difficulty: 'Hard',
    personaId: 'david',
    userRole: 'Senior Director',
    context: `You are David, about to receive news that your training budget is being cut by 40%. You've been planning a major leadership development program that now can't happen.`,
    userGoal: 'Deliver difficult news with empathy while being clear about the decision.',
    evaluationCriteria: ['Was direct but empathetic', 'Explained reasoning', 'Acknowledged impact', 'Offered support'],
    estimatedMinutes: 8,
  },
  {
    id: 'david-conflict-mediation',
    title: 'Conflict Mediation',
    description: 'Two team members have an ongoing conflict. Seek David\'s advice.',
    difficulty: 'Medium',
    personaId: 'david',
    userRole: 'Team Manager',
    context: `You are David, an experienced HR manager being consulted about a team conflict. You'll ask clarifying questions and provide guidance.`,
    userGoal: 'Present a conflict situation clearly and demonstrate good listening.',
    evaluationCriteria: ['Described situation objectively', 'Didn\'t take sides', 'Asked for guidance', 'Showed willingness to act'],
    estimatedMinutes: 6,
  },
  {
    id: 'david-performance-review',
    title: 'Performance Discussion',
    description: 'Get David\'s input on a challenging performance review.',
    difficulty: 'Medium',
    personaId: 'david',
    userRole: 'Manager',
    context: `You are David, and a manager is asking for advice on handling a difficult performance review. The employee has potential but has been underperforming for 3 months.`,
    userGoal: 'Present the performance situation and collaborate on an approach.',
    evaluationCriteria: ['Provided specific examples', 'Showed empathy', 'Was open to HR guidance', 'Focused on improvement'],
    estimatedMinutes: 7,
  },

  // JAYDEN - Community Manager (Gen Z)
  {
    id: 'jayden-team-morale',
    title: 'Team Morale Check',
    description: 'The team seems disengaged. Get Jayden\'s read on the situation.',
    difficulty: 'Easy',
    personaId: 'jayden',
    userRole: 'Team Lead',
    context: `You are Jayden, and you've noticed the team has been quieter in meetings. You have theories: recent layoffs created uncertainty, and projects felt rushed.`,
    userGoal: 'Have an open conversation about team morale and gather insights.',
    evaluationCriteria: ['Asked open-ended questions', 'Listened without interrupting', 'Showed genuine concern', 'Asked for suggestions'],
    estimatedMinutes: 5,
  },
  {
    id: 'jayden-culture-initiative',
    title: 'Culture Initiative',
    description: 'Jayden proposes a new team-building initiative. Evaluate it.',
    difficulty: 'Medium',
    personaId: 'jayden',
    userRole: 'Manager',
    context: `You are Jayden, proposing a monthly "Innovation Day" where the team works on side projects. You've researched how other companies do this.`,
    userGoal: 'Evaluate the proposal fairly and provide constructive feedback.',
    evaluationCriteria: ['Showed interest', 'Asked about logistics', 'Gave constructive feedback', 'Made clear decision'],
    estimatedMinutes: 6,
  },
  {
    id: 'jayden-onboarding',
    title: 'Onboarding Feedback',
    description: 'Get Jayden\'s feedback on the new hire onboarding process.',
    difficulty: 'Easy',
    personaId: 'jayden',
    userRole: 'HR Coordinator',
    context: `You are Jayden, and you recently helped onboard a new team member. The buddy system was great, but documentation was outdated.`,
    userGoal: 'Gather detailed feedback and show appreciation.',
    evaluationCriteria: ['Asked specific questions', 'Took notes', 'Asked for prioritization', 'Thanked for feedback'],
    estimatedMinutes: 4,
  },

  // ELENA - Systems Analyst (Gen Y)
  {
    id: 'elena-technical-explanation',
    title: 'Technical Explanation',
    description: 'Elena explains a system issue to non-technical stakeholders.',
    difficulty: 'Medium',
    personaId: 'elena',
    userRole: 'Business Stakeholder',
    context: `You are Elena, explaining why a feature request will take 3 weeks, not 3 days. The issue involves legacy system integration that non-technical people don't understand.`,
    userGoal: 'Listen to the technical explanation and ask clarifying questions.',
    evaluationCriteria: ['Listened without interrupting', 'Asked relevant questions', 'Didn\'t dismiss complexity', 'Showed appreciation'],
    estimatedMinutes: 6,
  },
  {
    id: 'elena-resource-request',
    title: 'Resource Request',
    description: 'Elena needs additional server resources. Make the case.',
    difficulty: 'Medium',
    personaId: 'elena',
    userRole: 'IT Director',
    context: `You are Elena, requesting additional cloud resources because current capacity is at 85%. You have metrics showing performance degradation.`,
    userGoal: 'Evaluate the resource request and make a decision.',
    evaluationCriteria: ['Asked about metrics', 'Considered alternatives', 'Understood risk', 'Made clear decision'],
    estimatedMinutes: 5,
  },
  {
    id: 'elena-system-outage',
    title: 'System Outage',
    description: 'A critical system is down. Get Elena\'s status update.',
    difficulty: 'Hard',
    personaId: 'elena',
    userRole: 'Operations Director',
    context: `You are Elena, in the middle of resolving a production outage. The main API has been down for 45 minutes. You've identified the issue and expect a fix in 20 minutes.`,
    userGoal: 'Get a clear status update without adding stress.',
    evaluationCriteria: ['Asked without micromanaging', 'Offered support', 'Didn\'t assign blame', 'Trusted the team'],
    estimatedMinutes: 5,
  },

  // ROBERT - Retired Executive (Boomer)
  {
    id: 'robert-mentoring',
    title: 'Career Mentoring',
    description: 'Ask Robert for career advice as a new manager.',
    difficulty: 'Easy',
    personaId: 'robert',
    userRole: 'New Manager',
    context: `You are Robert, a retired executive who mentors new leaders. You have 30+ years of experience and believe in fundamentals: clear communication, accountability, respect.`,
    userGoal: 'Ask thoughtful questions and show genuine interest in learning.',
    evaluationCriteria: ['Asked specific questions', 'Listened actively', 'Shared own challenges', 'Showed appreciation'],
    estimatedMinutes: 6,
  },
  {
    id: 'robert-strategy-advice',
    title: 'Strategy Discussion',
    description: 'Get Robert\'s input on a major strategic decision.',
    difficulty: 'Medium',
    personaId: 'robert',
    userRole: 'CEO',
    context: `You are Robert, and a CEO is consulting you on whether to enter a new market. You'll ask probing questions and share relevant lessons.`,
    userGoal: 'Present a strategic decision clearly and engage with questions.',
    evaluationCriteria: ['Presented clearly', 'Was open to challenge', 'Asked for input', 'Willing to reconsider'],
    estimatedMinutes: 7,
  },
  {
    id: 'robert-change-resistance',
    title: 'Change Management',
    description: 'Robert is skeptical of a new initiative. Address his concerns.',
    difficulty: 'Hard',
    personaId: 'robert',
    userRole: 'Change Lead',
    context: `You are Robert, skeptical of a new agile transformation. You've seen many "transformations" that were just buzzword exercises. You want substance.`,
    userGoal: 'Address skepticism thoughtfully and earn buy-in through substance.',
    evaluationCriteria: ['Listened respectfully', 'Didn\'t dismiss skepticism', 'Provided examples', 'Acknowledged past failures'],
    estimatedMinutes: 8,
  },

  // ZOE - Data Analyst (Gen Z)
  {
    id: 'zoe-presenting-findings',
    title: 'Data Presentation',
    description: 'Zoe presents surprising data findings. Respond appropriately.',
    difficulty: 'Medium',
    personaId: 'zoe',
    userRole: 'VP of Sales',
    context: `You are Zoe, presenting data that shows the sales team's top performer actually has the lowest customer retention. This is uncomfortable data that challenges assumptions.`,
    userGoal: 'Receive surprising data professionally and decide on next steps.',
    evaluationCriteria: ['Didn\'t shoot the messenger', 'Asked about methodology', 'Considered implications', 'Decided on follow-up'],
    estimatedMinutes: 6,
  },
  {
    id: 'zoe-data-access',
    title: 'Data Access Request',
    description: 'Zoe needs access to sensitive customer data. Evaluate the request.',
    difficulty: 'Medium',
    personaId: 'zoe',
    userRole: 'Data Privacy Officer',
    context: `You are Zoe, requesting access to customer purchase history for a churn analysis project. You understand there are privacy implications.`,
    userGoal: 'Evaluate the data access request considering business value and privacy.',
    evaluationCriteria: ['Asked about purpose', 'Considered privacy', 'Proposed alternatives', 'Made clear decision'],
    estimatedMinutes: 5,
  },
  {
    id: 'zoe-automation-pitch',
    title: 'Automation Proposal',
    description: 'Zoe proposes automating a manual reporting process.',
    difficulty: 'Easy',
    personaId: 'zoe',
    userRole: 'Operations Manager',
    context: `You are Zoe, proposing to automate the weekly sales report that currently takes 4 hours to compile manually. Your solution would reduce it to 15 minutes.`,
    userGoal: 'Evaluate the automation proposal and decide whether to approve it.',
    evaluationCriteria: ['Asked about requirements', 'Considered ROI', 'Asked about risks', 'Made clear decision'],
    estimatedMinutes: 5,
  },

  // AMANDA - Customer Success Manager (Gen X)
  {
    id: 'amanda-upset-customer',
    title: 'Upset Customer',
    description: 'Amanda is dealing with an angry customer. Provide support.',
    difficulty: 'Medium',
    personaId: 'amanda',
    userRole: 'CS Director',
    context: `You are Amanda, and a major customer is threatening to leave due to repeated product issues. The customer represents $200K in annual revenue.`,
    userGoal: 'Provide support and guidance for handling an escalated situation.',
    evaluationCriteria: ['Asked for context', 'Showed empathy', 'Provided actionable guidance', 'Offered to help'],
    estimatedMinutes: 6,
  },
  {
    id: 'amanda-escalation',
    title: 'Issue Escalation',
    description: 'Amanda needs to escalate a product bug affecting customers.',
    difficulty: 'Easy',
    personaId: 'amanda',
    userRole: 'Product Manager',
    context: `You are Amanda, escalating a bug affecting 15% of customers. You've documented the issue and business impact.`,
    userGoal: 'Receive the escalation professionally and commit to action.',
    evaluationCriteria: ['Listened to full issue', 'Asked clarifying questions', 'Acknowledged impact', 'Committed to next steps'],
    estimatedMinutes: 4,
  },
  {
    id: 'amanda-renewal',
    title: 'Contract Renewal',
    description: 'A key customer is considering not renewing. Strategize with Amanda.',
    difficulty: 'Hard',
    personaId: 'amanda',
    userRole: 'VP of Customer Success',
    context: `You are Amanda, and a top account is considering not renewing. They're not unhappy, but a competitor is offering a lower price.`,
    userGoal: 'Collaborate on a renewal strategy and empower Amanda to save the account.',
    evaluationCriteria: ['Understood situation', 'Discussed approaches', 'Provided discount authority', 'Trusted judgment'],
    estimatedMinutes: 7,
  },

  // ========== AMDOCS PERSONAS ==========

  // MAYA - Busy Bee Manager (Gen X)
  {
    id: 'maya-cascade-announcement',
    title: 'Cascade Company Announcement',
    description: 'Help Maya prepare to communicate a major company change to her team.',
    difficulty: 'Medium',
    personaId: 'maya',
    userRole: 'Internal Communications Manager',
    context: `You are Maya, a Software Engineering Manager who just learned about a major organizational restructuring. You need to communicate this to your team but weren't given any talking points or pre-brief materials. You're feeling anxious about answering questions you can't answer.`,
    userGoal: 'Provide Maya with the support she needs to cascade the message effectively.',
    evaluationCriteria: ['Provided TL;DR summary', 'Offered sample Q&A', 'Gave her time to ask questions', 'Empowered her as a trusted messenger'],
    estimatedMinutes: 6,
  },
  {
    id: 'maya-team-anxiety',
    title: 'Team Anxiety Management',
    description: 'Maya\'s team is stressed about upcoming changes. Help her address their concerns.',
    difficulty: 'Hard',
    personaId: 'maya',
    userRole: 'HR Business Partner',
    context: `You are Maya, and your team is anxious about rumors of layoffs. You don't have clear information yourself, and the lack of communication is making things worse. You're carrying the emotional weight of your team's anxiety.`,
    userGoal: 'Help Maya manage her team\'s anxiety while acknowledging her own challenges.',
    evaluationCriteria: ['Acknowledged her stress', 'Provided clarity where possible', 'Gave actionable advice', 'Offered ongoing support'],
    estimatedMinutes: 7,
  },

  // PRIYA - Digital Native (Gen Z)
  {
    id: 'priya-onboarding-feedback',
    title: 'Onboarding Experience',
    description: 'Priya shares feedback about her first 6 months. Listen and respond.',
    difficulty: 'Easy',
    personaId: 'priya',
    userRole: 'HR Manager',
    context: `You are Priya, a new Software Engineer at Amdocs for 6 months. You love the CEO Town Halls but feel overwhelmed by the volume of internal communications. You want to know how updates impact your specific role.`,
    userGoal: 'Gather feedback and show Priya she is valued and growing.',
    evaluationCriteria: ['Used active listening', 'Asked follow-up questions', 'Reinforced her value', 'Committed to improvements'],
    estimatedMinutes: 5,
  },
  {
    id: 'priya-career-path',
    title: 'Career Development Chat',
    description: 'Priya wants to understand her career path at Amdocs.',
    difficulty: 'Medium',
    personaId: 'priya',
    userRole: 'Engineering Manager',
    context: `You are Priya, eager to grow at Amdocs but unsure about your career path. You want clarity on what skills to develop and how you fit into the bigger picture.`,
    userGoal: 'Help Priya see her future at the company and feel motivated.',
    evaluationCriteria: ['Discussed specific growth areas', 'Connected her role to company goals', 'Offered mentorship or resources', 'Showed genuine interest'],
    estimatedMinutes: 6,
  },

  // ANNA - Acquired Talent (Gen Y)
  {
    id: 'anna-integration-challenges',
    title: 'Integration Struggles',
    description: 'Anna shares frustrations about feeling left out after the acquisition.',
    difficulty: 'Medium',
    personaId: 'anna',
    userRole: 'Integration Lead',
    context: `You are Anna, a Network Expert who joined Amdocs via acquisition. You feel disconnected from Amdocs systems and culture. You often receive forwarded messages with broken links and missing context.`,
    userGoal: 'Acknowledge Anna\'s challenges and provide concrete help.',
    evaluationCriteria: ['Validated her feelings', 'Offered specific solutions', 'Committed to follow-up', 'Made her feel included'],
    estimatedMinutes: 6,
  },
  {
    id: 'anna-access-request',
    title: 'System Access Issues',
    description: 'Anna is frustrated about not having access to key Amdocs systems.',
    difficulty: 'Easy',
    personaId: 'anna',
    userRole: 'IT Support Manager',
    context: `You are Anna, and you've been waiting 3 months for access to key Amdocs systems. Your manager is also from the acquired company and can't help. You're missing important information.`,
    userGoal: 'Resolve Anna\'s access issues and improve her experience.',
    evaluationCriteria: ['Understood the urgency', 'Took ownership', 'Provided timeline', 'Showed empathy'],
    estimatedMinutes: 5,
  },

  // SAHIL - Social Connector (Gen Y)
  {
    id: 'sahil-event-proposal',
    title: 'Site Event Proposal',
    description: 'Sahil wants company support for a social event he\'s organizing.',
    difficulty: 'Easy',
    personaId: 'sahil',
    userRole: 'Site Manager',
    context: `You are Sahil, an expat in Dallas who has organized rugby tournaments and BBQs on your own. You want the company to officially support your Dallas Marathon team initiative.`,
    userGoal: 'Evaluate Sahil\'s proposal and provide appropriate support.',
    evaluationCriteria: ['Showed appreciation for initiative', 'Asked about details', 'Offered concrete support', 'Connected him with resources'],
    estimatedMinutes: 5,
  },
  {
    id: 'sahil-site-fairness',
    title: 'Site Equality Concerns',
    description: 'Sahil raises concerns about Dallas site getting less attention than HQ.',
    difficulty: 'Medium',
    personaId: 'sahil',
    userRole: 'VP of Employee Experience',
    context: `You are Sahil, frustrated that Dallas rarely gets the cool events that happen in Ra'anana. You feel left out and want more company investment in your site's culture.`,
    userGoal: 'Address Sahil\'s concerns about site fairness and inclusion.',
    evaluationCriteria: ['Acknowledged the disparity', 'Explained constraints honestly', 'Offered alternatives', 'Committed to improvements'],
    estimatedMinutes: 6,
  },

  // IDO - Skeptical Veteran (Boomer)
  {
    id: 'ido-survey-skepticism',
    title: 'Survey Skepticism',
    description: 'Ido questions whether leadership actually listens to survey feedback.',
    difficulty: 'Hard',
    personaId: 'ido',
    userRole: 'HR Director',
    context: `You are Ido, a 15-year veteran who has seen many surveys come and go without change. You're skeptical that leadership genuinely wants input. You want honest answers, not corporate speak.`,
    userGoal: 'Build trust with Ido by being genuine and transparent.',
    evaluationCriteria: ['Avoided corporate jargon', 'Provided concrete examples of change', 'Acknowledged past failures', 'Was honest about limitations'],
    estimatedMinutes: 7,
  },
  {
    id: 'ido-new-tool-adoption',
    title: 'New Tool Resistance',
    description: 'Ido resists adopting a new digital collaboration tool.',
    difficulty: 'Medium',
    personaId: 'ido',
    userRole: 'IT Change Manager',
    context: `You are Ido, and you're being asked to adopt a new project management tool. You've been using your current methods for years and don't see the benefit. You prefer getting information from trusted colleagues.`,
    userGoal: 'Help Ido understand the value of the new tool without being pushy.',
    evaluationCriteria: ['Respected his experience', 'Explained benefits clearly', 'Offered training support', 'Didn\'t dismiss his concerns'],
    estimatedMinutes: 6,
  },

  // BEN - Career Climber (Gen Y)
  {
    id: 'ben-visibility-request',
    title: 'Visibility Opportunity',
    description: 'Ben wants to present at an upcoming leadership meeting.',
    difficulty: 'Easy',
    personaId: 'ben',
    userRole: 'Marketing Director',
    context: `You are Ben, a Product Marketing Lead who has delivered great results. You want to present your recent campaign success at the quarterly leadership meeting for visibility.`,
    userGoal: 'Evaluate Ben\'s request and provide appropriate opportunity.',
    evaluationCriteria: ['Recognized his achievements', 'Asked about his goals', 'Provided clear answer', 'Offered alternatives if declining'],
    estimatedMinutes: 5,
  },
  {
    id: 'ben-networking-ask',
    title: 'Networking Introduction',
    description: 'Ben asks for an introduction to a senior leader.',
    difficulty: 'Medium',
    personaId: 'ben',
    userRole: 'VP of Product',
    context: `You are Ben, wanting to expand your network with senior leaders who share your mindset. You've asked your VP for an introduction to the Chief Product Officer.`,
    userGoal: 'Handle Ben\'s networking request professionally.',
    evaluationCriteria: ['Understood his motivation', 'Set appropriate expectations', 'Offered helpful guidance', 'Made a decision'],
    estimatedMinutes: 5,
  },

  // ALEX - Business Executive (Gen X)
  {
    id: 'alex-email-overload',
    title: 'Email Overload Discussion',
    description: 'Alex shares frustration about too many long emails with unclear value.',
    difficulty: 'Easy',
    personaId: 'alex',
    userRole: 'Internal Communications Manager',
    context: `You are Alex, a Customer Business Executive drowning in emails. You set aside Monday emails and they often disappear. You want emails that clearly highlight "what's in it for me."`,
    userGoal: 'Gather feedback and commit to communication improvements.',
    evaluationCriteria: ['Listened without defensiveness', 'Asked for specific examples', 'Committed to actionable changes', 'Followed up appropriately'],
    estimatedMinutes: 5,
  },
  {
    id: 'alex-sales-update',
    title: 'Sales Strategy Update',
    description: 'Provide Alex with a sales strategy update in his preferred format.',
    difficulty: 'Medium',
    personaId: 'alex',
    userRole: 'Sales Enablement Lead',
    context: `You are Alex, with back-to-back meetings and limited time. You need updates on competitor moves and new sales tools, but delivered in a digestible format.`,
    userGoal: 'Deliver important information in Alex\'s preferred communication style.',
    evaluationCriteria: ['Was concise and clear', 'Highlighted key takeaways first', 'Offered "read more" option', 'Respected his time'],
    estimatedMinutes: 5,
  },

  // OLIVER - Site Leader (Gen X)
  {
    id: 'oliver-mobile-frustration',
    title: 'Mobile Communication Issues',
    description: 'Oliver expresses frustration about non-mobile-friendly communications.',
    difficulty: 'Easy',
    personaId: 'oliver',
    userRole: 'Digital Communications Lead',
    context: `You are Oliver, a Service Partner who works mostly on mobile. You're frustrated that links don't work on mobile and emails are too long to read on the go.`,
    userGoal: 'Address Oliver\'s mobile experience concerns.',
    evaluationCriteria: ['Acknowledged the issue', 'Explained improvement plans', 'Asked for specific examples', 'Committed to mobile-first approach'],
    estimatedMinutes: 5,
  },
  {
    id: 'oliver-recognition-gap',
    title: 'Recognition Discussion',
    description: 'Oliver feels his site engagement efforts go unrecognized.',
    difficulty: 'Medium',
    personaId: 'oliver',
    userRole: 'HR Director',
    context: `You are Oliver, the most senior VP on site who takes responsibility for engagement. Employees come to you for guidance on everything. You feel there isn't sufficient recognition for these efforts.`,
    userGoal: 'Acknowledge Oliver\'s contributions and discuss recognition.',
    evaluationCriteria: ['Validated his contributions', 'Asked about specific efforts', 'Discussed recognition options', 'Showed genuine appreciation'],
    estimatedMinutes: 6,
  },
];

export function getScenariosForPersona(personaId: string): Scenario[] {
  return scenarios.filter((s) => s.personaId === personaId);
}

export function getScenarioById(scenarioId: string): Scenario | undefined {
  return scenarios.find((s) => s.id === scenarioId);
}

export function getScenarioCountForPersona(personaId: string): number {
  return getScenariosForPersona(personaId).length;
}
