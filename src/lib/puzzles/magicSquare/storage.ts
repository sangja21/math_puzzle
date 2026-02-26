/**
 * 마방진 게임 상태 localStorage 관리
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. SSR hydration 불일치 방지를 위해 useEffect 내에서만 접근
 * 2. JSON 직렬화/역직렬화로 복잡한 2D 배열 상태를 안전하게 저장
 * 3. 키 네이밍 컨벤션: 'magic-square-{항목}'으로 네임스페이스 분리
 */

import { MagicSquareState, BoardSize, GameMode, DifficultyLevel } from './types';

const STORAGE_KEY = 'magic-square-state';

/** localStorage에서 게임 상태 로드 */
export function loadGameState(): MagicSquareState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as MagicSquareState;

    // 기본적인 유효성 검증
    if (
      !parsed.board ||
      !parsed.palette ||
      ![3, 4, 5].includes(parsed.size)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/** 게임 상태를 localStorage에 저장 */
export function saveGameState(state: MagicSquareState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage 용량 초과 등 무시
    console.warn('마방진 상태 저장 실패');
  }
}

/** 저장된 게임 상태 삭제 */
export function clearGameState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** 기본 초기 상태 생성 */
export function createInitialState(
  size: BoardSize = 3,
  mode: GameMode = 'free',
  difficulty: DifficultyLevel = 0
): MagicSquareState {
  const n = size;
  return {
    size,
    mode,
    difficulty,
    lockGivens: true,
    board: Array.from({ length: n }, () => Array(n).fill(null)),
    locked: Array.from({ length: n }, () => Array(n).fill(false)),
    palette: Array.from({ length: n * n }, (_, i) => i + 1),
    solved: false,
  };
}
