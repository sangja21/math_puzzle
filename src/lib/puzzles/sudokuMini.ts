/** 4×4 스도쿠 미니. 0 = 빈칸, 1~4 = 숫자 */
export type Board = number[][];

export const SIZE = 4;
export const BOX = 2;

/** 보드를 깊은 복사 */
export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

/**
 * 셀 (row,col)에 num(1~4)을 놓을 수 있는가.
 * 현재 셀 자체는 빈칸으로 간주 — 이미 num이 들어있어도 자기 자신과 충돌하지 않음.
 */
export function canPlace(board: Board, row: number, col: number, num: number): boolean {
  if (num < 1 || num > SIZE) return false;
  // 행 검사
  for (let c = 0; c < SIZE; c++) {
    if (c === col) continue;
    if (board[row][c] === num) return false;
  }
  // 열 검사
  for (let r = 0; r < SIZE; r++) {
    if (r === row) continue;
    if (board[r][col] === num) return false;
  }
  // 2×2 박스 검사
  const boxR = Math.floor(row / BOX) * BOX;
  const boxC = Math.floor(col / BOX) * BOX;
  for (let r = boxR; r < boxR + BOX; r++) {
    for (let c = boxC; c < boxC + BOX; c++) {
      if (r === row && c === col) continue;
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

/** 모든 셀이 채워졌고 충돌이 없으면 true */
export function isComplete(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (v < 1 || v > SIZE) return false;
      if (!canPlace(board, r, c, v)) return false;
    }
  }
  return true;
}

/** 충돌이 있는 모든 셀 좌표 — UI 강조용. 빈칸은 검사하지 않음. */
export function findConflicts(board: Board): Array<{ row: number; col: number }> {
  const seen = new Set<string>();
  const out: Array<{ row: number; col: number }> = [];
  const mark = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ row: r, col: c });
  };
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      if (!canPlace(board, r, c, v)) mark(r, c);
    }
  }
  return out;
}

/** 다음 빈 셀 — row-major. null 이면 보드 가득 참 */
function findEmpty(board: Board): { row: number; col: number } | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return { row: r, col: c };
    }
  }
  return null;
}

/**
 * 해의 개수. cap 이 지정되면 그 수에 도달하는 즉시 종료 (유일해 검증 시 cap=2).
 * 주어진 보드의 기존 셀은 변경하지 않음 — 내부에서 사본을 사용.
 */
export function countSolutions(board: Board, cap: number = Number.POSITIVE_INFINITY): number {
  const work = cloneBoard(board);
  // 입력 보드가 이미 충돌 상태면 해 0
  if (findConflicts(work).length > 0) return 0;
  let count = 0;
  const recurse = (): boolean => {
    if (count >= cap) return true;
    const cell = findEmpty(work);
    if (!cell) {
      count++;
      return count >= cap;
    }
    for (let n = 1; n <= SIZE; n++) {
      if (canPlace(work, cell.row, cell.col, n)) {
        work[cell.row][cell.col] = n;
        if (recurse()) return true;
        work[cell.row][cell.col] = 0;
      }
    }
    return false;
  };
  recurse();
  return count;
}

/** 첫 해 하나만 — 풀이 불가면 null */
export function solve(board: Board): Board | null {
  const work = cloneBoard(board);
  if (findConflicts(work).length > 0) return null;
  const recurse = (): boolean => {
    const cell = findEmpty(work);
    if (!cell) return true;
    for (let n = 1; n <= SIZE; n++) {
      if (canPlace(work, cell.row, cell.col, n)) {
        work[cell.row][cell.col] = n;
        if (recurse()) return true;
        work[cell.row][cell.col] = 0;
      }
    }
    return false;
  };
  return recurse() ? work : null;
}

export interface Puzzle {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** 0 = 빈칸, 1~4 = 주어진 숫자 */
  initial: Board;
}

/**
 * 사전 정의 퍼즐들. 모두 유일해 보장 (countSolutions(initial, 2) === 1).
 * easy = 9~10 단서, medium = 7~8, hard = 5~6.
 * (4×4 스도쿠는 단서 4개 이하면 거의 항상 다중해 — 5개가 사실상 최소)
 */
export const PUZZLES: readonly Puzzle[] = [
  // ── easy: 10개 단서 ──
  {
    id: 'mini-easy-1',
    difficulty: 'easy',
    initial: [
      [3, 1, 0, 0],
      [0, 2, 0, 0],
      [2, 4, 1, 0],
      [1, 3, 2, 4],
    ],
  },
  {
    id: 'mini-easy-2',
    difficulty: 'easy',
    initial: [
      [1, 0, 0, 4],
      [0, 2, 1, 3],
      [0, 4, 0, 1],
      [3, 0, 4, 2],
    ],
  },
  // ── medium: 8개 단서 ──
  {
    id: 'mini-medium-1',
    difficulty: 'medium',
    initial: [
      [3, 0, 0, 0],
      [2, 0, 1, 3],
      [0, 0, 3, 1],
      [1, 0, 4, 0],
    ],
  },
  {
    id: 'mini-medium-2',
    difficulty: 'medium',
    initial: [
      [4, 2, 1, 0],
      [1, 0, 4, 0],
      [0, 4, 3, 0],
      [0, 0, 2, 0],
    ],
  },
  // ── hard: 6개 단서 ──
  {
    id: 'mini-hard-1',
    difficulty: 'hard',
    initial: [
      [0, 1, 3, 0],
      [0, 0, 0, 0],
      [0, 3, 1, 0],
      [0, 2, 4, 0],
    ],
  },
  {
    id: 'mini-hard-2',
    difficulty: 'hard',
    initial: [
      [2, 0, 0, 0],
      [0, 1, 2, 0],
      [0, 4, 3, 0],
      [0, 0, 4, 0],
    ],
  },
];
