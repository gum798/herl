# HERL — Your AI Companion

> *Inspired by the movie "Her"*
> 온디바이스 AI 동반자 앱. 당신의 목소리를 듣고, 주변을 보고, 하루를 함께합니다.

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase" alt="Supabase" />
</p>

---

## What is HERL?

HERL은 영화 "Her"에서 영감을 받은 **온디바이스 AI 동반자 앱**입니다.

**모든 대화는 당신의 폰 안에서 처리됩니다.** 서버로 전송되지 않습니다.

### Core Features

| Feature | Description |
|---------|-------------|
| **Voice Conversation** | 마이크 버튼을 누르고 말하면, AI가 음성으로 응답합니다 |
| **Camera Awareness** | 카메라로 주변을 보여주면, AI가 상황을 이해하고 대화에 반영합니다 |
| **Daily Summary** | 하루의 대화를 자동으로 요약하여 클라우드에 저장합니다 |
| **Privacy First** | LLM, 음성인식 모두 온디바이스 처리. 대화 내용이 외부로 나가지 않습니다 |

---

## Architecture

```
                         HERL Architecture
    ┌─────────────────────────────────────────────────┐
    │                   On-Device                      │
    │                                                  │
    │   [Mic] --> Whisper ASR --> LLM --> TTS [Speaker]  │
    │             (음성->텍스트)   (응답 생성) (텍스트->음성)  │
    │                              ↑                    │
    │   [Camera] ──→ Image ────────┘                    │
    │              (상황 인식)                             │
    └─────────────────┬───────────────────────────────┘
                      │ (opt-in sync)
    ┌─────────────────▼───────────────────────────────┐
    │                   Cloud (Supabase)               │
    │   - 대화 요약 저장                                  │
    │   - 크로스 디바이스 동기화                            │
    │   - 사용자 인증                                     │
    └─────────────────────────────────────────────────┘
```

### Device Tier Auto-Detection

| | High-Spec (8GB+ RAM) | Low-Spec (<8GB RAM) |
|---|---|---|
| **LLM** | EXAONE 3.5 2.4B (1.64GB) | Qwen2.5 1.5B (1.12GB) |
| **ASR** | Whisper Small Q5 (190MB) | Whisper Base (148MB) |
| **TTS** | iOS/Android Native TTS | iOS/Android Native TTS |
| **Total** | ~1.83GB | ~1.27GB |

> EXAONE은 LG AI Research가 만든 한국어 최적화 모델입니다.

---

## Tech Stack

- **Frontend**: React Native (Expo 54) + TypeScript
- **On-device LLM**: [llama.rn](https://github.com/mybigday/llama.rn) (GGUF via llama.cpp)
- **Speech-to-Text**: [whisper.rn](https://github.com/mybigday/whisper.rn) (on-device Whisper)
- **Text-to-Speech**: react-native-tts (native iOS/Android TTS)
- **Camera**: expo-camera
- **State**: Zustand
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Navigation**: Expo Router v6

---

## Getting Started

### Prerequisites

- Node.js 18+
- Xcode 15+ (for iOS)
- iOS 16+ device (simulator won't run LLM models efficiently)

### Installation

```bash
# Clone
git clone https://github.com/gum798/herl.git
cd herl/herl-app

# Install dependencies
npm install

# Generate native projects
npx expo prebuild

# Run on iOS device
npx expo run:ios --device
```

### Environment Setup

Create `.env` at project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### First Launch

1. 앱 실행 후 "AI Model Required" 배너가 표시됩니다
2. 배너를 탭하면 LLM 모델이 자동으로 다운로드됩니다 (~1.1-1.6GB)
3. 모델 로드 완료 후 대화를 시작할 수 있습니다

---

## Project Structure

```
herl-app/
├── app/                          # Screens (Expo Router)
│   └── (tabs)/
│       ├── chat.tsx              # Main conversation screen
│       ├── history.tsx           # Conversation history
│       └── settings.tsx          # App settings
├── src/
│   ├── components/               # UI Components
│   │   ├── ChatBubble.tsx        # Message bubbles
│   │   ├── ChatInput.tsx         # Text input
│   │   ├── VoiceButton.tsx       # Push-to-talk (animated)
│   │   ├── StreamingBubble.tsx   # LLM streaming response
│   │   ├── CameraView.tsx        # Camera capture overlay
│   │   └── ModelDownloadBanner.tsx
│   ├── services/                 # Business Logic
│   │   ├── llm.ts                # llama.rn wrapper
│   │   ├── whisper.ts            # whisper.rn wrapper
│   │   ├── tts.ts                # Native TTS wrapper
│   │   ├── camera.ts             # Image capture/convert
│   │   ├── supabase.ts           # Supabase client
│   │   ├── sync.ts               # Cloud sync
│   │   └── summarizer.ts         # Conversation summarizer
│   ├── hooks/                    # React Hooks
│   │   ├── useLLM.ts             # LLM inference + streaming
│   │   ├── useVoiceRecorder.ts   # Full voice pipeline
│   │   └── useCamera.ts          # Camera controls
│   ├── stores/                   # Zustand State
│   └── utils/                    # Utilities
│       ├── deviceCapability.ts   # Device tier detection
│       └── modelDownloader.ts    # Model download manager
└── supabase/migrations/          # Database schema
```

---

## Voice Pipeline

```
User taps mic → Start Recording (expo-av)
                      │
User taps again → Stop Recording
                      │
                  Whisper ASR (on-device)
                  "오늘 날씨 어때?"
                      │
                  LLM Inference (on-device)
                  "오늘은 맑고 따뜻한 날씨예요..."
                      │
                  Native TTS (on-device)
                  [speaks response]
```

---

## Roadmap

### v1.0 (Current MVP)
- [x] Text chat with on-device LLM
- [x] Voice conversation (Whisper + TTS)
- [x] Camera-based situation awareness
- [x] Conversation history with cloud sync
- [x] Daily conversation summary
- [x] Dark theme UI

### v2.0 (Planned)
- [ ] Calendar integration (Google Calendar API)
- [ ] Long-term memory (Vector DB)
- [ ] Custom TTS voice (Kokoro when Korean is supported)
- [ ] Emotion analysis reports
- [ ] Always-on listening (Wake Word detection)
- [ ] Custom persona/personality settings

---

## Privacy

HERL은 프라이버시를 최우선으로 설계했습니다.

- **LLM 추론**: 100% 온디바이스. 대화 내용이 서버로 전송되지 않습니다.
- **음성 인식**: Whisper가 디바이스에서 직접 처리합니다.
- **클라우드 동기화**: 선택사항(opt-in). 대화 요약만 저장되며, 원문은 저장하지 않도록 설정 가능합니다.
- **카메라**: 앱이 포그라운드에 있을 때만 접근. 이미지는 처리 후 즉시 삭제됩니다.

---

## License

MIT

---

<p align="center">
  <strong>HERL</strong> — Because everyone deserves a companion who truly listens.
</p>
