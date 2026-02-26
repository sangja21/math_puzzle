/**
 * 마방진 생성 알고리즘
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. 홀수 차수(3,5): Siamese Method - (0, n/2) 에서 시작, 우상 이동, 충돌 시 아래로
 * 2. 짝수 차수(4): Doubly Even Method - 순서대로 채운 뒤 4x4 블록 대각선을 보완값으로 교체
 * 3. 퍼즐 생성: 완성 마방진에서 난이도에 따라 일부 숫자를 무작위 제거
 */

import { BoardSize, DifficultyLevel, DIFFICULTY_REMOVAL_MAP } from './types';

/**
 * 홀수 차수 마방진 생성 (Siamese Method)
 * @param n - 홀수 차수 (3 또는 5)
 * @returns n×n 마방진 2차원 배열
 */
export function generateOddMagicSquare(n: number): number[][] {
  if (n % 2 === 0) {
    throw new Error(`generateOddMagicSquare는 홀수만 지원합니다. 입력: ${n}`);
  }

  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  let row = 0;
  let col = Math.floor(n / 2);

  for (let num = 1; num <= n * n; num++) {
    grid[row][col] = num;

    const nextRow = (row - 1 + n) % n;
    const nextCol = (col + 1) % n;

    if (grid[nextRow][nextCol] !== 0) {
      // 충돌 시 아래로 이동
      row = (row + 1) % n;
    } else {
      row = nextRow;
      col = nextCol;
    }
  }

  return grid;
}

/**
 * Doubly Even 마방진 생성 (n = 4k, 여기서는 n=4)
 * @param n - 4의 배수 차수
 * @returns n×n 마방진 2차원 배열
 */
export function generateDoublyEvenMagicSquare(n: number): number[][] {
  if (n % 4 !== 0) {
    throw new Error(`generateDoublyEvenMagicSquare는 4의 배수만 지원합니다. 입력: ${n}`);
  }

  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const total = n * n;

  // Step 1: 순서대로 1~n² 채우기
  let num = 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      grid[i][j] = num++;
    }
  }

  // Step 2: 4×4 서브블록의 대각선 위치를 보완값(n²+1-val)으로 교체
  const blockSize = 4;
  for (let blockRow = 0; blockRow < n; blockRow += blockSize) {
    for (let blockCol = 0; blockCol < n; blockCol += blockSize) {
      for (let i = 0; i < blockSize; i++) {
        for (let j = 0; j < blockSize; j++) {
          // 4×4 블록 내 대각선: i===j 또는 i+j===3
          if (i === j || i + j === blockSize - 1) {
            const r = blockRow + i;
            const c = blockCol + j;
            grid[r][c] = total + 1 - grid[r][c];
          }
        }
      }
    }
  }

  return grid;
}

/**
 * 주어진 크기에 맞는 마방진 생성
 * @param size - 보드 크기
 * @returns 완성된 마방진
 */
export function generateMagicSquare(size: BoardSize): number[][] {
  switch (size) {
    case 3:
    case 5:
      return generateOddMagicSquare(size);
    case 4:
      return generateDoublyEvenMagicSquare(size);
    default:
      throw new Error(`지원하지 않는 크기: ${size}`);
  }
}

/**
 * 마방진 변형 (行/列을 셔플하여 다양한 풀이 생성)
 * @param grid - 원본 마방진
 * @returns 변형된 마방진
 */
export function shuffleMagicSquare(grid: number[][]): number[][] {
  const n = grid.length;
  const result = grid.map(row => [...row]);

  // 행 쌍 교환 (랜덤)
  const swapCount = Math.floor(Math.random() * n);
  for (let s = 0; s < swapCount; s++) {
    const i = Math.floor(Math.random() * n);
    const j = Math.floor(Math.random() * n);
    if (i !== j) {
      [result[i], result[j]] = [result[j], result[i]];
      // 열도 동일하게 교환하여 마방진 유지
      for (let r = 0; r < n; r++) {
        [result[r][i], result[r][j]] = [result[r][j], result[r][i]];
      }
    }
  }

  return result;
}

/**
 * 가이드 퍼즐 생성: 완성 마방진에서 일부 숫자 제거
 * @param size - 보드 크기
 * @param difficulty - 난이도 레벨
 * @returns { solution, board, removedNumbers }
 */
export function generateGuidedPuzzle(
  size: BoardSize,
  difficulty: DifficultyLevel
): {
  solution: number[][];
  board: (number | null)[][];
  removedNumbers: number[];
  locked: boolean[][];
} {
  const solution = generateMagicSquare(size);
  const removalCount = DIFFICULTY_REMOVAL_MAP[size][difficulty];
  const n = size;

  // 제거할 위치를 랜덤으로 선택
  const allPositions: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      allPositions.push([i, j]);
    }
  }

  // Fisher-Yates 셔플
  for (let i = allPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
  }

  const positionsToRemove = allPositions.slice(0, removalCount);

  const board: (number | null)[][] = solution.map(row => [...row]);
  const locked: boolean[][] = Array.from({ length: n }, () => Array(n).fill(true));
  const removedNumbers: number[] = [];

  for (const [r, c] of positionsToRemove) {
    removedNumbers.push(board[r][c] as number);
    board[r][c] = null;
    locked[r][c] = false;
  }

  // 제거된 숫자를 정렬하여 팔레트에 표시
  removedNumbers.sort((a, b) => a - b);

  return { solution, board, removedNumbers, locked };
}
