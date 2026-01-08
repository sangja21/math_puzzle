/**
 * 양팔저울(Bachet) 퍼즐 게임 로직
 * 
 * 핵심 원리:
 * - 양팔저울에서는 추를 양쪽 모두에 놓을 수 있음
 * - 3진법 원리: 모든 자연수는 3의 거듭제곱의 합/차로 표현 가능
 * - 최적의 추: 1, 3, 9, 27, 81, ... (3^n)
 */

// 난이도별 설정
export interface DifficultyConfig {
  id: string;
  name: string;
  weights: number[];  // 사용 가능한 추 무게들
  maxWeight: number;  // 최대 측정 가능 무게
  description: string;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'easy',
    name: '쉬움',
    weights: [1, 3, 9],
    maxWeight: 13,  // 1 + 3 + 9
    description: '추 3개로 1~13kg까지 재세요!',
  },
  {
    id: 'medium',
    name: '보통',
    weights: [1, 3, 9, 27],
    maxWeight: 40,  // 1 + 3 + 9 + 27
    description: '추 4개로 1~40kg까지 재세요!',
  },
  {
    id: 'hard',
    name: '어려움',
    weights: [1, 3, 9, 27, 81],
    maxWeight: 121,  // 1 + 3 + 9 + 27 + 81
    description: '추 5개로 1~121kg까지 재세요!',
  },
];

// 추의 위치
export type WeightPosition = 'left' | 'right' | 'none';

// 추 상태
export interface WeightState {
  value: number;
  position: WeightPosition;
}

// 게임 상태
export interface GameState {
  difficulty: DifficultyConfig;
  targetWeight: number;      // 재야 할 목표 무게
  weights: WeightState[];    // 각 추의 상태
  isComplete: boolean;       // 성공 여부
  moveCount: number;         // 이동 횟수
  hintsUsed: number;         // 사용한 힌트 수
}

/**
 * 초기 게임 상태 생성
 */
export function createInitialState(difficulty: DifficultyConfig): GameState {
  const targetWeight = generateTargetWeight(difficulty);
  
  return {
    difficulty,
    targetWeight,
    weights: difficulty.weights.map(value => ({
      value,
      position: 'none' as WeightPosition,
    })),
    isComplete: false,
    moveCount: 0,
    hintsUsed: 0,
  };
}

/**
 * 랜덤 목표 무게 생성
 */
export function generateTargetWeight(difficulty: DifficultyConfig): number {
  return Math.floor(Math.random() * difficulty.maxWeight) + 1;
}

/**
 * 추 위치 변경
 */
export function moveWeight(
  state: GameState,
  weightValue: number,
  newPosition: WeightPosition
): GameState {
  const newWeights = state.weights.map(w => {
    if (w.value === weightValue) {
      return { ...w, position: newPosition };
    }
    return w;
  });

  const newState: GameState = {
    ...state,
    weights: newWeights,
    moveCount: state.moveCount + 1,
  };

  // 균형 체크
  newState.isComplete = checkBalance(newState);

  return newState;
}

/**
 * 저울 균형 체크
 * 좌측: 물건(targetWeight) + 좌측 추들
 * 우측: 우측 추들
 */
export function checkBalance(state: GameState): boolean {
  const leftTotal = getLeftWeight(state);
  const rightTotal = getRightWeight(state);
  
  return leftTotal === rightTotal && rightTotal > 0;
}

/**
 * 좌측 총 무게 (물건 + 추)
 */
export function getLeftWeight(state: GameState): number {
  const leftWeights = state.weights
    .filter(w => w.position === 'left')
    .reduce((sum, w) => sum + w.value, 0);
  
  return state.targetWeight + leftWeights;
}

/**
 * 우측 총 무게 (추만)
 */
export function getRightWeight(state: GameState): number {
  return state.weights
    .filter(w => w.position === 'right')
    .reduce((sum, w) => sum + w.value, 0);
}

/**
 * 저울 기울기 계산 (-1: 좌측으로 기울, 0: 균형, 1: 우측으로 기울)
 * 반환값 범위: -30 ~ 30 (도)
 */
export function calculateTilt(state: GameState): number {
  const leftTotal = getLeftWeight(state);
  const rightTotal = getRightWeight(state);
  
  if (leftTotal === 0 && rightTotal === 0) return 0;
  
  const diff = rightTotal - leftTotal;
  const maxDiff = state.difficulty.maxWeight + state.targetWeight;
  
  // 최대 30도까지 기울어짐
  const tilt = (diff / maxDiff) * 30;
  return Math.max(-30, Math.min(30, tilt));
}

/**
 * 정답(힌트) 계산 - 3진법 변환 사용
 * 
 * 원리: 숫자를 균형 3진법(balanced ternary)으로 표현
 * - 0: 추 사용 안함
 * - 1: 추를 반대편(우측)에
 * - -1: 추를 같은편(좌측)에
 */
export function calculateSolution(targetWeight: number, weights: number[]): Map<number, WeightPosition> {
  const solution = new Map<number, WeightPosition>();
  let remaining = targetWeight;
  
  // 가장 큰 추부터 처리
  const sortedWeights = [...weights].sort((a, b) => b - a);
  
  for (const weight of sortedWeights) {
    if (remaining === 0) {
      solution.set(weight, 'none');
    } else if (remaining > 0) {
      // 양수: 우측에 추가하거나 패스
      if (remaining >= weight) {
        solution.set(weight, 'right');
        remaining -= weight;
      } else if (remaining > weight / 2) {
        // 가까우면 우측에 놓고 차이는 좌측으로
        solution.set(weight, 'right');
        remaining -= weight;
      } else {
        solution.set(weight, 'none');
      }
    } else {
      // 음수: 좌측에 놓아서 상쇄
      if (Math.abs(remaining) >= weight) {
        solution.set(weight, 'left');
        remaining += weight;
      } else if (Math.abs(remaining) > weight / 2) {
        solution.set(weight, 'left');
        remaining += weight;
      } else {
        solution.set(weight, 'none');
      }
    }
  }
  
  // 균형 3진법으로 정확한 해 계산
  return calculateBalancedTernarySolution(targetWeight, weights);
}

/**
 * 균형 3진법 변환으로 정확한 해 계산
 */
function calculateBalancedTernarySolution(target: number, weights: number[]): Map<number, WeightPosition> {
  const solution = new Map<number, WeightPosition>();
  let n = target;
  
  // 초기화
  for (const w of weights) {
    solution.set(w, 'none');
  }
  
  let powerOf3 = 1; // 현재 자릿수 (1, 3, 9, 27, ...)
  
  while (n !== 0 && powerOf3 <= Math.max(...weights)) {
    const remainder = n % 3;
    
    if (remainder === 0) {
      // 이 자릿수 추 사용 안함
    } else if (remainder === 1) {
      // 우측에 배치
      if (weights.includes(powerOf3)) {
        solution.set(powerOf3, 'right');
      }
      n = n - 1;
    } else if (remainder === 2) {
      // 좌측에 배치 (= -1 * 3^k, 그리고 윗자리에 1 더함)
      if (weights.includes(powerOf3)) {
        solution.set(powerOf3, 'left');
      }
      n = n + 1;  // 다음 자리로 올림
    }
    
    n = Math.floor(n / 3);
    powerOf3 *= 3;
  }
  
  return solution;
}

/**
 * 힌트 생성
 */
export function getHint(state: GameState): string {
  const solution = calculateSolution(state.targetWeight, state.difficulty.weights);
  
  // 현재 잘못 배치된 추 찾기
  for (const weight of state.weights) {
    const correctPosition = solution.get(weight.value) || 'none';
    
    if (weight.position !== correctPosition) {
      if (correctPosition === 'left') {
        return `💡 ${weight.value}kg 추를 물건과 같은 쪽(왼쪽)에 놓아보세요!`;
      } else if (correctPosition === 'right') {
        return `💡 ${weight.value}kg 추를 물건 반대쪽(오른쪽)에 놓아보세요!`;
      } else {
        return `💡 ${weight.value}kg 추는 사용하지 않아도 돼요!`;
      }
    }
  }
  
  return '🎉 모든 추가 올바른 위치에 있어요!';
}

/**
 * 게임 리셋 (같은 난이도, 새 목표)
 */
export function resetGame(state: GameState): GameState {
  return createInitialState(state.difficulty);
}

/**
 * 해설 텍스트
 */
export const EXPLANATION = `
## 비셰(Bachet)의 양팔저울 문제

### 핵심 원리: 균형 3진법

일반 저울은 추를 한쪽에만 놓지만, **양팔저울**에서는 추를 **양쪽 모두**에 놓을 수 있습니다!

이 조건에서 최적의 추 조합은 **3의 거듭제곱**입니다:
- 1, 3, 9, 27, 81, ...

### 왜 3의 거듭제곱인가?

모든 자연수는 **균형 3진법**(balanced ternary)으로 표현할 수 있습니다:
- 각 자릿수는 -1, 0, +1 중 하나
- +1: 추를 반대편에
- 0: 추 사용 안함
- -1: 추를 같은편에

### 예시: 7kg 재기

7 = 9 - 3 + 1 = 3² - 3¹ + 3⁰

따라서:
- 1kg 추 → 오른쪽 (물건 반대편)
- 3kg 추 → 왼쪽 (물건과 같은편)
- 9kg 추 → 오른쪽 (물건 반대편)

검산: 왼쪽(7 + 3) = 오른쪽(9 + 1) = 10 ✓
`;
