// ===== Chat Types =====
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  hasImage?: boolean;
  imageUri?: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  summary?: string;
  mood?: string;
  messages: ChatMessage[];
}

// ===== Model Types =====
export type DeviceTier = 'high' | 'low';

export interface DeviceCapability {
  tier: DeviceTier;
  totalMemoryGB: number;
  modelId: string; // e.g., 'e4b-q4' or 'e2b-q4'
  whisperModel: string; // e.g., 'small' or 'tiny'
}

export type ModelStatus = 'not_downloaded' | 'downloading' | 'ready' | 'loading' | 'error';

export interface ModelState {
  llmStatus: ModelStatus;
  whisperStatus: ModelStatus;
  llmProgress: number; // 0-100
  whisperProgress: number; // 0-100
}

// ===== Settings Types =====
export type PersonaPresetId =
  | 'default'
  | 'friendly'
  | 'mentor'
  | 'witty'
  | 'counselor'
  | 'custom';

export interface UserSettings {
  companionName: string;
  personaPresetId: PersonaPresetId;
  personaCustomPrompt: string;
  ttsVoice: string;
  ttsRate: number;
  ttsPitch: number;
  autoSyncEnabled: boolean;
  darkMode: 'system' | 'light' | 'dark';
  locale: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  companionName: '헐',
  personaPresetId: 'default',
  personaCustomPrompt: '',
  ttsVoice: 'default',
  ttsRate: 0.5,
  ttsPitch: 1.0,
  autoSyncEnabled: true,
  darkMode: 'system',
  locale: 'ko', // 기본 한국어
};

// ===== Voice Types =====
export type VoiceState = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';
