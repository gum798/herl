export default {
  // Common
  appName: 'HERL',
  cancel: '취소',
  confirm: '확인',
  save: '저장',
  delete: '삭제',
  retry: '다시 시도',
  loading: '로딩 중...',

  // Tabs
  tabChat: '대화',
  tabHistory: '기록',
  tabSettings: '설정',

  // Chat
  chatPlaceholder: '메시지를 입력하세요...',
  chatEmpty: '안녕, 나는 {{name}}이야',
  chatEmptySubtext: '무엇이든 이야기해봐.\n항상 곁에 있을게.',
  chatLlmNotLoaded: '[LLM 미로드] "{{text}}" - 모델을 먼저 다운로드해주세요.',
  chatError: '죄송해요, 응답을 생성하는 중에 문제가 생겼어요. 다시 시도해주시겠어요?',
  chatDescribePhoto: '이 사진에 대해 설명해줘',

  // Model
  modelRequired: 'AI 모델 필요',
  modelDownloading: '다운로드 중... {{progress}}%',
  modelLoading: '모델 로딩 중...',
  modelError: '모델 오류',
  modelErrorRetry: '탭하여 다시 다운로드',
  modelKeepOpen: '앱을 열어두세요',
  modelInitializing: '초기화 중 {{progress}}%',

  // Voice
  voiceWhisperNotLoaded: '[Whisper 미로드 - 음성 입력 불가]',

  // History
  historyEmpty: '대화 기록 없음',
  historyEmptySubtext: 'HERL과 대화를 시작하면\n여기에 기록이 표시됩니다.',
  historyMessages: '{{count}}개 메시지',
  historyToday: '오늘',
  historyYesterday: '어제',
  historyDaysAgo: '{{days}}일 전',

  // Settings
  settingsCompanion: '동반자',
  settingsName: '이름',
  settingsDevice: '디바이스',
  settingsTier: '성능 등급',
  settingsLlmModel: 'LLM 모델',
  settingsWhisper: '음성 인식',
  settingsModels: '모델',
  settingsLlm: 'LLM',
  settingsAbout: '정보',
  settingsVersion: '버전',
  settingsLanguage: '언어',

  // Persona
  settingsPersona: '성격',
  settingsPersonaHint: '동반자의 말투와 성격을 선택하세요.',
  settingsPersonaCustomLabel: '직접 입력 (시스템 프롬프트)',
  settingsPersonaCustomPlaceholder: '예: 너는 우주 탐험가이고 사용자의 모험 파트너야...',
  settingsPersonaCustomHint: '비워두면 기본 성격을 사용합니다.',
  settingsPersonaReset: '기본으로 초기화',
} as const;
