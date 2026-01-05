/**
 * AI Service Abstraction Layer
 * 
 * This module provides a clean interface for AI-powered persona matching.
 * Currently uses mock responses (Phase 1), but can be swapped to real
 * implementations (Ollama, OpenAI, etc.) without changing UI code.
 * 
 * To switch to real AI:
 * 1. Implement the AIService interface in ai-ollama.ts or ai-openai.ts
 * 2. Change the export below to use the real implementation
 */

import { Message } from '@/components/ChatMessage';
import { Persona } from './personas';
import { mockAIService } from './ai-mock';

export interface GuidedResponse {
  message: string;
  options?: string[];
  matchedPersona?: Persona;
  confidence?: number;
}

export interface FreeformResponse {
  message: string;
  matchedPersona?: Persona;
  confidence?: number;
  needsMoreInfo?: boolean;
}

export interface AIService {
  /**
   * Start the guided discovery flow
   * Returns the first question with options
   */
  startGuidedDiscovery(): Promise<GuidedResponse>;

  /**
   * Continue the guided discovery with user's answer
   * Returns next question or final match
   */
  continueGuidedDiscovery(
    messages: Message[],
    answer: string
  ): Promise<GuidedResponse>;

  /**
   * Analyze free-form text for persona matching
   * May ask follow-up questions if not enough info
   */
  analyzeFreeform(
    messages: Message[],
    text: string
  ): Promise<FreeformResponse>;
}

// =============================================================================
// PHASE 1: Mock Implementation (Current)
// =============================================================================
export const aiService: AIService = mockAIService;

// =============================================================================
// PHASE 2: Real Implementations (Uncomment to switch)
// =============================================================================
// import { ollamaService } from './ai-ollama';
// export const aiService: AIService = ollamaService;

// import { openAIService } from './ai-openai';
// export const aiService: AIService = openAIService;

