/**
 * 100개의 문과 100명의 간수 퍼즐 게임 로직
 * 
 * 핵심 메커니즘:
 * 1. 100개의 문이 처음엔 모두 닫혀 있음
 * 2. n번 간수는 n의 배수인 문들을 토글함
 * 3. 최종적으로 완전제곱수 번호의 문만 열려 있음 (약수 개수가 홀수)
 */

export interface DoorState {
  number: number;       // 문 번호 (1-100)
  isOpen: boolean;      // 열려 있는지
  toggleCount: number;  // 토글된 횟수 (약수 개수)
}

export interface GameState {
  doors: DoorState[];
  currentGuard: number;   // 현재 간수 (0 = 시작 전, 1-100)
  isComplete: boolean;    // 100번 간수까지 완료
  highlightedDoors: number[]; // 현재 간수가 방문 중인 문들
}

export const TOTAL_DOORS = 100;
export const TOTAL_GUARDS = 100;

/**
 * 초기 게임 상태 생성
 * - 모든 문이 닫혀 있음
 */
export function createInitialState(): GameState {
  const doors: DoorState[] = [];
  for (let i = 1; i <= TOTAL_DOORS; i++) {
    doors.push({
      number: i,
      isOpen: false,
      toggleCount: 0,
    });
  }
  
  return {
    doors,
    currentGuard: 0,
    isComplete: false,
    highlightedDoors: [],
  };
}

/**
 * n의 배수인 문 번호들 반환
 */
export function getMultiples(n: number): number[] {
  const multiples: number[] = [];
  for (let i = n; i <= TOTAL_DOORS; i += n) {
    multiples.push(i);
  }
  return multiples;
}

/**
 * 다음 간수 진행
 * - 현재 간수 번호의 배수인 문들을 토글
 */
export function advanceGuard(state: GameState): GameState {
  if (state.isComplete) return state;
  
  const nextGuard = state.currentGuard + 1;
  if (nextGuard > TOTAL_GUARDS) return state;
  
  const multiples = getMultiples(nextGuard);
  const newDoors = state.doors.map(door => {
    if (multiples.includes(door.number)) {
      return {
        ...door,
        isOpen: !door.isOpen,
        toggleCount: door.toggleCount + 1,
      };
    }
    return door;
  });
  
  return {
    doors: newDoors,
    currentGuard: nextGuard,
    isComplete: nextGuard >= TOTAL_GUARDS,
    highlightedDoors: multiples,
  };
}

/**
 * 특정 간수까지 한 번에 진행
 */
export function advanceToGuard(state: GameState, targetGuard: number): GameState {
  let currentState = state;
  while (currentState.currentGuard < targetGuard && !currentState.isComplete) {
    currentState = advanceGuard(currentState);
  }
  return {
    ...currentState,
    highlightedDoors: [], // 한 번에 진행할 때는 하이라이트 제거
  };
}

/**
 * 모든 간수 진행 완료
 */
export function completeAllGuards(state: GameState): GameState {
  return advanceToGuard(state, TOTAL_GUARDS);
}

/**
 * 열린 문 개수
 */
export function countOpenDoors(state: GameState): number {
  return state.doors.filter(d => d.isOpen).length;
}

/**
 * 열린 문 번호들
 */
export function getOpenDoorNumbers(state: GameState): number[] {
  return state.doors.filter(d => d.isOpen).map(d => d.number);
}

/**
 * 완전제곱수인지 확인
 */
export function isPerfectSquare(n: number): boolean {
  const sqrt = Math.sqrt(n);
  return sqrt === Math.floor(sqrt);
}

/**
 * 정답 확인 - 완전제곱수만 열려있는지
 */
export function checkAnswer(state: GameState): boolean {
  if (!state.isComplete) return false;
  
  const openDoors = getOpenDoorNumbers(state);
  const perfectSquares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
  
  if (openDoors.length !== perfectSquares.length) return false;
  
  return openDoors.every((n, i) => n === perfectSquares[i]);
}

/**
 * 해설 텍스트
 */
export const EXPLANATION = `
## 🎯 왜 완전제곱수만 열려있을까?

각 문은 **자신의 약수 개수**만큼 토글됩니다.

예를 들어:
- **12번 문**: 약수가 1, 2, 3, 4, 6, 12 (6개, 짝수) → 닫힘
- **16번 문**: 약수가 1, 2, 4, 8, 16 (5개, 홀수) → 열림

**약수가 홀수 개인 숫자 = 완전제곱수**

이유: 약수는 보통 쌍으로 존재 (예: 12 = 1×12 = 2×6 = 3×4)
하지만 완전제곱수는 √n × √n이 한 번만 카운트됨!

**결론**: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 = **10개**의 문만 열림!
`;
