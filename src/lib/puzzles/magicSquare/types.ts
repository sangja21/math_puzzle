/**
 * 마방진(Magic Square) 게임의 타입 정의
 */

/** 게임 모드 */
export type GameMode = 'free' | 'guided';

/** 난이도 레벨 (0=쉬움, 1=보통, 2=어려움) */
export type DifficultyLevel = 0 | 1 | 2;

/** 보드 크기 */
export type BoardSize = 3 | 4 | 5;

/** 마방진 게임 상태 */
export interface MagicSquareState {
  /** 보드 크기 (N) */
  size: BoardSize;
  /** 게임 모드 */
  mode: GameMode;
  /** 난이도 레벨 */
  difficulty: DifficultyLevel;
  /** 주어진 숫자 잠금 여부 */
  lockGivens: boolean;
  /** NxN 보드 (null = 빈 셀) */
  board: (number | null)[][];
  /** 잠금 상태 (가이드 모드에서 주어진 숫자) */
  locked: boolean[][];
  /** 아직 배치하지 않은 숫자 목록 */
  palette: number[];
  /** 퍼즐 완성 여부 */
  solved: boolean;
}

/** 난이도별 제거할 숫자 개수 */
export const DIFFICULTY_REMOVAL_MAP: Record<BoardSize, [number, number, number]> = {
  3: [3, 4, 5],
  4: [6, 8, 10],
  5: [10, 13, 16],
};

/** 드래그 아이템 타입 */
export interface DragItem {
  /** 드래그 중인 숫자 */
  value: number;
  /** 출발지 타입 */
  source: 'palette' | 'board';
  /** 보드에서 드래그 시 원래 위치 */
  row?: number;
  col?: number;
}

/** 검증 결과 상세 정보 */
export interface ValidationDetail {
  /** 각 행의 합 */
  rowSums: number[];
  /** 각 열의 합 */
  colSums: number[];
  /** 주 대각선 합 (좌상→우하) */
  mainDiagSum: number;
  /** 반 대각선 합 (우상→좌하) */
  antiDiagSum: number;
  /** 목표 합 (Magic Constant) */
  targetSum: number;
  /** 모든 셀이 채워졌는지 */
  isFilled: boolean;
  /** 마방진이 완성되었는지 */
  isSolved: boolean;
}
