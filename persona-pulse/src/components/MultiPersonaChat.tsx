'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Persona, generationColors, Generation, getPersonaImage } from '@/lib/personas';
import { amdocsPersonas } from '@/lib/amdocs-personas';
import { Send, Loader2, Users, X, Check, Sparkles, Wifi, WifiOff, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '@/lib/use-speech-recognition';

interface MultiPersonaChatProps {
  open: boolean;
  onClose: () => void;
  initialPersonas?: Persona[];
}

interface PersonaResponse {
  persona: Persona;
  content: string;
  isLoading: boolean;
  error?: string;
  provider?: string;
}

interface Conversation {
  id: string;
  question: string;
  responses: PersonaResponse[];
  isComplete: boolean;
}

const generations: Generation[] = ['Gen Z', 'Gen Y', 'Gen X', 'Boomer'];
const MAX_HISTORY = 3; // Keep last 3 conversations

export function MultiPersonaChat({ open, onClose, initialPersonas }: MultiPersonaChatProps) {
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set());
  
  // Initialize with passed personas when dialog opens
  useEffect(() => {
    if (open && initialPersonas && initialPersonas.length > 0) {
      setSelectedPersonas(new Set(initialPersonas.map(p => p.id)));
    }
  }, [open, initialPersonas]);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [aiProvider, setAiProvider] = useState<string>('checking');
  const [providerName, setProviderName] = useState('Checking AI...');
  const responsesEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition hook with auto-send
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition({
    silenceTimeout: 2000, // 2 seconds of silence before auto-stop and send
    autoSend: true,
    onTranscript: (text) => {
      if (text.trim()) {
        // Directly send the message (bypass state delay)
        askPersonasDirect(text.trim());
      }
    },
  });

  // Update input when transcript changes (live preview)
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Handle mic button click
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  };

  // Check AI provider status on mount
  useEffect(() => {
    const checkAI = async () => {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          setAiProvider(data.provider);
          setProviderName(data.name);
        } else {
          setAiProvider('mock');
          setProviderName('Mock (Offline)');
        }
      } catch {
        setAiProvider('mock');
        setProviderName('Mock (Offline)');
      }
    };
    if (open) checkAI();
  }, [open]);

  // All available personas
  const allPersonas = amdocsPersonas;

  // Scroll to bottom when new responses come in
  useEffect(() => {
    responsesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  // Toggle persona selection
  const togglePersona = (personaId: string) => {
    const newSelected = new Set(selectedPersonas);
    if (newSelected.has(personaId)) {
      newSelected.delete(personaId);
    } else {
      newSelected.add(personaId);
    }
    setSelectedPersonas(newSelected);
  };

  // Select all personas of a generation
  const selectGeneration = (gen: Generation) => {
    const genPersonas = allPersonas.filter(p => p.generation === gen);
    const allSelected = genPersonas.every(p => selectedPersonas.has(p.id));
    
    const newSelected = new Set(selectedPersonas);
    genPersonas.forEach(p => {
      if (allSelected) {
        newSelected.delete(p.id);
      } else {
        newSelected.add(p.id);
      }
    });
    setSelectedPersonas(newSelected);
  };

  // Check if all personas of a generation are selected
  const isGenerationSelected = (gen: Generation) => {
    const genPersonas = allPersonas.filter(p => p.generation === gen);
    return genPersonas.length > 0 && genPersonas.every(p => selectedPersonas.has(p.id));
  };

  // Select all personas
  const selectAll = () => {
    if (selectedPersonas.size === allPersonas.length) {
      setSelectedPersonas(new Set());
    } else {
      setSelectedPersonas(new Set(allPersonas.map(p => p.id)));
    }
  };

  // Ask the question to all selected personas
  // Direct ask for voice input (bypasses state)
  const askPersonasDirect = async (text: string) => {
    if (!text.trim() || selectedPersonas.size === 0 || isAsking) return;
    setInput('');
    await askPersonasCore(text.trim());
  };

  const askPersonas = async () => {
    if (!input.trim() || selectedPersonas.size === 0 || isAsking) return;
    const text = input.trim();
    setInput('');
    await askPersonasCore(text);
  };

  const askPersonasCore = async (question: string) => {
    const conversationId = Date.now().toString();
    setIsAsking(true);

    // Get selected personas in order
    const personas = allPersonas.filter(p => selectedPersonas.has(p.id));
    
    // Create new conversation with loading state
    const newConversation: Conversation = {
      id: conversationId,
      question,
      responses: personas.map(persona => ({
        persona,
        content: '',
        isLoading: true,
      })),
      isComplete: false,
    };

    // Add to conversations (keep last MAX_HISTORY)
    setConversations(prev => [...prev.slice(-(MAX_HISTORY - 1)), newConversation]);

    // Ask all personas in PARALLEL for speed - responses appear as they come in
    const askPersona = async (persona: Persona, index: number) => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: question,
            personaId: persona.id,
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setConversations(prev => prev.map(conv => 
            conv.id === conversationId
              ? {
                  ...conv,
                  responses: conv.responses.map((r, idx) => 
                    idx === index ? { ...r, content: data.response, isLoading: false, provider: data.provider } : r
                  )
                }
              : conv
          ));
        } else {
          setConversations(prev => prev.map(conv => 
            conv.id === conversationId
              ? {
                  ...conv,
                  responses: conv.responses.map((r, idx) => 
                    idx === index ? { ...r, content: '', isLoading: false, error: 'Failed to get response' } : r
                  )
                }
              : conv
          ));
        }
      } catch {
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId
            ? {
                ...conv,
                responses: conv.responses.map((r, idx) => 
                  idx === index ? { ...r, content: '', isLoading: false, error: 'Connection error' } : r
                )
              }
            : conv
        ));
      }
    };

    // Fire all requests at once - responses will appear as they complete
    await Promise.all(personas.map((persona, i) => askPersona(persona, i)));

    // Mark conversation as complete
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, isComplete: true } : conv
    ));

    setIsAsking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askPersonas();
    }
  };

  const clearHistory = () => {
    setConversations([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-none !w-screen !h-screen !max-h-screen !m-0 !p-0 !rounded-none !border-0 flex flex-col gap-0 fixed inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Multi-Persona Chat
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs">
              {aiProvider === 'checking' ? (
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              ) : aiProvider === 'groq' ? (
                <Sparkles className="h-3 w-3 text-blue-500" />
              ) : aiProvider === 'gemini' ? (
                <Sparkles className="h-3 w-3 text-purple-500" />
              ) : aiProvider === 'ollama' ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-amber-500" />
              )}
              <span className={
                aiProvider === 'groq' ? 'text-blue-600' :
                aiProvider === 'gemini' ? 'text-purple-600' :
                aiProvider === 'ollama' ? 'text-green-600' :
                'text-amber-600'
              }>
                {providerName}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Persona Selector Sidebar */}
          <div className="w-72 border-r bg-gray-50 dark:bg-gray-900/50 p-4 overflow-y-auto shrink-0">
            <div className="space-y-4">
              {/* Generation Filters */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Quick Select
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={selectAll}
                    className={`text-xs px-2 py-1 rounded-full border transition-all ${
                      selectedPersonas.size === allPersonas.length
                        ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    All ({allPersonas.length})
                  </button>
                  {generations.map(gen => {
                    const count = allPersonas.filter(p => p.generation === gen).length;
                    const colors = generationColors[gen];
                    const selected = isGenerationSelected(gen);
                    return (
                      <button
                        key={gen}
                        onClick={() => selectGeneration(gen)}
                        className={`text-xs px-2 py-1 rounded-full border transition-all ${
                          selected
                            ? `${colors.bg} ${colors.border} ${colors.text}`
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {gen} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Individual Personas */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Select Personas ({selectedPersonas.size} selected)
                </p>
                <div className="space-y-1">
                  {allPersonas.map(persona => {
                    const selected = selectedPersonas.has(persona.id);
                    const colors = generationColors[persona.generation];
                    return (
                      <button
                        key={persona.id}
                        onClick={() => togglePersona(persona.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                          selected
                            ? `${colors.bg} ${colors.border} border`
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getPersonaImage(persona)}
                              alt={persona.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {selected && (
                            <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${colors.badge} flex items-center justify-center`}>
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{persona.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {persona.generation} · {persona.role.split(',')[0]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Responses */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {conversations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ask Multiple Personas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    Select personas from the sidebar, then ask a question to hear from each of them.
                    <br />
                    <span className="text-xs mt-1 block">Last {MAX_HISTORY} conversations are saved.</span>
                  </p>
                </div>
              ) : (
                <>
                  {conversations.map((conversation, convIdx) => (
                    <div key={conversation.id} className="space-y-4">
                      {/* Separator for older conversations */}
                      {convIdx > 0 && (
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                          <span className="text-xs text-gray-400">Earlier</span>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>
                      )}

                      {/* Question */}
                      <div className="flex justify-end">
                        <div className="max-w-[70%] bg-gradient-to-br from-purple-500 to-teal-500 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                          <p className="text-sm">{conversation.question}</p>
                        </div>
                      </div>

                      {/* Responses */}
                      {conversation.responses.map((response, idx) => {
                        const colors = generationColors[response.persona.generation];
                        return (
                          <div key={`${conversation.id}-${response.persona.id}`} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getPersonaImage(response.persona)}
                                alt={response.persona.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold">{response.persona.name}</span>
                                <Badge className={`${colors.bg} ${colors.text} text-[10px] px-1.5 py-0`}>
                                  {response.persona.generation}
                                </Badge>
                                {response.provider && !response.isLoading && (
                                  <span className="text-[10px] text-gray-400">
                                    via {response.provider}
                                  </span>
                                )}
                              </div>
                              <div className={`rounded-2xl rounded-tl-md px-4 py-3 ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {response.isLoading ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Thinking...</span>
                                  </div>
                                ) : response.error ? (
                                  <p className="text-sm text-red-500">{response.error}</p>
                                ) : (
                                  <p className="text-sm">{response.content}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={responsesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t bg-gray-50 dark:bg-gray-900/50 p-4">
              {conversations.length > 0 && !isAsking && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear history
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <Textarea
                  placeholder={
                    isListening 
                      ? 'Listening...'
                      : selectedPersonas.size === 0
                        ? 'Select personas first...'
                        : `Ask ${selectedPersonas.size} persona${selectedPersonas.size > 1 ? 's' : ''}...`
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={selectedPersonas.size === 0 || isAsking || isListening}
                  className={`min-h-[48px] max-h-[120px] resize-none text-sm ${isListening ? 'border-red-400 dark:border-red-500' : ''}`}
                  rows={1}
                />
                
                {/* Mic Button */}
                {isSpeechSupported && (
                  <Button
                    onClick={handleMicClick}
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    className={`h-[48px] w-[48px] rounded-lg transition-all ${
                      isListening 
                        ? 'mic-pulse bg-red-500 hover:bg-red-600 border-red-500' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                    disabled={selectedPersonas.size === 0 || isAsking}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                )}
                
                <Button
                  onClick={askPersonas}
                  disabled={!input.trim() || selectedPersonas.size === 0 || isAsking || isListening}
                  className="h-[48px] w-[48px] bg-gradient-to-r from-purple-500 to-teal-500"
                >
                  {isAsking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {/* Speech Error Message */}
              {speechError && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-500 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>{speechError}</span>
                </div>
              )}
              {selectedPersonas.size > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {conversations.length > 0 
                    ? `History: ${conversations.length}/${MAX_HISTORY} conversations saved`
                    : 'Responses will appear from each selected persona'}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

