import type { PersonaPresetId } from '../types';

type ResponseBuilder = (userText: string, name: string) => string;

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n) + '…' : s);

const POOLS: Record<Exclude<PersonaPresetId, 'custom'>, ResponseBuilder[]> = {
  default: [
    (t, n) => `"${truncate(t, 30)}"라고 했구나. 그 말 들으니 마음이 조금 따뜻해져. 어떤 기분이야?`,
    (t, n) => `${n}는 네 말 듣고 있어. 조금 더 자세히 들려줄래?`,
    (_t, n) => `음... 있는 그대로 느껴져. ${n}도 같이 느끼고 있어.`,
  ],
  friendly: [
    (t) => `오 "${truncate(t, 25)}"? 완전 공감 ㅋㅋ 나도 그래.`,
    (_t) => `야 그거 완전 레전드네 😄 더 얘기해봐.`,
    (t) => `"${truncate(t, 20)}" — 이거 진심 공감 100퍼.`,
  ],
  mentor: [
    (t) => `좋은 얘기예요. "${truncate(t, 30)}" — 먼저 물어볼게요: 그 상황에서 가장 중요하게 생각한 건 뭐였나요?`,
    (_t) => `세 가지 관점으로 볼 수 있어요: 1) 목표, 2) 제약, 3) 대안. 어디부터 볼까요?`,
    (t) => `"${truncate(t, 25)}"에 대해 구체적인 예시를 하나만 더 들어주실 수 있나요?`,
  ],
  witty: [
    (t, n) => `"${truncate(t, 25)}"이라... 이거 영화 Her 감독판에 나올 법한 대사네 🎬`,
    (_t, n) => `${n}(두뇌 로딩 중...▓▓▓▓▓▓▓▓░░ 80%) 조금만 기다려 😏`,
    (t) => `"${truncate(t, 20)}" — 이걸 시로 풀면 3행 반 정도 될 듯.`,
  ],
  counselor: [
    (t) => `"${truncate(t, 25)}"라고 말씀해주셔서 고마워요. 그때 어떤 감정이 드셨는지 조금 더 들려주실 수 있을까요?`,
    (_t) => `그런 마음이 드는 건 자연스러운 일이에요. 지금은 어떠세요?`,
    (t) => `${truncate(t, 20)}... 그 말 속에 담긴 감정이 느껴져요. 잠깐 숨 고르고 얘기해도 괜찮아요.`,
  ],
};

function buildForCustom(userText: string, name: string, customPrompt: string): string {
  const hint = customPrompt.trim()
    ? truncate(customPrompt.trim(), 80)
    : '(시스템 프롬프트가 비어있어요)';
  return `[목업] ${name}은(는) 지금 네가 설정한 페르소나("${hint}")로 "${truncate(userText, 20)}"에 답할 거야. 실기기에서 실제 LLM이 작동하면 진짜 응답이 나와.`;
}

/**
 * Deterministic-ish pick using message length hash.
 * Keeps variety without pulling a random util dep.
 */
function pickIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % Math.max(1, mod);
}

export function generateMockReply(params: {
  userText: string;
  presetId: PersonaPresetId;
  customPrompt: string;
  companionName: string;
}): string {
  const { userText, presetId, customPrompt, companionName } = params;
  const name = companionName?.trim() || 'HERL';
  if (presetId === 'custom') {
    return buildForCustom(userText, name, customPrompt);
  }
  const pool = POOLS[presetId] ?? POOLS.default;
  const idx = pickIndex(userText + presetId, pool.length);
  return pool[idx](userText, name);
}

/**
 * Stream a string char-by-char with delay, invoking onToken for each chunk.
 * Returns when fully emitted or shouldAbort() returns true.
 */
export async function streamMockTokens(
  text: string,
  onToken: (chunk: string) => void,
  shouldAbort: () => boolean,
  tokenDelayMs = 18,
): Promise<void> {
  for (let i = 0; i < text.length; i++) {
    if (shouldAbort()) return;
    // emit 1-3 chars at a time to feel natural
    const chunkSize = 1 + (i % 3);
    const end = Math.min(i + chunkSize, text.length);
    onToken(text.slice(i, end));
    i = end - 1;
    await new Promise<void>((r) => setTimeout(r, tokenDelayMs));
  }
}
