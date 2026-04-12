# HERL - AI Companion App

## Project Overview
"Her" movie-inspired on-device AI companion app with voice conversation, camera awareness, and cloud sync.

## Tech Stack
- **Framework**: React Native (Expo ~54, bare workflow) + TypeScript
- **Navigation**: Expo Router v6 (file-based routing)
- **State**: Zustand
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **On-device LLM**: llama.rn (GGUF format, E4B/E2B)
- **ASR**: whisper.rn (offline speech recognition)
- **TTS**: react-native-tts (device native TTS)
- **Camera**: react-native-vision-camera

## Project Structure
- `app/` - Expo Router screens (tabs: chat, history, settings)
- `src/components/` - Reusable UI components
- `src/services/` - Business logic (LLM, Whisper, TTS, Supabase, Camera)
- `src/stores/` - Zustand state stores
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions
- `supabase/migrations/` - Database schema

## Key Design Decisions
- **Device tier branching**: High-spec (8GB+) uses E4B + Whisper Small; Low-spec uses E2B + Whisper Tiny
- **Privacy first**: All conversations processed on-device; cloud sync is opt-in
- **Dark theme**: Primary color #e94560, background #1a1a2e

## Commands
- `npm start` - Start Expo dev server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

## Conventions
- Korean comments are OK for domain-specific context
- Use TypeScript strict mode
- Components use named exports, screens use default exports
- All services are thin wrappers around native modules
