export interface LevelConfig {
  level: number;
  size: number;
  clicks: number;
  name: string;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, size: 3, clicks: 2, name: '입문' },
  { level: 2, size: 3, clicks: 4, name: '연습' },
  { level: 3, size: 4, clicks: 3, name: '확장' },
  { level: 4, size: 4, clicks: 5, name: '도전' },
  { level: 5, size: 5, clicks: 7, name: '마스터' },
];

export type Board = boolean[][];

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

export function toggleCell(board: Board, row: number, col: number): Board {
  const size = board.length;
  const next = board.map((r) => [...r]);
  const dirs = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      next[nr][nc] = !next[nr][nc];
    }
  }
  return next;
}

export function isSolved(board: Board): boolean {
  return board.every((row) => row.every((cell) => !cell));
}

export function generatePuzzle(size: number, clicks: number): Board {
  let board = createEmptyBoard(size);
  const used = new Set<string>();

  while (used.size < clicks) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    const key = `${r},${c}`;
    if (!used.has(key)) {
      used.add(key);
      board = toggleCell(board, r, c);
    }
  }

  return board;
}

export function countLit(board: Board): number {
  return board.reduce(
    (sum, row) => sum + row.reduce((s, cell) => s + (cell ? 1 : 0), 0),
    0
  );
}
