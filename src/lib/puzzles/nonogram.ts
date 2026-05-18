/**
 * 노노그램(Nonogram) — 그림 논리 퍼즐
 *
 * 1 = 검은 칸(filled), 0 = 흰 칸. 사용자 입력 그리드는 'cross'(아닌 칸 마킹) 도 가짐.
 * 단서 = 한 줄의 연속된 검은 칸 블록 길이들. 모두 0이면 빈 배열로 표현(규약).
 */

export type CellState = 'empty' | 'filled' | 'cross';
export type Grid = CellState[][];
/** 풀이 검증용 정답 — 0/1 만 */
export type Solution = (0 | 1)[][];

/**
 * 한 줄에서 연속 검은 블록 길이들 추출.
 * - `lineClues([1,1,0,1,0,1,1,1])` → `[2, 1, 3]`
 * - `lineClues([0,0,0])` → `[]` (빈 줄 = 빈 배열 규약)
 * - `lineClues([1])` → `[1]`
 * - `lineClues([1,1,1])` → `[3]`
 */
export function lineClues(line: (0 | 1)[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v === 1) {
      run++;
    } else if (run > 0) {
      out.push(run);
      run = 0;
    }
  }
  if (run > 0) out.push(run);
  return out;
}

/** Solution 으로부터 가로 단서들 (행별, 위→아래) */
export function rowClues(sol: Solution): number[][] {
  return sol.map((row) => lineClues(row));
}

/** Solution 으로부터 세로 단서들 (열별, 왼→오) */
export function colClues(sol: Solution): number[][] {
  if (sol.length === 0) return [];
  const cols = sol[0].length;
  const out: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const col: (0 | 1)[] = [];
    for (let r = 0; r < sol.length; r++) col.push(sol[r][c]);
    out.push(lineClues(col));
  }
  return out;
}

/**
 * 사용자 그리드가 정답인지 — 'filled' 패턴이 sol 의 1 위치와 정확히 일치.
 * 'cross' 와 'empty' 는 둘 다 0 으로 취급(노노그램 정답 판정은 검은 칸 위치만 따짐).
 */
export function matches(grid: Grid, sol: Solution): boolean {
  if (grid.length !== sol.length) return false;
  for (let r = 0; r < sol.length; r++) {
    if (grid[r].length !== sol[r].length) return false;
    for (let c = 0; c < sol[r].length; c++) {
      const want = sol[r][c] === 1;
      const got = grid[r][c] === 'filled';
      if (want !== got) return false;
    }
  }
  return true;
}

/**
 * 한 줄이 단서와 일치하는가 — 'filled' 만 검은 칸으로 보고 run-length 비교.
 * 'empty'/'cross' 는 모두 흰 칸. (자동 검증의 줄 단위 피드백용)
 */
export function lineMatchesClues(line: CellState[], clues: number[]): boolean {
  const bin: (0 | 1)[] = line.map((s) => (s === 'filled' ? 1 : 0));
  const got = lineClues(bin);
  if (got.length !== clues.length) return false;
  for (let i = 0; i < got.length; i++) if (got[i] !== clues[i]) return false;
  return true;
}

export interface Puzzle {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** 정답 그리드 — 행렬, 0/1 */
  solution: Solution;
}

// ── 하드코딩 헬퍼: 문자열 → Solution. '#' = 1, 그 외 = 0. 시각적 가독성용.
function fromAscii(rows: readonly string[]): Solution {
  return rows.map((row) => Array.from(row).map((ch) => (ch === '#' ? 1 : 0)) as (0 | 1)[]);
}

// ── 5×5 easy ─────────────────────────────────────────────────────
// 하트
const HEART_5 = fromAscii([
  '.#.#.',
  '#####',
  '#####',
  '.###.',
  '..#..',
]);

// 별 (5칸 십자가 + 모서리 살짝)
const STAR_5 = fromAscii([
  '..#..',
  '.###.',
  '#####',
  '.#.#.',
  '#...#',
]);

// ── 10×10 medium ────────────────────────────────────────────────
// 고양이 실루엣 — 귀 두 개 + 동그란 몸 + 꼬리
const CAT_10 = fromAscii([
  '#.#....#.#',
  '###....###',
  '##########',
  '##.####.##',
  '##########',
  '##########',
  '.########.',
  '.#.####.#.',
  '..######..',
  '....##....',
]);

// 새 (비둘기) 실루엣 — 왼쪽으로 향한 머리, 펼친 날개
const BIRD_10 = fromAscii([
  '....#.....',
  '...##.....',
  '..####....',
  '.#######..',
  '##########',
  '.########.',
  '..######..',
  '...####...',
  '...#..#...',
  '..##..##..',
]);

// ── 10×10 hard ──────────────────────────────────────────────────
// 강아지 (앉아있는 강아지: 귀 늘어진 머리 + 몸통 + 다리)
const DOG_10 = fromAscii([
  '##......##',
  '###....###',
  '.########.',
  '.##.##.##.',
  '.########.',
  '..######..',
  '..######..',
  '..######..',
  '..#.##.#..',
  '..##..##..',
]);

export const PUZZLES: readonly Puzzle[] = [
  { id: 'nono-easy-heart', name: '하트', difficulty: 'easy', solution: HEART_5 },
  { id: 'nono-easy-star', name: '별', difficulty: 'easy', solution: STAR_5 },
  { id: 'nono-medium-cat', name: '고양이', difficulty: 'medium', solution: CAT_10 },
  { id: 'nono-medium-bird', name: '새', difficulty: 'medium', solution: BIRD_10 },
  { id: 'nono-hard-dog', name: '강아지', difficulty: 'hard', solution: DOG_10 },
];
