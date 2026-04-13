export default {
  // Common
  appName: 'HERL',
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  delete: 'Delete',
  retry: 'Retry',
  loading: 'Loading...',

  // Tabs
  tabChat: 'Chat',
  tabHistory: 'History',
  tabSettings: 'Settings',

  // Chat
  chatPlaceholder: 'Type a message...',
  chatEmpty: "Hi, I'm {{name}}",
  chatEmptySubtext: 'Talk to me about anything.\nI\'m here to listen and help.',
  chatLlmNotLoaded: '[LLM not loaded] "{{text}}" - Please download the model first.',
  chatError: "Sorry, something went wrong generating a response. Could you try again?",
  chatDescribePhoto: 'Describe this photo',

  // Model
  modelRequired: 'AI Model Required',
  modelDownloading: 'Downloading... {{progress}}%',
  modelLoading: 'Loading model...',
  modelError: 'Model Error',
  modelErrorRetry: 'Tap to retry download',
  modelKeepOpen: 'Please keep the app open',
  modelInitializing: 'Initializing {{progress}}%',

  // Voice
  voiceWhisperNotLoaded: '[Whisper not loaded - voice input unavailable]',

  // History
  historyEmpty: 'No conversations yet',
  historyEmptySubtext: 'Start chatting with HERL to see your\nconversation history here.',
  historyMessages: '{{count}} messages',
  historyToday: 'Today',
  historyYesterday: 'Yesterday',
  historyDaysAgo: '{{days}}d ago',

  // Settings
  settingsCompanion: 'Companion',
  settingsName: 'Name',
  settingsDevice: 'Device',
  settingsTier: 'Tier',
  settingsLlmModel: 'LLM Model',
  settingsWhisper: 'Speech Recognition',
  settingsModels: 'Models',
  settingsLlm: 'LLM',
  settingsAbout: 'About',
  settingsVersion: 'Version',
  settingsLanguage: 'Language',
} as const;
