/**
 * Chat Storage Helper
 * Manages conversation persistence using localStorage
 */

interface StoredMessage {
  id: string;
  role: 'user' | 'persona';
  content: string;
}

const STORAGE_PREFIX = 'persona-chat-';

/**
 * Save chat messages for a persona
 */
export function saveChat(personaId: string, messages: StoredMessage[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${STORAGE_PREFIX}${personaId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat:', error);
  }
}

/**
 * Load chat messages for a persona
 */
export function loadChat(personaId: string): StoredMessage[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `${STORAGE_PREFIX}${personaId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load chat:', error);
  }
  
  return [];
}

/**
 * Clear chat history for a persona
 */
export function clearChat(personaId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${STORAGE_PREFIX}${personaId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear chat:', error);
  }
}

/**
 * Get all persona IDs that have saved chats
 */
export function getSavedChatPersonas(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .map(key => key.replace(STORAGE_PREFIX, ''));
  } catch (error) {
    console.error('Failed to get saved chats:', error);
    return [];
  }
}

/**
 * Clear all saved chats
 */
export function clearAllChats(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keys = Object.keys(localStorage);
    keys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear all chats:', error);
  }
}

