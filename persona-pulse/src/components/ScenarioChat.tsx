'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Scenario, ScenarioFeedback, difficultyColors } from '@/lib/scenarios';
import { Persona, generationColors, getPersonaImage, getPersonaImagePosition } from '@/lib/personas';
import { ScenarioHint } from './ScenarioHint';
import { ScenarioFeedbackModal } from './ScenarioFeedback';
import { Send, Loader2, ArrowLeft, Target, Clock, Flag, Sparkles, Wifi, WifiOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'persona';
  content: string;
}

interface ScenarioChatProps {
  scenario: Scenario;
  persona: Persona;
  onBack: () => void;
}

type AIProvider = 'gemini' | 'ollama' | 'mock';

export function ScenarioChat({ scenario, persona, onBack }: ScenarioChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<AIProvider>('mock');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<ScenarioFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const colors = generationColors[persona.generation];
  const diffColors = difficultyColors[scenario.difficulty];

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const startScenario = async () => {
      setIsTyping(true);
      
      try {
        // Build a detailed opening prompt for the AI
        const openingPrompt = `The scenario "${scenario.title}" is starting now. 
The user is playing the role of: ${scenario.userRole}.
Begin the conversation with your opening line - speak first as if you're initiating this workplace interaction.
Stay fully in character as ${persona.name} and respond naturally to this scenario situation.`;

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: openingPrompt,
            personaId: persona.id,
            scenarioContext: scenario.context,
            stream: true,
          }),
        });

        if (response.ok && response.body) {
          const provider = response.headers.get('X-AI-Provider') as AIProvider;
          if (provider) setAiProvider(provider);

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let content = '';
          const messageId = Date.now().toString();

          setMessages([{ id: messageId, role: 'persona', content: '' }]);
          setIsTyping(false);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.token) {
                  content += data.token;
                  setMessages([{ id: messageId, role: 'persona', content }]);
                }
              } catch { /* skip */ }
            }
          }
        }
      } catch (error) {
        console.error('Failed to start scenario:', error);
        setMessages([{ id: '0', role: 'persona', content: `*${persona.name} is ready for the scenario.*` }]);
      }
      
      setIsTyping(false);
    };

    startScenario();
  }, [persona, scenario]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setCurrentHint(null);

    const personaMessageId = (Date.now() + 1).toString();

    try {
      const conversationHistory = [...messages, userMessage]
        .map((m) => `${m.role === 'user' ? 'User' : persona.name}: ${m.content}`)
        .join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${conversationHistory}\nUser: ${userMessage.content}`,
          personaId: persona.id,
          scenarioContext: scenario.context,
          stream: true,
        }),
      });

      if (response.ok && response.body) {
        const provider = response.headers.get('X-AI-Provider') as AIProvider;
        if (provider) setAiProvider(provider);

        setMessages((prev) => [...prev, { id: personaMessageId, role: 'persona', content: '' }]);
        setIsTyping(false);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.token) {
                content += data.token;
                setMessages((prev) => prev.map((msg) =>
                  msg.id === personaMessageId ? { ...msg, content } : msg
                ));
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { id: personaMessageId, role: 'persona', content: "I'm having trouble responding." }]);
      setIsTyping(false);
    }
  };

  const endScenario = async () => {
    setShowFeedback(true);
    setIsLoadingFeedback(true);

    try {
      const response = await fetch('/api/scenario-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          scenario: { title: scenario.title, userGoal: scenario.userGoal, evaluationCriteria: scenario.evaluationCriteria },
          personaId: persona.id,
        }),
      });

      if (response.ok) {
        setFeedback(await response.json());
      } else {
        setFeedback({ score: 3, summary: 'Great effort!', strengths: ['Engaged with the conversation'], improvements: ['Keep practicing'] });
      }
    } catch {
      setFeedback({ score: 3, summary: 'Thanks for completing the scenario!', strengths: ['Completed'], improvements: ['Try again for more feedback'] });
    }

    setIsLoadingFeedback(false);
  };

  const handleTryAgain = () => {
    setShowFeedback(false);
    setFeedback(null);
    setMessages([]);
    setCurrentHint(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusIcon = () => {
    switch (aiProvider) {
      case 'gemini': return <Sparkles className="h-3 w-3 text-blue-500" />;
      case 'ollama': return <Wifi className="h-3 w-3 text-green-500" />;
      default: return <WifiOff className="h-3 w-3 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-shrink-0 ${colors.bg} px-4 py-3 border-b`}>
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to scenarios
          </button>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={`${diffColors.badge} text-white text-[10px]`}>{scenario.difficulty}</Badge>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">{scenario.title}</h3>
        
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1"><Target className="h-3 w-3" /><span>You are: {scenario.userRole}</span></div>
          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>~{scenario.estimatedMinutes} min</span></div>
        </div>

        <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded text-xs">
          <span className="font-medium text-gray-700 dark:text-gray-300">Your goal: </span>
          <span className="text-gray-600 dark:text-gray-400">{scenario.userGoal}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-full overflow-hidden ${message.role === 'user' ? 'bg-blue-500' : ''}`}>
              {message.role === 'persona' ? (
                <img src={getPersonaImage(persona)} alt={persona.name} className="h-full w-full object-cover" style={{ objectPosition: getPersonaImagePosition(persona) }} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-sm font-bold">You</div>
              )}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md' : `${colors.bg} ${colors.text} rounded-bl-md border border-gray-100 dark:border-gray-700`}`}>
              {message.role === 'persona' && <p className="text-xs font-semibold opacity-80 mb-1">{persona.name}</p>}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img src={getPersonaImage(persona)} alt={persona.name} className="h-full w-full object-cover" style={{ objectPosition: getPersonaImagePosition(persona) }} />
            </div>
            <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${colors.bg}`}>
              <div className="flex items-center gap-1.5 h-5">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {currentHint && (
        <div className="flex-shrink-0 px-4">
          <ScenarioHint hint={currentHint} onDismiss={() => setCurrentHint(null)} />
        </div>
      )}

      <div className="flex-shrink-0 border-t bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
        <div className="flex gap-2 items-end">
          <Textarea placeholder={`Respond as ${scenario.userRole}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="min-h-[48px] max-h-[120px] resize-none text-sm py-2.5 px-3" rows={1} />
          <Button onClick={sendMessage} disabled={!input.trim() || isTyping} size="icon" className={`${colors.badge} h-[48px] w-[48px] rounded-lg`}>
            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
        
        {messages.length >= 3 && (
          <Button variant="outline" onClick={endScenario} className="w-full mt-3 gap-2 text-sm" disabled={isTyping}>
            <Flag className="h-4 w-4" />
            End Scenario & Get Feedback
          </Button>
        )}
      </div>

      <ScenarioFeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} onTryAgain={handleTryAgain} onPickNew={onBack} feedback={feedback} scenario={scenario} persona={persona} isLoading={isLoadingFeedback} />
    </div>
  );
}
