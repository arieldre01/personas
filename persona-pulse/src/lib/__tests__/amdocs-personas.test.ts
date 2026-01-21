import { describe, it, expect } from 'vitest';
import { amdocsPersonas, getAmdocsPersonaById } from '../amdocs-personas';
import { getScenariosForPersona, getScenarioById } from '../scenarios';
import { getPersonaImage, getPersonaImagePosition } from '../personas';

// Expected Amdocs persona IDs
const EXPECTED_PERSONA_IDS = ['maya', 'priya', 'anna', 'sahil', 'ido', 'ben', 'alex', 'oliver'];

// Expected persona data for validation
const EXPECTED_PERSONAS = {
  maya: {
    name: 'Maya',
    title: 'The Busy Bee Manager',
    role: 'Software Engineering Manager',
    location: "Ra'anana, Israel",
    age: 47,
    generation: 'Gen X',
    tenure: '8 Years',
  },
  priya: {
    name: 'Priya',
    title: 'The Digital Native',
    role: 'Software Engineer',
    location: 'Pune, India',
    age: 24,
    generation: 'Gen Z',
    tenure: '6 Months',
  },
  anna: {
    name: 'Anna',
    title: 'The Acquired Talent',
    role: 'Network Expert',
    location: 'Dublin, Ireland',
    age: 36,
    generation: 'Gen Y',
    tenure: 'Joined via acquisition',
  },
  sahil: {
    name: 'Sahil',
    title: 'The Social Connector',
    role: 'Program Manager, AT&T',
    location: 'Dallas, TX (Expat)',
    age: 28,
    generation: 'Gen Y',
    tenure: '6 Years',
  },
  ido: {
    name: 'Ido',
    title: 'The Skeptical Veteran',
    role: 'Software Engineering Manager',
    location: "Ra'anana, Israel",
    age: 58,
    generation: 'Boomer',
    tenure: '15 Years',
  },
  ben: {
    name: 'Ben',
    title: 'The Career Climber',
    role: 'Product Marketing Lead',
    location: 'New Jersey, USA',
    age: 35,
    generation: 'Gen Y',
    tenure: '4 Years',
  },
  alex: {
    name: 'Alex',
    title: 'The Business Executive',
    role: 'Customer Business Executive',
    location: 'Plano, TX',
    age: 49,
    generation: 'Gen X',
    tenure: '17 Years',
  },
  oliver: {
    name: 'Oliver',
    title: 'The Site Leader',
    role: 'Service Partner, CSU',
    location: 'UK',
    age: 44,
    generation: 'Gen X',
    tenure: '15 Years',
  },
};

describe('Amdocs Personas', () => {
  describe('Persona Count and IDs', () => {
    it('should have exactly 8 Amdocs personas', () => {
      expect(amdocsPersonas).toHaveLength(8);
    });

    it('should have all expected persona IDs', () => {
      const personaIds = amdocsPersonas.map(p => p.id);
      EXPECTED_PERSONA_IDS.forEach(id => {
        expect(personaIds).toContain(id);
      });
    });

    it('should have unique IDs for all personas', () => {
      const ids = amdocsPersonas.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Persona Data Structure', () => {
    it.each(EXPECTED_PERSONA_IDS)('persona "%s" should have all required fields', (personaId) => {
      const persona = getAmdocsPersonaById(personaId);
      expect(persona).toBeDefined();
      
      // Core fields
      expect(persona?.id).toBeDefined();
      expect(persona?.name).toBeDefined();
      expect(persona?.title).toBeDefined();
      expect(persona?.role).toBeDefined();
      expect(persona?.location).toBeDefined();
      expect(persona?.age).toBeDefined();
      expect(persona?.generation).toBeDefined();
      expect(persona?.tenure).toBeDefined();
      expect(persona?.quote).toBeDefined();
      
      // Psychology object
      expect(persona?.psychology).toBeDefined();
      expect(persona?.psychology.stress).toBeDefined();
      expect(persona?.psychology.motivation).toBeDefined();
      expect(persona?.psychology.painPoints).toBeDefined();
      expect(Array.isArray(persona?.psychology.painPoints)).toBe(true);
      expect(persona?.psychology.painPoints.length).toBeGreaterThan(0);
      
      // Communication object
      expect(persona?.communication).toBeDefined();
      expect(persona?.communication.do).toBeDefined();
      expect(persona?.communication.dont).toBeDefined();
      expect(Array.isArray(persona?.communication.do)).toBe(true);
      expect(Array.isArray(persona?.communication.dont)).toBe(true);
      expect(persona?.communication.do.length).toBeGreaterThan(0);
      expect(persona?.communication.dont.length).toBeGreaterThan(0);
    });
  });

  describe('Persona Data Accuracy', () => {
    it.each(Object.entries(EXPECTED_PERSONAS))('persona "%s" should have correct data', (personaId, expected) => {
      const persona = getAmdocsPersonaById(personaId);
      expect(persona).toBeDefined();
      
      expect(persona?.name).toBe(expected.name);
      expect(persona?.title).toBe(expected.title);
      expect(persona?.role).toBe(expected.role);
      expect(persona?.location).toBe(expected.location);
      expect(persona?.age).toBe(expected.age);
      expect(persona?.generation).toBe(expected.generation);
      expect(persona?.tenure).toBe(expected.tenure);
    });
  });

  describe('Maya - The Busy Bee Manager', () => {
    const maya = getAmdocsPersonaById('maya');

    it('should have correct quote about vacation', () => {
      expect(maya?.quote).toContain('Vacation without limits');
    });

    it('should have stress about being caught in the middle', () => {
      expect(maya?.psychology.stress).toContain('Caught in the middle');
    });

    it('should have communication do items about pre-brief kits', () => {
      expect(maya?.communication.do.some(item => item.includes('pre-brief'))).toBe(true);
    });

    it('should have communication dont items about vague updates', () => {
      expect(maya?.communication.dont.some(item => item.includes('vague'))).toBe(true);
    });
  });

  describe('Priya - The Digital Native', () => {
    const priya = getAmdocsPersonaById('priya');

    it('should have correct quote about CEO Town Hall', () => {
      expect(priya?.quote).toContain('CEO Town Hall');
    });

    it('should have stress about content fatigue', () => {
      expect(priya?.psychology.stress).toContain('Content fatigue');
    });

    it('should have communication do items about modern formats', () => {
      expect(priya?.communication.do.some(item => item.includes('modern'))).toBe(true);
    });

    it('should have communication dont items about long paragraphs', () => {
      expect(priya?.communication.dont.some(item => item.includes('long paragraphs'))).toBe(true);
    });
  });

  describe('Anna - The Acquired Talent', () => {
    const anna = getAmdocsPersonaById('anna');

    it('should have correct quote about feeling left out', () => {
      expect(anna?.quote).toContain("don't feel a part of Amdocs");
    });

    it('should have stress about job security', () => {
      expect(anna?.psychology.stress).toContain('job security');
    });

    it('should have communication do items about social connection', () => {
      expect(anna?.communication.do.some(item => item.includes('social connection'))).toBe(true);
    });

    it('should have communication dont items about broken links', () => {
      expect(anna?.communication.dont.some(item => item.includes('broken links'))).toBe(true);
    });
  });

  describe('Sahil - The Social Connector', () => {
    const sahil = getAmdocsPersonaById('sahil');

    it('should have correct quote about town halls', () => {
      expect(sahil?.quote).toContain('town halls');
    });

    it('should have stress about feeling left out', () => {
      expect(sahil?.psychology.stress).toContain('left out');
    });

    it('should have communication do items about social initiatives', () => {
      expect(sahil?.communication.do.some(item => item.includes('social initiatives'))).toBe(true);
    });

    it('should have communication dont items about digital channels', () => {
      expect(sahil?.communication.dont.some(item => item.includes('digital channels'))).toBe(true);
    });
  });

  describe('Ido - The Skeptical Veteran', () => {
    const ido = getAmdocsPersonaById('ido');

    it('should have correct quote about ESPP', () => {
      expect(ido?.quote).toContain('ESPP');
    });

    it('should have stress about feeling detached', () => {
      expect(ido?.psychology.stress).toContain('detached');
    });

    it('should have communication do items about sincere messages', () => {
      expect(ido?.communication.do.some(item => item.includes('sincere'))).toBe(true);
    });

    it('should have communication dont items about corporate jargon', () => {
      expect(ido?.communication.dont.some(item => item.includes('corporate jargon'))).toBe(true);
    });
  });

  describe('Ben - The Career Climber', () => {
    const ben = getAmdocsPersonaById('ben');

    it('should have correct quote about CEO letters', () => {
      expect(ben?.quote).toContain('CEO letters');
    });

    it('should have stress about balancing visibility', () => {
      expect(ben?.psychology.stress).toContain('visibility');
    });

    it('should have communication do items about leadership content', () => {
      expect(ben?.communication.do.some(item => item.includes('leadership'))).toBe(true);
    });

    it('should have communication dont items about social content', () => {
      expect(ben?.communication.dont.some(item => item.includes('social content'))).toBe(true);
    });
  });

  describe('Alex - The Business Executive', () => {
    const alex = getAmdocsPersonaById('alex');

    it('should have correct quote about Monday emails', () => {
      expect(alex?.quote).toContain('Monday morning');
    });

    it('should have stress about meetings and emails', () => {
      expect(alex?.psychology.stress).toContain('meetings');
    });

    it('should have communication do items about concise emails', () => {
      expect(alex?.communication.do.some(item => item.includes('concise'))).toBe(true);
    });

    it('should have communication dont items about long emails', () => {
      expect(alex?.communication.dont.some(item => item.includes('long emails'))).toBe(true);
    });
  });

  describe('Oliver - The Site Leader', () => {
    const oliver = getAmdocsPersonaById('oliver');

    it('should have correct quote about mobile-friendly', () => {
      expect(oliver?.quote).toContain('mobile-friendly');
    });

    it('should have stress about recognition', () => {
      expect(oliver?.psychology.stress).toContain('under-recognized');
    });

    it('should have communication do items about mobile-friendly', () => {
      expect(oliver?.communication.do.some(item => item.includes('mobile-friendly'))).toBe(true);
    });

    it('should have communication dont items about broken links', () => {
      expect(oliver?.communication.dont.some(item => item.includes('broken'))).toBe(true);
    });
  });
});

describe('Amdocs Persona Helper Functions', () => {
  describe('getAmdocsPersonaById', () => {
    it('should return the correct persona for valid ID', () => {
      const maya = getAmdocsPersonaById('maya');
      expect(maya?.name).toBe('Maya');
    });

    it('should return undefined for invalid ID', () => {
      const invalid = getAmdocsPersonaById('nonexistent');
      expect(invalid).toBeUndefined();
    });

    it.each(EXPECTED_PERSONA_IDS)('should return persona for ID "%s"', (id) => {
      const persona = getAmdocsPersonaById(id);
      expect(persona).toBeDefined();
      expect(persona?.id).toBe(id);
    });
  });

  describe('getPersonaImage', () => {
    it.each(EXPECTED_PERSONA_IDS)('should return local image path for Amdocs persona "%s"', (id) => {
      const persona = getAmdocsPersonaById(id);
      if (persona) {
        const imagePath = getPersonaImage(persona);
        expect(imagePath).toContain('/images/personas/');
        expect(imagePath).toContain('.png');
      }
    });
  });

  describe('getPersonaImagePosition', () => {
    it.each(EXPECTED_PERSONA_IDS)('should return position for Amdocs persona "%s"', (id) => {
      const persona = getAmdocsPersonaById(id);
      if (persona) {
        const position = getPersonaImagePosition(persona);
        expect(position).toBeDefined();
        expect(typeof position).toBe('string');
      }
    });
  });
});

describe('Amdocs Persona Scenarios', () => {
  describe('Scenario Count', () => {
    it.each(EXPECTED_PERSONA_IDS)('persona "%s" should have at least 2 scenarios', (personaId) => {
      const scenarios = getScenariosForPersona(personaId);
      expect(scenarios.length).toBeGreaterThanOrEqual(2);
    });

    it('should have exactly 16 Amdocs scenarios total (2 per persona)', () => {
      let totalScenarios = 0;
      EXPECTED_PERSONA_IDS.forEach(id => {
        totalScenarios += getScenariosForPersona(id).length;
      });
      expect(totalScenarios).toBe(16);
    });
  });

  describe('Scenario Structure', () => {
    it.each(EXPECTED_PERSONA_IDS)('scenarios for "%s" should have all required fields', (personaId) => {
      const scenarios = getScenariosForPersona(personaId);
      
      scenarios.forEach(scenario => {
        expect(scenario.id).toBeDefined();
        expect(scenario.title).toBeDefined();
        expect(scenario.description).toBeDefined();
        expect(scenario.difficulty).toBeDefined();
        expect(['Easy', 'Medium', 'Hard']).toContain(scenario.difficulty);
        expect(scenario.personaId).toBe(personaId);
        expect(scenario.userRole).toBeDefined();
        expect(scenario.context).toBeDefined();
        expect(scenario.userGoal).toBeDefined();
        expect(scenario.evaluationCriteria).toBeDefined();
        expect(Array.isArray(scenario.evaluationCriteria)).toBe(true);
        expect(scenario.evaluationCriteria.length).toBeGreaterThan(0);
        expect(scenario.estimatedMinutes).toBeDefined();
        expect(scenario.estimatedMinutes).toBeGreaterThan(0);
      });
    });
  });

  describe('Maya Scenarios', () => {
    it('should have scenario about cascading announcements', () => {
      const scenario = getScenarioById('maya-cascade-announcement');
      expect(scenario).toBeDefined();
      expect(scenario?.personaId).toBe('maya');
      expect(scenario?.userRole).toBe('Internal Communications Manager');
    });

    it('should have scenario about team anxiety', () => {
      const scenario = getScenarioById('maya-team-anxiety');
      expect(scenario).toBeDefined();
      expect(scenario?.personaId).toBe('maya');
      expect(scenario?.difficulty).toBe('Hard');
    });
  });

  describe('Priya Scenarios', () => {
    it('should have scenario about onboarding', () => {
      const scenario = getScenarioById('priya-onboarding-feedback');
      expect(scenario).toBeDefined();
      expect(scenario?.personaId).toBe('priya');
    });

    it('should have scenario about career development', () => {
      const scenario = getScenarioById('priya-career-path');
      expect(scenario).toBeDefined();
      expect(scenario?.personaId).toBe('priya');
    });
  });

  describe('Anna Scenarios', () => {
    it('should have scenario about integration challenges', () => {
      const scenario = getScenarioById('anna-integration-challenges');
      expect(scenario).toBeDefined();
      expect(scenario?.context).toContain('acquisition');
    });

    it('should have scenario about system access', () => {
      const scenario = getScenarioById('anna-access-request');
      expect(scenario).toBeDefined();
      expect(scenario?.userRole).toBe('IT Support Manager');
    });
  });

  describe('Sahil Scenarios', () => {
    it('should have scenario about event proposal', () => {
      const scenario = getScenarioById('sahil-event-proposal');
      expect(scenario).toBeDefined();
      expect(scenario?.context).toContain('Dallas');
    });

    it('should have scenario about site fairness', () => {
      const scenario = getScenarioById('sahil-site-fairness');
      expect(scenario).toBeDefined();
      expect(scenario?.context).toContain("Ra'anana");
    });
  });

  describe('Ido Scenarios', () => {
    it('should have scenario about survey skepticism', () => {
      const scenario = getScenarioById('ido-survey-skepticism');
      expect(scenario).toBeDefined();
      expect(scenario?.difficulty).toBe('Hard');
    });

    it('should have scenario about new tool resistance', () => {
      const scenario = getScenarioById('ido-new-tool-adoption');
      expect(scenario).toBeDefined();
      expect(scenario?.userRole).toBe('IT Change Manager');
    });
  });

  describe('Ben Scenarios', () => {
    it('should have scenario about visibility', () => {
      const scenario = getScenarioById('ben-visibility-request');
      expect(scenario).toBeDefined();
      expect(scenario?.context).toContain('visibility');
    });

    it('should have scenario about networking', () => {
      const scenario = getScenarioById('ben-networking-ask');
      expect(scenario).toBeDefined();
      expect(scenario?.userRole).toBe('VP of Product');
    });
  });

  describe('Alex Scenarios', () => {
    it('should have scenario about email overload', () => {
      const scenario = getScenarioById('alex-email-overload');
      expect(scenario).toBeDefined();
      expect(scenario?.context).toContain('emails');
    });

    it('should have scenario about sales update', () => {
      const scenario = getScenarioById('alex-sales-update');
      expect(scenario).toBeDefined();
      expect(scenario?.userRole).toBe('Sales Enablement Lead');
    });
  });

  describe('Oliver Scenarios', () => {
    it('should have scenario about mobile frustration', () => {
      const scenario = getScenarioById('oliver-mobile-frustration');
      expect(scenario).toBeDefined();
      expect(scenario?.context).toContain('mobile');
    });

    it('should have scenario about recognition', () => {
      const scenario = getScenarioById('oliver-recognition-gap');
      expect(scenario).toBeDefined();
      expect(scenario?.context).toContain('recognition');
    });
  });
});

describe('Generation Distribution', () => {
  it('should have correct generation distribution', () => {
    const generations = amdocsPersonas.map(p => p.generation);
    
    // Count each generation
    const genCount = generations.reduce((acc, gen) => {
      acc[gen] = (acc[gen] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Expected: 1 Boomer, 1 Gen Z, 3 Gen X, 3 Gen Y
    expect(genCount['Boomer']).toBe(1); // Ido
    expect(genCount['Gen Z']).toBe(1);  // Priya
    expect(genCount['Gen X']).toBe(3);  // Maya, Alex, Oliver
    expect(genCount['Gen Y']).toBe(3);  // Anna, Sahil, Ben
  });
});

describe('Location Distribution', () => {
  it('should have personas from different global locations', () => {
    const locations = amdocsPersonas.map(p => p.location);
    
    // Should have Israel personas
    expect(locations.some(l => l.includes('Israel'))).toBe(true);
    
    // Should have US personas
    expect(locations.some(l => l.includes('TX') || l.includes('USA') || l.includes('New Jersey'))).toBe(true);
    
    // Should have European personas
    expect(locations.some(l => l.includes('Ireland') || l.includes('UK'))).toBe(true);
    
    // Should have Asian personas
    expect(locations.some(l => l.includes('India'))).toBe(true);
  });
});

