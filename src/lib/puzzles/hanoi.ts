
export type Tower = number[]; // Rod holding disks

export interface HanoiState {
  towers: [Tower, Tower, Tower]; // 3 towers: Left, Center, Right
  moves: number;
}

export interface Move {
  from: number; // 0, 1, 2
  to: number; // 0, 1, 2
  disk: number;
  explanation: string;
}

/**
 * Initializes the game with n disks on the first tower.
 * Disks are represented by numbers 1 (smallest) to n (largest).
 * Larger numbers must always be below smaller numbers.
 */
export const initializeGame = (n: number): HanoiState => {
  const sourceTower: Tower = [];
  // Push disks: n (largest) at bottom, 1 (smallest) at top
  for (let i = n; i >= 1; i--) {
    sourceTower.push(i);
  }
  return {
    towers: [sourceTower, [], []],
    moves: 0,
  };
};

/**
 * Checks if a move is valid according to Hanoi rules.
 */
export const isValidMove = (
  state: HanoiState,
  from: number,
  to: number
): boolean => {
  if (from === to) return false;
  const sourceTower = state.towers[from];
  const targetTower = state.towers[to];

  if (sourceTower.length === 0) return false; // Cannot move from empty tower

  const diskToMove = sourceTower[sourceTower.length - 1]; // Top disk of source
  const topTargetDisk =
    targetTower.length > 0 ? targetTower[targetTower.length - 1] : Infinity;

  // Rule: Cannot place larger disk on smaller disk
  return diskToMove < topTargetDisk;
};

/**
 * Generates the optimal sequence of moves to solve the puzzle.
 * Uses recursive algorithm.
 */
export const solveHanoi = (n: number): Move[] => {
  const moves: Move[] = [];

  const moveDisk = (
    disk: number,
    source: number,
    target: number,
    aux: number
  ) => {
    if (disk === 1) {
      moves.push({
        from: source,
        to: target,
        disk: 1,
        explanation: `${getTowerName(source)}에서 ${getTowerName(target)}으로 1번 원판을 옮겨요`,
      });
      return;
    }

    // Step 1: Move n-1 disks from source to aux
    moveDisk(disk - 1, source, aux, target);

    // Step 2: Move the nth disk from source to target
    moves.push({
      from: source,
      to: target,
      disk: disk,
      explanation: `${getTowerName(source)}에서 ${getTowerName(target)}으로 ${disk}번 원판을 옮겨요`,
    });

    // Step 3: Move n-1 disks from aux to target
    moveDisk(disk - 1, aux, target, source);
  };

  moveDisk(n, 0, 2, 1); // Move n disks from Tower 0 to Tower 2 using Tower 1
  return moves;
};

const getTowerName = (index: number): string => {
  switch (index) {
    case 0:
      return '왼쪽';
    case 1:
      return '가운데';
    case 2:
      return '오른쪽';
    default:
      return '';
  }
};
