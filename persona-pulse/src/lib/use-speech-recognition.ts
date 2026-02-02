'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onsoundstart: () => void;
  onsoundend: () => void;
  onspeechend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface UseSpeechRecognitionOptions {
  /** Silence timeout in milliseconds before auto-stop (default: 2000) */
  silenceTimeout?: number;
  /** Language for speech recognition (default: 'en-US') */
  language?: string;
  /** Callback when final transcript is ready */
  onTranscript?: (transcript: string) => void;
  /** Auto-send when speech ends (calls onTranscript automatically) */
  autoSend?: boolean;
}

export interface UseSpeechRecognitionReturn {
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Whether currently listening for speech */
  isListening: boolean;
  /** Current transcript (updates in real-time) */
  transcript: string;
  /** Error message if any */
  error: string | null;
  /** Start listening for speech */
  startListening: () => void;
  /** Stop listening and finalize transcript */
  stopListening: () => void;
  /** Clear the current transcript */
  clearTranscript: () => void;
}

/**
 * Custom hook for speech recognition with auto-stop on silence
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    silenceTimeout = 2000,
    language = 'en-US',
    onTranscript,
    autoSend = false,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef(false);
  const transcriptRef = useRef('');
  const onTranscriptRef = useRef(onTranscript);
  const autoSendRef = useRef(autoSend);

  // Keep refs in sync
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    autoSendRef.current = autoSend;
  }, [onTranscript, autoSend]);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Start silence timer - stops recognition after timeout
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Already stopped
          setIsListening(false);
        }
      }
    }, silenceTimeout);
  }, [clearSilenceTimer, silenceTimeout]);

  // Stop listening
  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort(); // Use abort for immediate stop
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  // Start listening
  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Reset state
    setError(null);
    setTranscript('');
    hasSpokenRef.current = false;
    transcriptRef.current = '';

    // Create new recognition instance
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      hasSpokenRef.current = true;
      
      // Build transcript from all results
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      transcriptRef.current = fullTranscript;
      
      // Reset silence timer on speech
      startSilenceTimer();
    };

    // Handle sound start - reset silence timer
    recognition.onsoundstart = () => {
      clearSilenceTimer();
    };

    // Handle sound end - start silence timer
    recognition.onsoundend = () => {
      startSilenceTimer();
    };

    // Handle speech end
    recognition.onspeechend = () => {
      startSilenceTimer();
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSilenceTimer();
      
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access.');
          break;
        case 'no-speech':
          // Not an error, just no speech detected
          if (!hasSpokenRef.current) {
            setError('No speech detected. Please try again.');
          }
          break;
        case 'network':
          setError('Network error. Please check your connection.');
          break;
        case 'aborted':
          // User aborted, not an error
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
      
      setIsListening(false);
    };

    // Handle end
    recognition.onend = () => {
      clearSilenceTimer();
      recognitionRef.current = null; // Clear the reference
      setIsListening(false);
      
      // Call callback with final transcript (for auto-send)
      // Use setTimeout to ensure state update propagates first
      const finalText = transcriptRef.current.trim();
      if (autoSendRef.current && onTranscriptRef.current && finalText) {
        setTimeout(() => {
          if (onTranscriptRef.current) {
            onTranscriptRef.current(finalText);
          }
        }, 10);
      }
    };

    // Start listening
    try {
      recognition.start();
      setIsListening(true);
      // Start initial silence timer (in case user doesn't speak at all)
      startSilenceTimer();
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [language, clearSilenceTimer, startSilenceTimer, onTranscript, transcript]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Already stopped
        }
      }
    };
  }, [clearSilenceTimer]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
}

