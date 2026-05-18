# 노노그램 (네모로직) — 구현 사양

## 스토리

일본에서 80년대 만들어진 그림 논리 퍼즐. 가로/세로에 적힌 숫자는 *연속된 검은 칸 블록의 길이* 들. 그 단서만으로 그리드 전체를 채워 그림을 완성.

추론·체계적 사고의 클래식. 5×5 → 10×10 로 단계 키움.

## 파일 구조

```
src/lib/puzzles/nonogram.ts                신규
src/app/puzzle/nonogram/page.tsx          신규
src/app/puzzle/nonogram/page.module.css   신규
src/lib/puzzles.ts                         카탈로그
```

## 로직 모듈

```ts
export type CellState = 'empty' | 'filled' | 'cross';
export type Grid = CellState[][];
/** 풀이 검증용 — 1=검정, 0=흰 */
export type Solution = (0 | 1)[][];

/** 한 줄에서 연속 검은 블록 길이들 추출 */
export function lineClues(line: (0 | 1)[]): number[];

/** Solution 으로부터 가로 단서들 (행별) */
export function rowClues(sol: Solution): number[][];

/** Solution 으로부터 세로 단서들 (열별) */
export function colClues(sol: Solution): number[][];

/** 사용자 그리드가 정답인지 (filled 칸의 1/0 패턴이 sol 과 일치) */
export function matches(grid: Grid, sol: Solution): boolean;

/** 한 줄이 단서와 일치하는가 (early feedback) */
export function lineMatchesClues(line: CellState[], clues: number[]): boolean;

export interface Puzzle {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** 정답 그리드 */
  solution: Solution;
}
export const PUZZLES: readonly Puzzle[];  // 최소 5개: 5x5 easy 2, 10x10 medium 2, 10x10 hard 1
```

**검증 기준 (B)**:
- `lineClues([1,1,0,1,0,1,1,1])` → `[2, 1, 3]`
- `lineClues([0,0,0])` → `[]` (또는 `[0]` — 규약 정하기. 기본은 빈 배열)
- 알려진 정답 그리드 → `matches(=sol, sol) === true`
- 한 칸 틀린 그리드 → false
- `PUZZLES.length >= 5`
- 각 퍼즐: `rowClues(p.solution)` 와 `colClues(p.solution)` 가 모두 일관 (대칭 검사: solution 으로부터 단서 → 단서가 정답 그림 다시 그려내는지는 noogram 자체가 NP-hard 라 굳이 검증 안 함, 단서 추출만 확인)
- 모든 퍼즐 solution 값이 0/1 만

## UI

- 상단: 제목 + 난이도 칩 + 퍼즐 선택
- 본체:
  - 좌측 상단 빈칸
  - 상단 행: 열별 단서들 (세로 나열)
  - 좌측 열: 행별 단서들 (가로 나열)
  - 중앙: 그리드 셀
- 인터랙션:
  - 좌클릭: empty → filled → cross → empty (또는 사이클 토글)
  - 모바일: 두 버튼 — *채우기 모드* / *X 모드* 토글
- 우측 패널:
  - 진행 표시
  - 자동 검증 토글 (가로/세로 줄별 일치 시 단서 초록)
  - 힌트 버튼 (한 셀 정답 채우기)
  - 리셋
- 완성 시: 축하 + 다음 퍼즐
- 하단 `<details>`: 단서 읽는 법 + 흔한 추론 패턴

## CSS

- 다크 + 그리드 셀 큼직
- filled = 진한색, cross = X 표시, empty = 회색
- 단서 폰트 큰 사이즈
- 5×5 vs 10×10 셀 크기 가변
- 768/480 반응형 — 10×10 모바일에서도 가독성

## 카탈로그

```ts
{
  id: 'nonogram',
  title: '노노그램',
  emoji: '🟧',
  description: '가로·세로 숫자만 보고 칸을 채워 그림을 완성! 일본의 그림 논리 퍼즐.',
  difficulty: 'medium',
  href: '/puzzle/nonogram',
  tag: '논리 그림 🎨',
  category: 'puzzle',
}
```

## 검증 (B)

- tsc·eslint·build, 라우트 `/puzzle/nonogram`
- `lineClues` 10개 케이스
- 모든 퍼즐 solution 의 행/열 단서 추출 후 *같은 정답에서 같은 단서* 가 나오는지 (idempotency)
- `matches` 정답 일치 / 불일치 케이스
- `lineMatchesClues` 부분 입력 케이스 (incomplete vs incorrect 구분)

## 코딩 가이드

- 외부 라이브러리 없음
- 단서 추출은 단순 run-length encoding
- 실루엣은 손으로 그린 5×5/10×10 (하트, 별, 집, 고양이 같은 친숙 모양 추천)
