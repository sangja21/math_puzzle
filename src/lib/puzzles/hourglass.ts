/**
 * 모래시계 퍼즐 게임 로직
 * 
 * 핵심 메커니즘:
 * 1. 각 모래시계는 총 용량(capacity)과 현재 상단 모래량(topSand)을 가짐
 * 2. 뒤집으면 상단/하단이 교체됨
 * 3. "진행" 시 가장 먼저 비는 시계까지 시간이 흐름
 */

export interface HourglassState {
  id: string;
  capacity: number;      // 총 용량 (분)
  topSand: number;       // 상단에 있는 모래 (분)
  isRunning: boolean;    // 모래가 흐르고 있는지
}

export interface GameState {
  hourglasses: HourglassState[];
  elapsedTime: number;   // 총 경과 시간
  targetTime: number;    // 목표 시간
  moveCount: number;     // 뒤집기 횟수
  isComplete: boolean;   // 퍼즐 완료 여부
  history: GameAction[]; // 액션 히스토리
}

export interface GameAction {
  type: 'flip' | 'advance';
  hourglassId?: string;
  timeAdvanced?: number;
  timestamp: number;
}

export interface PuzzleConfig {
  id: string;
  name: string;
  description: string;
  hourglasses: { capacity: number }[];
  targetTime: number;
  optimalMoves?: number;
}

// 퍼즐 설정들
export const PUZZLES: PuzzleConfig[] = [
  {
    id: 'hourglass-15min',
    name: '15분 재기',
    description: '7분과 11분 모래시계로 정확히 15분을 재세요!',
    hourglasses: [{ capacity: 7 }, { capacity: 11 }],
    targetTime: 15,
    optimalMoves: 4,
  },
  {
    id: 'hourglass-9min',
    name: '9분 재기',
    description: '4분과 7분 모래시계로 정확히 9분을 재세요!',
    hourglasses: [{ capacity: 4 }, { capacity: 7 }],
    targetTime: 9,
    optimalMoves: 3,
  },
];

/**
 * 초기 게임 상태 생성
 * - 모래가 이미 상단에 있고 흐르는 상태로 시작!
 */
export function createInitialState(config: PuzzleConfig): GameState {
  return {
    hourglasses: config.hourglasses.map((h, index) => ({
      id: `hourglass-${index}`,
      capacity: h.capacity,
      topSand: h.capacity, // 모래가 위에 가득
      isRunning: true,     // 이미 흐르는 상태로 시작!
    })),
    elapsedTime: 0,
    targetTime: config.targetTime,
    moveCount: 0,
    isComplete: false,
    history: [],
  };
}

/**
 * 모래시계 뒤집기
 * - 상단과 하단의 모래가 교체됨
 * - 모래가 있으면 흐르기 시작
 */
export function flipHourglass(state: GameState, hourglassId: string): GameState {
  const newState = structuredClone(state);
  const hourglass = newState.hourglasses.find(h => h.id === hourglassId);
  
  if (!hourglass) return state;
  
  // 뒤집기: 상단 모래 = 용량 - 기존 상단 모래 (하단에 있던 것이 상단으로)
  const bottomSand = hourglass.capacity - hourglass.topSand;
  hourglass.topSand = bottomSand;
  hourglass.isRunning = hourglass.topSand > 0;
  
  newState.moveCount++;
  newState.history.push({
    type: 'flip',
    hourglassId,
    timestamp: Date.now(),
  });
  
  return newState;
}

/**
 * 시간 진행 - 가장 먼저 비는 시계까지 시간이 흐름
 * @returns [새 상태, 진행된 시간]
 */
export function advanceTime(state: GameState): [GameState, number] {
  const runningHourglasses = state.hourglasses.filter(h => h.isRunning && h.topSand > 0);
  
  if (runningHourglasses.length === 0) {
    return [state, 0];
  }
  
  // 가장 먼저 비는 시계의 시간
  const minTime = Math.min(...runningHourglasses.map(h => h.topSand));
  
  const newState = structuredClone(state);
  
  // 모든 흐르는 시계에서 시간 감소
  newState.hourglasses.forEach(h => {
    if (h.isRunning && h.topSand > 0) {
      h.topSand -= minTime;
      if (h.topSand <= 0) {
        h.topSand = 0;
        h.isRunning = false;
      }
    }
  });
  
  newState.elapsedTime += minTime;
  
  // 목표 달성 체크
  if (newState.elapsedTime === newState.targetTime) {
    newState.isComplete = true;
  }
  
  newState.history.push({
    type: 'advance',
    timeAdvanced: minTime,
    timestamp: Date.now(),
  });
  
  return [newState, minTime];
}

/**
 * 흐르고 있는 시계가 있는지 확인
 */
export function hasRunningHourglass(state: GameState): boolean {
  return state.hourglasses.some(h => h.isRunning && h.topSand > 0);
}

/**
 * 게임 오버 체크 (목표 시간 초과)
 */
export function isGameOver(state: GameState): boolean {
  return state.elapsedTime > state.targetTime;
}

/**
 * 최적해 달성 체크
 */
export function isOptimalSolution(state: GameState, config: PuzzleConfig): boolean {
  return state.isComplete && 
         config.optimalMoves !== undefined && 
         state.moveCount <= config.optimalMoves;
}
