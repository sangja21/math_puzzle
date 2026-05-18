# 마스터마인드 — 구현 사양

## 스토리

1970년대 영국에서 출시된 *코드 깨기* 보드게임. 출제자가 색 핀 N개로 비밀 코드를 만들면, 추측자는 매 라운드 N개 색을 제시. 출제자는 **검정 페그**(자리·색 모두 맞음) 와 **흰 페그**(색만 맞고 자리 틀림) 로 채점. 제한된 라운드 안에 정답을 맞춰야.

추론·정보이론의 게임화 — 어떤 색 조합을 시도하면 가장 많은 정보를 얻을지 머리 굴리는 재미.

## 파일 구조

```
src/lib/puzzles/mastermind.ts             신규
src/app/puzzle/mastermind/page.tsx        신규
src/app/puzzle/mastermind/page.module.css 신규
src/lib/puzzles.ts                         카탈로그
```

## 로직 모듈

```ts
export type Color = 0 | 1 | 2 | 3 | 4 | 5;  // 6 colors
export type Guess = Color[];  // length = code length

export const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const;

/** 채점 — Knuth 표준: 검정(정확) + 흰(색만 맞음, 자리 틀림). 색 중복 처리 정확해야 */
export interface Score {
  black: number;
  white: number;
}
export function scoreGuess(secret: Guess, guess: Guess): Score;

/** 무작위 코드 생성 */
export function randomCode(length: number, rng?: () => number): Guess;

/** 게임 상태 */
export interface GameState {
  secret: Guess;
  length: number;
  maxRounds: number;
  history: Array<{ guess: Guess; score: Score }>;
  status: 'playing' | 'won' | 'lost';
}
export function createGame(length: number, maxRounds: number, rng?: () => number): GameState;
export function submitGuess(state: GameState, guess: Guess): GameState;
```

**검증 기준 (B)**:
- `scoreGuess([0,1,2,3], [0,1,2,3]).black === 4, .white === 0`
- `scoreGuess([0,1,2,3], [3,2,1,0]).black === 0, .white === 4`
- `scoreGuess([0,0,1,1], [1,1,0,0]).black === 0, .white === 4`
- `scoreGuess([0,0,1,1], [0,1,0,1]).black === 2, .white === 2`
- `scoreGuess([0,1,2,3], [4,5,4,5]).black === 0, .white === 0`
- 100k 랜덤 (secret, guess) 쌍: `black + white <= length` 항상 성립
- `submitGuess` 가 history에 정확히 append, `status` 가 정답이면 'won', maxRounds 초과면 'lost'

## UI

- 상단: 제목 + 난이도 칩 (코드 길이 3/4/5, 라운드 수)
- 본체: 보드
  - 위에서 아래로 라운드 행 — 각 행에 *추측 N칸* + *페그 N칸*
  - 최신 행은 입력 활성
- 우측: 색 팔레트 (6색 원형 버튼) — 클릭으로 셀에 색 채움
- 하단: 제출 / 리셋 / 새 게임
- 상태별:
  - 'playing' → 입력 가능
  - 'won' → 모든 행 회색 + 비밀 공개 + 축하
  - 'lost' → 비밀 공개 + 패배 메시지
- 하단 `<details>` 도움말: 검정/흰 페그 의미, 정보 효율적인 첫 추측 팁

## CSS

- 다크 + 색 팔레트는 채도 높게
- 페그 원형 작게 (검정/흰)
- 768/480 반응형 — 셀 크기 가변

## 카탈로그

```ts
{
  id: 'mastermind',
  title: '마스터마인드',
  emoji: '🎯',
  description: '6가지 색으로 만든 비밀 코드를 단서만 보고 깨라! 추론과 정보의 게임.',
  difficulty: 'medium',
  href: '/puzzle/mastermind',
  tag: '추론 🎯',
  category: 'puzzle',
}
```

## 검증 (B)

- tsc·eslint·build, 라우트 `/puzzle/mastermind`
- 위 6개 알려진 채점 케이스 정확
- 무작위 (secret, guess) 100k → `black + white <= length` 항상
- `submitGuess` 후 정답일 때 'won'
- 무작위 게임 10개 시뮬: 모두 정상 종료 (won 또는 lost)

## 코딩 가이드

- 채점은 표준 알고리즘: 1pass 로 검정 계산, 색별 카운트 차로 흰 계산 (중복 색 정확)
- 외부 라이브러리 없음
- 색은 CSS 변수로 (--color-0 ~ --color-5)
