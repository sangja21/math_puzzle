/**
 * 마방진 검증 로직
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. Magic Constant M = N*(N²+1)/2 로 목표 합을 계산
 * 2. 모든 행, 열, 두 대각선의 합이 M과 일치하는지 확인
 * 3. 부분 채움 상태에서도 현재 합을 표시하여 실시간 피드백 제공
 */

import { ValidationDetail } from './types';

/**
 * Magic Constant (마방진 상수) 계산
 * @param n - 보드 크기
 * @returns M = N * (N² + 1) / 2
 */
export function getMagicConstant(n: number): number {
  return (n * (n * n + 1)) / 2;
}

/**
 * 보드의 상세 검증 결과 반환
 * @param board - 현재 보드 상태
 * @returns 검증 상세 정보
 */
export function validateBoard(board: (number | null)[][]): ValidationDetail {
  const n = board.length;
  const targetSum = getMagicConstant(n);

  // 행 합
  const rowSums = board.map(row =>
    row.reduce<number>((sum, cell) => sum + (cell ?? 0), 0)
  );

  // 열 합
  const colSums: number[] = [];
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += board[i][j] ?? 0;
    }
    colSums.push(sum);
  }

  // 주 대각선 합 (좌상→우하)
  let mainDiagSum = 0;
  for (let i = 0; i < n; i++) {
    mainDiagSum += board[i][i] ?? 0;
  }

  // 반 대각선 합 (우상→좌하)
  let antiDiagSum = 0;
  for (let i = 0; i < n; i++) {
    antiDiagSum += board[i][n - 1 - i] ?? 0;
  }

  // 모든 셀이 채워졌는지
  const isFilled = board.every(row => row.every(cell => cell !== null));

  // 완성 여부
  const isSolved =
    isFilled &&
    rowSums.every(s => s === targetSum) &&
    colSums.every(s => s === targetSum) &&
    mainDiagSum === targetSum &&
    antiDiagSum === targetSum;

  return {
    rowSums,
    colSums,
    mainDiagSum,
    antiDiagSum,
    targetSum,
    isFilled,
    isSolved,
  };
}

/**
 * 완성된 마방진인지 빠르게 확인 (boolean만 반환)
 * @param board - 현재 보드 상태
 * @returns 마방진 완성 여부
 */
export function isMagicSquare(board: (number | null)[][]): boolean {
  return validateBoard(board).isSolved;
}
