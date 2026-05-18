# N-퀸 — 구현 사양

## 스토리

체스의 *퀸* 은 가로·세로·대각선으로 무한히 움직이는 가장 강한 말. 8×8 체스판에 퀸 8개를 *서로 공격하지 못하게* 놓을 수 있을까? 이게 1848년에 제기된 *N-퀸 문제*. 답은 8개도 가능, 그리고 그 배치 수는 *92가지* (대칭 제외 12가지).

이 퍼즐은 4×4 → 6×6 → 8×8 단계별로 직접 놓아보며 *충돌* 의 의미를 익히고, 마지막에 자동 백트래킹 해결사를 시각화로 본다.

## 파일 구조

```
src/lib/puzzles/nQueens.ts                신규
src/app/puzzle/n-queens/page.tsx          신규
src/app/puzzle/n-queens/page.module.css   신규
src/lib/puzzles.ts                         카탈로그 1줄 추가
```

## 로직 모듈

```ts
/** 보드 — 각 열(column)마다 퀸이 있는 행(row). -1 = 없음 */
export type Board = number[];

/** 퀸 두 개가 서로 공격하는지 */
export function attacks(r1: number, c1: number, r2: number, c2: number): boolean;

/** 보드의 모든 공격 쌍 */
export function attackingPairs(board: Board): Array<[[number, number], [number, number]]>;

/** 풀린 보드인가 (공격 0 && 모든 열에 퀸) */
export function isSolved(board: Board): boolean;

/** 백트래킹으로 첫 해 찾기 */
export function solveOne(n: number): Board | null;

/** N 크기에서 가능한 모든 해의 수 (n≤8 정도만 호출 권장) */
export function countSolutions(n: number): number;

/** 백트래킹 시각화용 — 단계 시퀀스 (각 단계는 시도 보드) */
export interface SolveStep {
  board: Board;
  column: number;
  status: 'try' | 'reject' | 'accept' | 'backtrack';
}
export function solveSteps(n: number): SolveStep[];
```

**검증 기준 (B)**:
- `countSolutions(4) === 2`, `countSolutions(6) === 4`, `countSolutions(8) === 92` (고전 수치)
- `solveOne(n)` 의 결과는 `isSolved` true
- `attacks` 대칭 — `attacks(a,b,c,d) === attacks(c,d,a,b)`
- 알려진 해 1개(예: 4-Queens `[1,3,0,2]`) 대입 → `isSolved` true
- 알려진 비해(예: `[0,1,2,3]`) → `isSolved` false, `attackingPairs` 결과 ≥ 1

## UI

- 상단: 제목 + N 선택 칩 (4 / 6 / 8)
- 본체: 체스판 SVG (밝은/어두운 칸 교차)
- 인터랙션:
  - 빈 칸 클릭 → 퀸 놓기
  - 퀸 클릭 → 제거
  - 같은 행/열/대각선의 다른 퀸과 공격 관계면 *빨간 선* 연결
  - 우상단: 놓은 수 / 충돌 수 / 클리어 여부
- 우측 패널:
  - *힌트 한 칸 보여주기* 버튼 (현재 보드 + solveOne 차이 한 칸)
  - *자동 해 보기* 버튼 → solveSteps 애니메이션 (단계 0.4초)
  - *리셋* 버튼
  - 해의 개수 표시 (`countSolutions(n)`)
- 하단: `<details>` 도움말 — 왜 N=2,3은 해가 없고 N=4부터 가능한지

## CSS

- 다크 + 보드는 클래식 체스판 색(베이지/갈색)
- 768/480 반응형 — 칸 크기 가변

## 카탈로그

```ts
{
  id: 'n_queens',
  title: 'N-퀸',
  emoji: '♛',
  description: '체스판에 퀸 N개를 서로 공격하지 못하게 놓아라! 4·6·8 단계 도전.',
  difficulty: 'hard',
  href: '/puzzle/n-queens',
  tag: '백트래킹 ♛',
  category: 'puzzle',
}
```

## 검증 (B)

- tsc·eslint·build, 라우트 `/puzzle/n-queens`
- `countSolutions(4)=2, (5)=10, (6)=4, (7)=40, (8)=92` 모두 정확
- `solveOne(8)` → 92개 해 중 하나, `isSolved` true
- 100회 랜덤 보드 생성하여 `attackingPairs` 와 직접 계산 일치

## 코딩 가이드

- N=8 까지만 권장 (N=9 부터 `countSolutions` 시간 증가)
- 시각화 단계는 try/reject/backtrack 표시로 *왜 어려운지* 직관적
- 외부 라이브러리 금지
