# 스도쿠 미니 (4×4) — 구현 사양

## 스토리

스도쿠는 일본에서 90년대 후반 유행한 *9×9 라틴방진* 변형. 가로·세로·박스 각각에 1~9가 한 번씩. 초등에겐 9×9는 부담 — *4×4* 버전(1~4, 2×2 박스 4개)이 입문에 적합.

## 파일 구조

```
src/lib/puzzles/sudokuMini.ts             신규
src/app/puzzle/sudoku-mini/page.tsx       신규
src/app/puzzle/sudoku-mini/page.module.css 신규
src/lib/puzzles.ts                         카탈로그
```

## 로직 모듈

```ts
/** 4×4 보드. 0 = 빈칸, 1~4 = 숫자 */
export type Board = number[][];  // 4×4

/** 한 셀에 num을 둘 수 있는가 (행/열/박스 충돌 없음) */
export function canPlace(board: Board, row: number, col: number, num: number): boolean;

/** 보드가 완성됐는가 (모든 셀 채워짐 + 유효) */
export function isComplete(board: Board): boolean;

/** 보드의 모든 충돌 위치 — UI 강조용 */
export function findConflicts(board: Board): Array<{ row: number; col: number }>;

/** 해의 개수 (유일해 검증용) */
export function countSolutions(board: Board, cap?: number): number;

/** 임의 보드의 해 하나 (백트래킹) */
export function solve(board: Board): Board | null;

/** 사전 정의된 퍼즐들 (난이도 별) — 항상 유일해 보장 */
export interface Puzzle {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** 0=빈칸, 1~4=주어진 숫자 */
  initial: Board;
}
export const PUZZLES: readonly Puzzle[];  // 최소 6개 (easy 2, medium 2, hard 2)
```

**검증 기준 (B)**:
- 모든 `PUZZLES[i].initial` 의 `countSolutions(... , 2) === 1` (유일해)
- `solve(p.initial)` → 완성 보드, `isComplete === true`
- `canPlace` 가 실제로 행/열/박스 충돌을 모두 잡음 (생성된 알려진 충돌 시나리오 10개)
- 빈 보드 → `countSolutions(empty, 100)` 이 양수 (4×4 라틴방진 해 개수 = 288 인데, 박스 제약까지 가면 더 적음 — 단순히 >0 확인)

## UI

- 상단: 제목 + 난이도 칩 (easy/medium/hard) + 퍼즐 인덱스 (1/2)
- 본체: 4×4 SVG 보드
  - 굵은 2×2 박스 경계
  - 주어진 셀: 진한 색 (수정 불가)
  - 입력 셀: 클릭 → 선택
  - 충돌 셀: 빨강 배경
- 우측 패널:
  - 숫자 패드 1~4 (선택 셀에 입력)
  - 지우기 버튼
  - 힌트 버튼 (한 셀 정답 공개)
  - 리셋 버튼
  - 새 퍼즐 (난이도 선택)
- 완성 시: 축하 + 다음 퍼즐 버튼
- 하단 `<details>`: 규칙 + 4×4 vs 9×9 비교

## CSS

- 다크 + 보드는 따뜻한 베이지
- 셀 크기 가변 (60~80px 데스크탑, 50px 모바일)
- 숫자 패드 큼직 (44px+)
- 768/480 반응형

## 카탈로그

```ts
{
  id: 'sudoku_mini',
  title: '스도쿠 미니 (4×4)',
  emoji: '🟦',
  description: '가로·세로·박스에 1~4를 한 번씩! 9×9 스도쿠의 어린이 버전.',
  difficulty: 'easy',
  href: '/puzzle/sudoku-mini',
  tag: '논리 추론 🧩',
  category: 'puzzle',
}
```

## 검증 (B)

- tsc·eslint·build, 라우트 `/puzzle/sudoku-mini`
- `PUZZLES.length >= 6`
- 각 퍼즐 `countSolutions(initial, 2) === 1` (유일해)
- 각 퍼즐 `solve(initial)` 의 완성도 = true
- `canPlace` 10개 충돌 시나리오 정확
- 알려진 완전 보드 → `isComplete === true && findConflicts === []`
- 충돌 보드 → `findConflicts.length >= 1`

## 코딩 가이드

- 외부 라이브러리 없음
- countSolutions 는 cap 옵션으로 조기 종료 (유일해 검증 시 2까지만 세면 됨)
- 보드 복사는 `board.map(r => [...r])` 깊은 복사
