/** 마스터마인드 — Knuth 표준 채점. 6색, 코드 길이 3/4/5 가변 */

export type Color = 0 | 1 | 2 | 3 | 4 | 5;
export type Guess = Color[];

export const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const;
export const COLOR_COUNT = 6;

/** 검정 = 자리·색 모두 맞음, 흰 = 색만 맞고 자리 틀림. black + white <= length 보장 */
export interface Score {
  black: number;
  white: number;
}

/**
 * Knuth 표준 채점. 1pass 로 검정 카운트, 색별 빈도 차이로 흰 카운트.
 * 중복 색 처리 정확 — 검정으로 이미 잡힌 자리는 양쪽 빈도 집계에서 제외.
 * 예) secret=[0,0,1,1], guess=[0,1,0,1] → black=2 (idx 0,3), white=2 (남은 0/1 매칭)
 */
export function scoreGuess(secret: Guess, guess: Guess): Score {
  const len = Math.min(secret.length, guess.length);
  let black = 0;
  const secretCount = new Map<Color, number>();
  const guessCount = new Map<Color, number>();
  for (let i = 0; i < len; i++) {
    if (secret[i] === guess[i]) {
      black++;
    } else {
      secretCount.set(secret[i], (secretCount.get(secret[i]) ?? 0) + 1);
      guessCount.set(guess[i], (guessCount.get(guess[i]) ?? 0) + 1);
    }
  }
  let white = 0;
  for (const [c, n] of guessCount) {
    white += Math.min(n, secretCount.get(c) ?? 0);
  }
  return { black, white };
}

/** 0..COLOR_COUNT-1 사이 정수 색만 생성. rng 미지정 시 Math.random */
export function randomCode(length: number, rng: () => number = Math.random): Guess {
  const out: Color[] = [];
  for (let i = 0; i < length; i++) {
    out.push(Math.floor(rng() * COLOR_COUNT) as Color);
  }
  return out;
}

export interface HistoryEntry {
  guess: Guess;
  score: Score;
}

export interface GameState {
  secret: Guess;
  length: number;
  maxRounds: number;
  history: HistoryEntry[];
  status: 'playing' | 'won' | 'lost';
}

export function createGame(length: number, maxRounds: number, rng: () => number = Math.random): GameState {
  return {
    secret: randomCode(length, rng),
    length,
    maxRounds,
    history: [],
    status: 'playing',
  };
}

/**
 * 추측 제출 — 새 GameState 반환 (불변). status 가 playing 아니면 그대로 반환.
 * black === length 면 won, 그 외 history.length === maxRounds 면 lost.
 */
export function submitGuess(state: GameState, guess: Guess): GameState {
  if (state.status !== 'playing') return state;
  if (guess.length !== state.length) return state;
  const score = scoreGuess(state.secret, guess);
  const history = [...state.history, { guess: [...guess], score }];
  let status: GameState['status'] = 'playing';
  if (score.black === state.length) status = 'won';
  else if (history.length >= state.maxRounds) status = 'lost';
  return { ...state, history, status };
}
