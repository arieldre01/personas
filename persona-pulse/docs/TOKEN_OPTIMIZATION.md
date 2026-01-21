# AI Token Efficiency Optimization Guide

This document explains the optimizations made to reduce AI token usage in Persona Pulse, achieving **60-80% reduction** in token costs while maintaining response quality.

---

## Table of Contents

1. [Overview](#overview)
2. [System Prompt Compression](#system-prompt-compression)
3. [Sliding Window Conversation History](#sliding-window-conversation-history)
4. [Response Length Optimization](#response-length-optimization)
5. [Streaming & UX Improvements](#streaming--ux-improvements)
6. [Token Savings Summary](#token-savings-summary)

---

## Overview

### The Problem

Every AI API call costs tokens. Before optimization, a typical chat message would consume:

| Component | Tokens | Notes |
|-----------|--------|-------|
| System Prompt | ~800 | Sent with EVERY message |
| Full Conversation History | ~50-100 per message | Grows unbounded |
| Current Message | ~20-50 | User input |
| AI Response | ~150-250 | Output tokens |
| **Total (10th message)** | **~1,800+** | Expensive! |

### The Solution

After optimization:

| Component | Tokens | Savings |
|-----------|--------|---------|
| System Prompt | ~200 | **75% reduction** |
| Windowed History | ~150 (fixed) | **Capped growth** |
| Current Message | ~20-50 | Same |
| AI Response | ~80-128 | **50% reduction** |
| **Total (10th message)** | **~500** | **72% savings** |

---

## System Prompt Compression

### File: `src/lib/ai-provider.ts`

### Before (~800 tokens)

```
You ARE ${name}, a ${age}-year-old ${role} based in ${location}. You are ${generation}.

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
4. NEVER say "As ${title}..." or introduce yourself...
5. NEVER use quotation marks around your response.
6. Speak in YOUR voice based on your psychology...
7. If asked about stress, motivation, or preferences...
8. If asked something you don't know...
9. Stay in character...
10. Match your tone to ${generation}...

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
- Just answer the question and STOP...
```

### After (~200 tokens)

```
You are ${name}, ${age}y/o ${role} (${generation}). "${quote}"

PROFILE:
- Stress: ${psychology.stress}
- Drive: ${psychology.motivation}
- Issues: ${psychology.painPoints.join('; ')}
- Prefer: ${communication.do.join('; ')}
- Dislike: ${communication.dont.join('; ')}

RULES: Be ${name}. Answer in 1-2 sentences, be concise. ${tone} tone. Never introduce yourself or offer help.
```

### Why This Works

1. **Removed redundancy**: Rules 1-10 said the same things in different ways
2. **Condensed format**: Multi-line sections → single-line key-value pairs
3. **Merged instructions**: 8 "never say X" examples → one rule "Never offer help"
4. **Dropped verbose labels**: "YOUR PSYCHOLOGY:" → "PROFILE:"
5. **Truncated backstory**: Limited to 200 chars when included

### Key Insight

LLMs don't need verbose instructions. A concise prompt like "Answer in 1-2 sentences" works as well as a paragraph explaining the same thing.

---

## Sliding Window Conversation History

### File: `src/lib/conversation-manager.ts`

### The Problem

Traditional approach sends **entire conversation** with every message:

```
Message 1:  "Hi" + System Prompt
Message 5:  "Hi" + Msg1 + Msg2 + Msg3 + Msg4 + System Prompt
Message 20: "Hi" + Msg1...Msg19 + System Prompt  ← HUGE!
```

Token usage grows **linearly** with conversation length.

### The Solution: Sliding Window

Keep only the **last 4 messages** in full. Summarize older messages:

```
Message 20:
  [Earlier: Topics: stress, communication. 16 exchanges]  ← ~30 tokens
  + Msg17 + Msg18 + Msg19 + Msg20                         ← ~150 tokens
  + System Prompt                                          ← ~200 tokens
  = ~380 tokens (instead of ~2000+)
```

### Implementation

```typescript
export function buildConversationWindow(messages: ChatMessage[]): ConversationWindow {
  if (messages.length <= 4) {
    return { summary: null, recentMessages: messages };
  }
  
  const olderMessages = messages.slice(0, -4);
  const recentMessages = messages.slice(-4);
  const summary = summarizeMessages(olderMessages);
  
  return { summary, recentMessages };
}
```

### Client-Side Summarization

We summarize **without calling the AI** by extracting keywords:

```typescript
const TOPIC_KEYWORDS = [
  'stress', 'work', 'team', 'meeting', 'project',
  'communication', 'feedback', 'manager', 'motivation'
];

// Result: "Topics: stress, meetings. Asked: what motivates. 8 earlier exchanges"
```

### Why 4 Messages?

- **2 messages**: Too little context, AI forgets what was discussed
- **4 messages**: Sweet spot - maintains context, limits tokens
- **6+ messages**: Diminishing returns, AI rarely needs this much

---

## Response Length Optimization

### Configuration: `max_tokens: 128`

### Before

| Provider | Setting | Typical Output |
|----------|---------|----------------|
| Groq | max_tokens: 256 | ~150-200 tokens |
| Gemini | maxOutputTokens: 256 | ~150-200 tokens |
| Ollama | num_predict: 256 | ~150-200 tokens |

### After

| Provider | Setting | Typical Output |
|----------|---------|----------------|
| Groq | max_tokens: 128 | ~60-100 tokens |
| Gemini | maxOutputTokens: 128 | ~60-100 tokens |
| Ollama | num_predict: 128 | ~60-100 tokens |

### Why 128 Tokens?

- **128 tokens ≈ 100 words ≈ 2-3 sentences**
- Matches natural chat message length
- Forces AI to be concise and direct
- Prevents rambling responses
- Feels more conversational

### Prompt Reinforcement

Combined with system prompt change:

```diff
- RULES: Answer in 1-3 sentences...
+ RULES: Answer in 1-2 sentences, be concise...
```

---

## Streaming & UX Improvements

### Natural Typing Effect

Even with fast AI responses, we add a human-like typing delay:

```typescript
// Process tokens with natural typing delay
while (tokenQueue.length > 0) {
  const token = tokenQueue.shift()!;
  displayedContent += token;
  updateMessage(displayedContent);
  
  // 25-40ms delay per token (feels like fast typing)
  await new Promise(resolve => 
    setTimeout(resolve, 25 + Math.random() * 15)
  );
}
```

### Why This Matters

- **Without delay**: Response appears instantly → feels robotic
- **With delay**: Response types out → feels like real conversation
- **Variable delay**: Random 25-40ms → more natural than fixed timing

### Stream End Handling

Fixed bug where Groq would repeat text:

```typescript
if (data === '[DONE]') {
  streamEnded = true;  // Flag to stop processing
  sendDoneMessage();
  break;  // Exit loop immediately
}
```

---

## Token Savings Summary

### Per-Message Savings

| Conversation Length | Before | After | Savings |
|---------------------|--------|-------|---------|
| 1st message | ~850 tokens | ~350 tokens | **59%** |
| 5th message | ~1,100 tokens | ~400 tokens | **64%** |
| 10th message | ~1,500 tokens | ~450 tokens | **70%** |
| 20th message | ~2,200 tokens | ~500 tokens | **77%** |
| 50th message | ~4,500 tokens | ~550 tokens | **88%** |

### Monthly Cost Impact (Estimated)

Assuming 10,000 messages/month with average 10 messages per conversation:

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Input tokens | 15M | 4.5M | **70%** |
| Output tokens | 1.5M | 0.8M | **47%** |
| **Groq cost** | ~$1.50 | ~$0.50 | **$1/month** |
| **OpenAI cost** | ~$45 | ~$15 | **$30/month** |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/ai-provider.ts` | Compressed prompts, reduced max_tokens |
| `src/lib/conversation-manager.ts` | NEW - Sliding window + summarization |
| `src/app/api/chat/route.ts` | Uses windowed history |
| `src/components/PersonaChat.tsx` | Sends message arrays, typing effect |
| `src/components/ScenarioChat.tsx` | Same optimizations |

---

## Best Practices

1. **Measure first**: Log token usage before optimizing
2. **Compress prompts**: Remove redundancy, use terse language
3. **Cap history**: Use sliding window, not full history
4. **Limit output**: Set max_tokens based on desired response length
5. **Summarize client-side**: Don't waste AI tokens on summarization
6. **Test quality**: Ensure responses remain useful after optimization

---

## Future Optimizations

Potential further improvements:

1. **Skip greeting messages**: Don't include "Hi, I'm Sarah" in history
2. **Dynamic window size**: Adjust based on conversation complexity
3. **Semantic deduplication**: Remove repetitive exchanges from history
4. **Prompt caching**: Cache system prompts server-side (if supported)
5. **Response streaming abort**: Stop generation if user starts typing

---

*Last updated: January 2026*

