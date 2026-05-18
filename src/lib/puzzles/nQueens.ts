/** 보드 — 각 열(column)마다 퀸이 있는 행(row). -1 = 없음 */
export type Board = number[];

export function attacks(r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false;
  if (r1 === r2) return true;
  if (c1 === c2) return true;
  return Math.abs(r1 - r2) === Math.abs(c1 - c2);
}

export function attackingPairs(board: Board): Array<[[number, number], [number, number]]> {
  const out: Array<[[number, number], [number, number]]> = [];
  const n = board.length;
  for (let c1 = 0; c1 < n; c1++) {
    const r1 = board[c1];
    if (r1 < 0) continue;
    for (let c2 = c1 + 1; c2 < n; c2++) {
      const r2 = board[c2];
      if (r2 < 0) continue;
      if (attacks(r1, c1, r2, c2)) {
        out.push([[r1, c1], [r2, c2]]);
      }
    }
  }
  return out;
}

export function isSolved(board: Board): boolean {
  const n = board.length;
  if (n === 0) return false;
  for (let c = 0; c < n; c++) if (board[c] < 0 || board[c] >= n) return false;
  return attackingPairs(board).length === 0;
}

// 컬럼별 백트래킹 — diag/anti-diag 집합으로 O(1) 충돌 검사
function backtrack(
  n: number,
  onSolution: (board: Board) => boolean | void,
  onStep?: (board: Board, column: number, status: 'try' | 'reject' | 'accept' | 'backtrack') => void,
): void {
  const board: Board = new Array(n).fill(-1);
  const rows = new Set<number>();
  const diag = new Set<number>(); // r - c
  const anti = new Set<number>(); // r + c
  let stopped = false;

  const recurse = (c: number): void => {
    if (stopped) return;
    if (c === n) {
      onStep?.(board.slice(), c - 1, 'accept');
      const stop = onSolution(board.slice());
      if (stop === true) stopped = true;
      return;
    }
    for (let r = 0; r < n; r++) {
      if (stopped) return;
      if (rows.has(r) || diag.has(r - c) || anti.has(r + c)) {
        board[c] = r;
        onStep?.(board.slice(), c, 'reject');
        continue;
      }
      board[c] = r;
      rows.add(r); diag.add(r - c); anti.add(r + c);
      onStep?.(board.slice(), c, 'try');
      recurse(c + 1);
      rows.delete(r); diag.delete(r - c); anti.delete(r + c);
      if (stopped) return;
    }
    // 모든 행 실패 → 백트래킹
    board[c] = -1;
    if (c > 0) onStep?.(board.slice(), c - 1, 'backtrack');
  };

  recurse(0);
}

export function solveOne(n: number): Board | null {
  if (n <= 0) return null;
  let found: Board | null = null;
  backtrack(n, (b) => {
    found = b;
    return true;
  });
  return found;
}

export function countSolutions(n: number): number {
  if (n <= 0) return 0;
  let count = 0;
  backtrack(n, () => { count++; });
  return count;
}

export interface SolveStep {
  board: Board;
  column: number;
  status: 'try' | 'reject' | 'accept' | 'backtrack';
}

export function solveSteps(n: number): SolveStep[] {
  const steps: SolveStep[] = [];
  backtrack(
    n,
    () => true, // 첫 해까지만 추적 — n=8에서도 적당한 길이
    (board, column, status) => {
      steps.push({ board, column, status });
    },
  );
  return steps;
}
