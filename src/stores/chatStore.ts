import { create } from 'zustand';
import type { ChatMessage, Conversation, VoiceState } from '../types';

interface ChatState {
  // Current conversation
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  voiceState: VoiceState;
  isTyping: boolean; // LLM is generating response

  // Actions
  addMessage: (message: ChatMessage) => void;
  setVoiceState: (state: VoiceState) => void;
  setIsTyping: (typing: boolean) => void;
  startNewConversation: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentConversation: null,
  messages: [],
  voiceState: 'idle',
  isTyping: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setVoiceState: (voiceState) => set({ voiceState }),
  setIsTyping: (isTyping) => set({ isTyping }),

  startNewConversation: () =>
    set({
      currentConversation: {
        id: generateId(),
        userId: '',
        startedAt: new Date(),
        messages: [],
      },
      messages: [],
    }),

  clearMessages: () => set({ messages: [], currentConversation: null }),
}));

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
