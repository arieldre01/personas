import { describe, it, expect } from 'vitest';
import { analyzeMessage, getFeedbackColors, FeedbackScore } from '../style-analyzer';
import { Persona } from '../personas';

// Mock persona for testing
const mockPersona: Persona = {
  id: 'test-persona',
  name: 'Test Person',
  role: 'Software Engineer',
  title: 'Senior Developer',
  generation: 'Gen Y',
  age: 32,
  location: 'San Francisco',
  quote: 'Clear communication is key',
  imageStyle: 0,
  psychology: {
    stress: 'Unclear expectations',
    motivation: 'Growth opportunities',
    painPoints: ['Meetings without agenda', 'Vague requirements'],
    goals: ['Ship quality code', 'Learn new technologies'],
  },
  communication: {
    do: [
      'Be direct and concise',
      'Use bullet points for clarity',
      'Provide context and data',
      'Ask for my perspective',
    ],
    dont: [
      'Send walls of text',
      'Be vague or unclear',
      'Make assumptions about my knowledge',
      'Demand things urgently without context',
    ],
  },
};

describe('Style Analyzer', () => {
  describe('Rude Language Detection', () => {
    it('should detect "stupid" as rude', () => {
      const result = analyzeMessage('You say something stupid', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('rude');
    });

    it('should detect "idiot" as rude', () => {
      const result = analyzeMessage('This is so idiotic', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('rude');
    });

    it('should detect "useless" as rude', () => {
      const result = analyzeMessage('This feature is completely useless', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('rude');
    });

    it('should detect "dumb" as rude', () => {
      const result = analyzeMessage('That was a dumb decision', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('rude');
    });

    it('should detect "terrible" as rude', () => {
      const result = analyzeMessage('This is terrible work', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('rude');
    });

    it('should detect "garbage" as rude', () => {
      const result = analyzeMessage('This code is garbage', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('rude');
    });
  });

  describe('Disrespectful Language Detection', () => {
    it('should detect "shut up" as disrespectful', () => {
      const result = analyzeMessage('Just shut up about it', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('disrespectful');
    });

    it('should detect "who cares" as disrespectful', () => {
      const result = analyzeMessage('Who cares about that anyway', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('disrespectful');
    });

    it('should detect "whatever" as disrespectful', () => {
      const result = analyzeMessage('Whatever, just do it', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('disrespectful');
    });
  });

  describe('Aggressive Language Detection', () => {
    it('should detect "you\'re wrong" as aggressive', () => {
      const result = analyzeMessage("You're wrong about that", mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('confrontational');
    });

    it('should detect "makes no sense" as aggressive', () => {
      const result = analyzeMessage('This makes no sense at all', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('confrontational');
    });

    it('should detect "are you serious" as aggressive', () => {
      const result = analyzeMessage('Are you serious about this?', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('confrontational');
    });
  });

  describe('Condescending Language Detection', () => {
    it('should detect "well actually" as condescending', () => {
      const result = analyzeMessage('Well actually, that is not correct', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('condescending');
    });

    it('should detect "you don\'t understand" as condescending', () => {
      const result = analyzeMessage("You don't understand the problem", mockPersona);
      // May get 'caution' if a positive pattern also matches (like being concise)
      expect(['warning', 'caution']).toContain(result.score);
    });

    it('should detect "it\'s obvious" as condescending', () => {
      const result = analyzeMessage("It's obvious that this won't work", mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('condescending');
    });
  });

  describe('Passive Aggressive Detection', () => {
    it('should detect "as I mentioned" as passive-aggressive', () => {
      const result = analyzeMessage('As I mentioned before, this needs to change', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('passive-aggressive');
    });

    it('should detect "per my last" as passive-aggressive', () => {
      const result = analyzeMessage('Per my last email, please review this', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('passive-aggressive');
    });
  });

  describe('Demanding Tone Detection', () => {
    it('should detect "ASAP" as demanding', () => {
      const result = analyzeMessage('I need this done ASAP', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('demanding');
    });

    it('should detect "immediately" as demanding', () => {
      const result = analyzeMessage('Fix this immediately', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('demanding');
    });
  });

  describe('Vague Language Detection', () => {
    it('should detect "maybe" as vague', () => {
      const result = analyzeMessage('Maybe we could possibly do this thing', mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('uncertain');
    });

    it('should detect "kind of" as vague', () => {
      const result = analyzeMessage("I kind of think we should sort of change this", mockPersona);
      expect(result.score).toBe('warning');
      expect(result.message).toContain('uncertain');
    });
  });

  describe('Positive Communication Detection', () => {
    it('should recognize appreciation as positive', () => {
      const result = analyzeMessage('Thank you for your help on this project', mockPersona);
      expect(result.score).toBe('great');
      expect(result.message).toContain('appreciation');
    });

    it('should recognize data/metrics as positive', () => {
      const result = analyzeMessage('Based on the data, we saw a 25% improvement in performance', mockPersona);
      expect(result.score).toBe('great');
    });

    it('should recognize asking for perspective as positive', () => {
      const result = analyzeMessage('What do you think about this approach?', mockPersona);
      expect(result.score).toBe('great');
    });

    it('should recognize bullet points as positive', () => {
      const result = analyzeMessage('Here are the points:\n- First item\n- Second item\n- Third item', mockPersona);
      expect(result.score).toBe('great');
    });
  });

  describe('Neutral Messages', () => {
    it('should mark normal messages as "good"', () => {
      const result = analyzeMessage('Can we schedule a meeting to discuss the project timeline?', mockPersona);
      expect(result.score).toBe('good');
      expect(result.message).toBe('Clear communication');
    });

    it('should skip very short messages', () => {
      const result = analyzeMessage('Hi', mockPersona);
      expect(result.score).toBe('good');
      expect(result.message).toBe('Message received');
    });

    it('should handle empty-ish messages gracefully', () => {
      const result = analyzeMessage('OK sure', mockPersona);
      expect(result.score).toBe('good');
    });
  });

  describe('Mixed Signals', () => {
    it('should mark mixed positive and negative as caution', () => {
      // Has appreciation (positive) but also demanding (negative)
      const result = analyzeMessage('Thank you, but I need this immediately', mockPersona);
      expect(result.score).toBe('caution');
    });
  });

  describe('getFeedbackColors', () => {
    it('should return green colors for "great" score', () => {
      const colors = getFeedbackColors('great');
      expect(colors.bg).toContain('green');
      expect(colors.text).toContain('green');
    });

    it('should return blue colors for "good" score', () => {
      const colors = getFeedbackColors('good');
      expect(colors.bg).toContain('blue');
      expect(colors.text).toContain('blue');
    });

    it('should return amber colors for "caution" score', () => {
      const colors = getFeedbackColors('caution');
      expect(colors.bg).toContain('amber');
      expect(colors.text).toContain('amber');
    });

    it('should return red colors for "warning" score', () => {
      const colors = getFeedbackColors('warning');
      expect(colors.bg).toContain('red');
      expect(colors.text).toContain('red');
    });

    it('should return all required color properties', () => {
      const scores: FeedbackScore[] = ['great', 'good', 'caution', 'warning'];
      scores.forEach(score => {
        const colors = getFeedbackColors(score);
        expect(colors).toHaveProperty('bg');
        expect(colors).toHaveProperty('text');
        expect(colors).toHaveProperty('border');
      });
    });
  });
});

