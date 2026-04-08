export type Grid = boolean[][];

export function createEmptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(false));
}

export function countNeighbors(grid: Grid, row: number, col: number): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc]) {
        count++;
      }
    }
  }
  return count;
}

export function nextGeneration(grid: Grid): Grid {
  const rows = grid.length;
  const cols = grid[0].length;
  return grid.map((r, row) =>
    r.map((cell, col) => {
      const n = countNeighbors(grid, row, col);
      if (cell) return n === 2 || n === 3;
      return n === 3;
    })
  );
}

export function countAlive(grid: Grid): number {
  return grid.reduce(
    (sum, row) => sum + row.reduce((s, c) => s + (c ? 1 : 0), 0),
    0
  );
}

export function placePattern(
  grid: Grid,
  pattern: Pattern,
  centerRow: number,
  centerCol: number
): Grid {
  const next = grid.map((r) => [...r]);
  for (const [dr, dc] of pattern.cells) {
    const r = centerRow + dr;
    const c = centerCol + dc;
    if (r >= 0 && r < next.length && c >= 0 && c < next[0].length) {
      next[r][c] = true;
    }
  }
  return next;
}

export interface Pattern {
  name: string;
  type: 'still' | 'oscillator' | 'spaceship' | 'other';
  description: string;
  cells: [number, number][];
}

export const PATTERNS: Pattern[] = [
  // Still Lifes
  {
    name: 'Block',
    type: 'still',
    description: '가장 단순한 정물. 영원히 변하지 않아요.',
    cells: [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
    ],
  },
  {
    name: 'Beehive',
    type: 'still',
    description: '벌집 모양의 안정 패턴.',
    cells: [
      [0, 1], [0, 2],
      [1, 0], [1, 3],
      [2, 1], [2, 2],
    ],
  },
  {
    name: 'Loaf',
    type: 'still',
    description: '빵 모양 정물. 모든 셀이 2~3개의 이웃을 가져요.',
    cells: [
      [0, 1], [0, 2],
      [1, 0], [1, 3],
      [2, 1], [2, 3],
      [3, 2],
    ],
  },
  // Oscillators
  {
    name: 'Blinker',
    type: 'oscillator',
    description: '주기 2로 깜빡이는 가장 단순한 진동자.',
    cells: [
      [0, 0], [0, 1], [0, 2],
    ],
  },
  {
    name: 'Toad',
    type: 'oscillator',
    description: '두더지처럼 주기 2로 진동하는 패턴.',
    cells: [
      [0, 1], [0, 2], [0, 3],
      [1, 0], [1, 1], [1, 2],
    ],
  },
  {
    name: 'Beacon',
    type: 'oscillator',
    description: '두 블록이 교대로 깜빡이는 신호등.',
    cells: [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
      [2, 2], [2, 3],
      [3, 2], [3, 3],
    ],
  },
  {
    name: 'Pulsar',
    type: 'oscillator',
    description: '주기 3의 아름다운 대칭 진동자.',
    cells: [
      [-1, -4], [-1, -3], [-1, -2], [-1, 2], [-1, 3], [-1, 4],
      [-2, -4], [-2, -3], [-2, -2], [-2, 2], [-2, 3], [-2, 4],
      [-3, -4], [-3, -3], [-3, -2], [-3, 2], [-3, 3], [-3, 4],
      [-4, -1], [-4, -2], [-4, -3], [-4, 1], [-4, 2], [-4, 3],
      [-6, -1], [-6, -2], [-6, -3], [-6, 1], [-6, 2], [-6, 3],
      [1, -4], [1, -3], [1, -2], [1, 2], [1, 3], [1, 4],
      [2, -4], [2, -3], [2, -2], [2, 2], [2, 3], [2, 4],
      [3, -4], [3, -3], [3, -2], [3, 2], [3, 3], [3, 4],
      [4, -1], [4, -2], [4, -3], [4, 1], [4, 2], [4, 3],
      [6, -1], [6, -2], [6, -3], [6, 1], [6, 2], [6, 3],
    ],
  },
  // Spaceships
  {
    name: 'Glider',
    type: 'spaceship',
    description: '대각선으로 이동하는 가장 유명한 우주선!',
    cells: [
      [0, 1],
      [1, 2],
      [2, 0], [2, 1], [2, 2],
    ],
  },
  {
    name: 'LWSS',
    type: 'spaceship',
    description: '가벼운 우주선(Lightweight Spaceship). 수평으로 이동!',
    cells: [
      [0, 1], [0, 4],
      [1, 0],
      [2, 0], [2, 4],
      [3, 0], [3, 1], [3, 2], [3, 3],
    ],
  },
  // Other
  {
    name: 'Glider Gun',
    type: 'other',
    description: '고스퍼의 글라이더 건. 끝없이 글라이더를 발사합니다!',
    cells: [
      [0, 24],
      [1, 22], [1, 24],
      [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
      [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35],
      [4, 0], [4, 1], [4, 10], [4, 16], [4, 20], [4, 21],
      [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17], [5, 22], [5, 24],
      [6, 10], [6, 16], [6, 24],
      [7, 11], [7, 15],
      [8, 12], [8, 13],
    ],
  },
  {
    name: 'R-pentomino',
    type: 'other',
    description: '단 5개의 셀이 1000세대 넘게 변화! 카오스의 시작.',
    cells: [
      [0, 1], [0, 2],
      [1, 0], [1, 1],
      [2, 1],
    ],
  },
  {
    name: 'Acorn',
    type: 'other',
    description: '도토리 7개 셀에서 5206세대 후 안정. 놀라운 성장!',
    cells: [
      [0, 1],
      [1, 3],
      [2, 0], [2, 1], [2, 4], [2, 5], [2, 6],
    ],
  },
];

export const PATTERN_TYPES = {
  still: { label: '정물 (Still Life)', emoji: '🧱', color: '#6b7280' },
  oscillator: { label: '진동자 (Oscillator)', emoji: '💫', color: '#f59e0b' },
  spaceship: { label: '우주선 (Spaceship)', emoji: '🚀', color: '#3b82f6' },
  other: { label: '특수 패턴', emoji: '✨', color: '#8b5cf6' },
};
