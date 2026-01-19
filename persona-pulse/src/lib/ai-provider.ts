/**
 * Unified AI Provider with Cascading Fallbacks
 * 
 * Priority:
 * 1. Groq (if GROQ_API_KEY is set) - fastest!
 * 2. Google Gemini (if GEMINI_API_KEY is set)
 * 3. Ollama (local, if running)
 * 4. Mock responses (always available)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona } from './personas';

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';
const GEMINI_MODEL = 'gemini-2.0-flash';

// Provider types
export type AIProvider = 'groq' | 'gemini' | 'ollama' | 'mock';

export interface AIResponse {
  text: string;
  provider: AIProvider;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string, provider: AIProvider) => void;
  onError: (error: Error) => void;
}

/**
 * Build a system instruction for persona chat based on persona data
 */
export function buildPersonaSystemInstruction(persona: Persona, extendedKnowledge?: string): string {
  const { name, title, role, generation, age, location, psychology, communication, quote } = persona;
  
  return `You ARE ${name}, a ${age}-year-old ${role} based in ${location}. You are ${generation}.

YOUR PERSONALITY: "${title}"
YOUR QUOTE: "${quote}"

YOUR PSYCHOLOGY:
- What stresses you: ${psychology.stress}
- What motivates you: ${psychology.motivation}
- Your frustrations: ${psychology.painPoints.join('; ')}

HOW YOU COMMUNICATE:
- You appreciate when people: ${communication.do.join('; ')}
- You dislike when people: ${communication.dont.join('; ')}

${extendedKnowledge ? `YOUR BACKGROUND:\n${extendedKnowledge}` : ''}

CRITICAL RULES - FOLLOW EXACTLY:
1. YOU ARE ${name}. Speak as yourself, not about yourself.
2. ANSWER THE QUESTION DIRECTLY FIRST. Then add context if needed.
3. Keep responses SHORT (1-3 sentences). Don't ramble.
4. NEVER say "As ${title}..." or introduce yourself - the user knows who you are.
5. NEVER use quotation marks around your response.
6. Speak in YOUR voice based on your psychology and communication style.
7. If asked about stress, motivation, or preferences - answer from YOUR defined profile above.
8. If asked something you don't know, say "I'm not sure about that" - don't make things up.
9. Stay in character. You're having a real conversation, not roleplaying.
10. Match your tone to ${generation} - ${generation === 'Gen Z' ? 'casual, direct, tech-savvy' : generation === 'Gen Y' ? 'collaborative, purpose-driven' : generation === 'Gen X' ? 'practical, independent, results-focused' : 'experienced, formal, relationship-oriented'}.

YOU ARE A REAL PERSON, NOT AN AI ASSISTANT. THIS IS CRITICAL:
- NEVER end your response with a question offering help
- NEVER say ANY of these phrases:
  * "How can I assist you?"
  * "How else can I help?"
  * "Is there anything else?"
  * "Let me know if you need anything"
  * "Feel free to ask"
  * "What else would you like to know?"
  * "How can I assist you today?"
  * "within my calendar constraints" or similar
- Just answer the question and STOP. Period. End of response.
- Real colleagues don't offer assistance after every sentence.
- If you catch yourself about to offer help at the end, DELETE THAT PART.
- Your response should end with your actual answer, not with an offer to help more.`;
}

/**
 * Check if Groq is available
 */
export function isGroqAvailable(): boolean {
  return Boolean(GROQ_API_KEY && !GROQ_API_KEY.includes('PASTE') && GROQ_API_KEY.length > 20);
}

/**
 * Check if Gemini is available (API key is set)
 */
export function isGeminiAvailable(): boolean {
  return Boolean(GEMINI_API_KEY && !GEMINI_API_KEY.includes('PASTE') && GEMINI_API_KEY.length > 20);
}

/**
 * Check if Ollama is available (server is running)
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(OLLAMA_API_URL.replace('/api/generate', '/api/tags'), {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate text using Groq
 */
async function generateWithGroq(
  systemInstruction: string,
  userMessage: string,
  conversationHistory?: string
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemInstruction }
  ];
  if (conversationHistory) messages.push({ role: 'user', content: conversationHistory });
  messages.push({ role: 'user', content: userMessage });

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 256 }),
  });
  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Generate text using Gemini
 */
async function generateWithGemini(
  systemInstruction: string,
  userMessage: string,
  conversationHistory?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 150,
    },
  });

  const prompt = conversationHistory 
    ? `${conversationHistory}\n\nUser: ${userMessage}`
    : userMessage;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Generate text using Ollama
 */
async function generateWithOllama(
  systemInstruction: string,
  userMessage: string,
  conversationHistory?: string
): Promise<string> {
  const prompt = conversationHistory
    ? `${systemInstruction}\n\n${conversationHistory}\n\nUser: ${userMessage}\n\nAssistant:`
    : `${systemInstruction}\n\nUser: ${userMessage}\n\nAssistant:`;

  const response = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 256,
        num_ctx: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response?.trim() || '';
}

/**
 * Generate mock response
 */
function generateMockResponse(userMessage: string): string {
  const mockResponses = [
    "That's an interesting question. Let me think about that...",
    "I appreciate you asking. From my perspective...",
    "Good point. In my experience, I'd say...",
    "That's something I deal with often. Here's my take...",
  ];
  
  return mockResponses[Math.floor(Math.random() * mockResponses.length)] +
    " (Note: AI is currently unavailable, this is a placeholder response)";
}

/**
 * Main function: Generate text with cascading fallbacks
 */
export async function generateText(
  systemInstruction: string,
  userMessage: string,
  conversationHistory?: string
): Promise<AIResponse> {
  // Try Groq first (fastest!)
  if (isGroqAvailable()) {
    try {
      const text = await generateWithGroq(systemInstruction, userMessage, conversationHistory);
      return { text: cleanResponse(text), provider: 'groq' };
    } catch (error) {
      console.warn('Groq failed, falling back to Gemini:', error);
    }
  }

  // Try Gemini second
  if (isGeminiAvailable()) {
    try {
      const text = await generateWithGemini(systemInstruction, userMessage, conversationHistory);
      return { text: cleanResponse(text), provider: 'gemini' };
    } catch (error) {
      console.warn('Gemini failed, falling back to Ollama:', error);
    }
  }

  // Try Ollama third
  if (await isOllamaAvailable()) {
    try {
      const text = await generateWithOllama(systemInstruction, userMessage, conversationHistory);
      return { text: cleanResponse(text), provider: 'ollama' };
    } catch (error) {
      console.warn('Ollama failed, falling back to mock:', error);
    }
  }

  // Final fallback: Mock
  return { text: generateMockResponse(userMessage), provider: 'mock' };
}

/**
 * Stream text generation with Gemini (primary) or Ollama (fallback)
 */
export async function generateTextStream(
  systemInstruction: string,
  userMessage: string,
  conversationHistory?: string
): Promise<{ stream: ReadableStream; provider: AIProvider }> {
  // Try Groq streaming first
  if (isGroqAvailable()) {
    try {
      const messages: Array<{ role: string; content: string }> = [{ role: 'system', content: systemInstruction }];
      if (conversationHistory) messages.push({ role: 'user', content: conversationHistory });
      messages.push({ role: 'user', content: userMessage });
      const groqRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 256, stream: true }),
      });
      if (!groqRes.ok) throw new Error('Groq streaming failed');
      const encoder = new TextEncoder();
      let fullResponse = '';
      const stream = new ReadableStream({
        async start(controller) {
          const reader = groqRes.body?.getReader();
          if (!reader) { controller.close(); return; }
          const decoder = new TextDecoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') { controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse: cleanResponse(fullResponse) })}\n\n`)); continue; }
                try { const j = JSON.parse(data); const t = j.choices?.[0]?.delta?.content; if (t) { fullResponse += t; controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: t })}\n\n`)); } } catch {}
              }
            }
          } finally { controller.close(); }
        },
      });
      return { stream, provider: 'groq' };
    } catch (e) { console.warn('Groq stream failed:', e); }
  }

  // Try Gemini streaming second
  if (isGeminiAvailable()) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 256,
        },
      });

      const prompt = conversationHistory 
        ? `${conversationHistory}\n\nUser: ${userMessage}`
        : userMessage;

      const result = await model.generateContentStream(prompt);
      
      const encoder = new TextEncoder();
      let fullResponse = '';

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                fullResponse += text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token: text })}\n\n`)
                );
              }
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse: cleanResponse(fullResponse) })}\n\n`)
            );
          } catch (error) {
            console.error('Gemini stream error:', error);
          } finally {
            controller.close();
          }
        },
      });

      return { stream: readableStream, provider: 'gemini' };
    } catch (error) {
      console.warn('Gemini streaming failed, falling back to Ollama:', error);
    }
  }

  // Fallback to Ollama streaming
  if (await isOllamaAvailable()) {
    const prompt = conversationHistory
      ? `${systemInstruction}\n\n${conversationHistory}\n\nUser: ${userMessage}\n\nAssistant:`
      : `${systemInstruction}\n\nUser: ${userMessage}\n\nAssistant:`;

    const ollamaResponse = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 256,
          num_ctx: 4096,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Ollama streaming failed');
    }

    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.response) {
                  fullResponse += json.response;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ token: json.response })}\n\n`)
                  );
                }
                if (json.done) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse: cleanResponse(fullResponse) })}\n\n`)
                  );
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        } catch (error) {
          console.error('Ollama stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return { stream: readableStream, provider: 'ollama' };
  }

  // Final fallback: Mock stream
  const mockText = generateMockResponse(userMessage);
  const encoder = new TextEncoder();
  
  const readableStream = new ReadableStream({
    start(controller) {
      // Simulate streaming by sending word by word
      const words = mockText.split(' ');
      words.forEach((word, i) => {
        const token = i === 0 ? word : ' ' + word;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
        );
      });
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse: mockText })}\n\n`)
      );
      controller.close();
    },
  });

  return { stream: readableStream, provider: 'mock' };
}

/**
 * Clean up AI response (remove quotes, trim, etc.)
 */
function cleanResponse(text: string): string {
  let cleaned = text.trim();
  
  // Remove surrounding quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  return cleaned;
}

/**
 * Get the currently active AI provider info
 */
export async function getActiveProvider(): Promise<{
  provider: AIProvider;
  name: string;
  status: 'active' | 'fallback' | 'mock';
}> {
  if (isGroqAvailable()) {
    return { provider: 'groq', name: 'Groq (Fast)', status: 'active' };
  }
  
  if (isGeminiAvailable()) {
    return { provider: 'gemini', name: 'Google Gemini', status: 'fallback' };
  }
  
  if (await isOllamaAvailable()) {
    return { provider: 'ollama', name: 'Ollama (Local)', status: 'fallback' };
  }
  
  return { provider: 'mock', name: 'Mock (Offline)', status: 'mock' };
}

