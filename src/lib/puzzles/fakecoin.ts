/**
 * 가짜 동전 찾기 퍼즐 (Fake Coin Puzzle)
 * 
 * 삼진 탐색(Ternary Search)의 효율성을 체험하는 퍼즐
 * 
 * 핵심 원리:
 * - 이진 탐색: O(log₂N) → 8개 동전에서 최대 3번
 * - 삼진 탐색: O(log₃N) → 8개 동전에서 최대 2번
 */

// 난이도 설정
export interface DifficultyConfig {
  id: string;
  name: string;
  coinCount: number;
  optimalMeasures: number;  // 최적 측정 횟수
  description: string;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'easy',
    name: '쉬움',
    coinCount: 3,
    optimalMeasures: 1,
    description: '3개 동전 중 가짜 찾기 (1번 측정)',
  },
  {
    id: 'medium',
    name: '보통',
    coinCount: 9,
    optimalMeasures: 2,
    description: '9개 동전 중 가짜 찾기 (2번 측정)',
  },
  {
    id: 'hard',
    name: '어려움',
    coinCount: 27,
    optimalMeasures: 3,
    description: '27개 동전 중 가짜 찾기 (3번 측정)',
  },
];

// 동전 상태
export interface Coin {
  id: number;
  isFake: boolean;
  isEliminated: boolean;  // 탈락 여부 (가짜가 아님이 확정)
  position: 'pool' | 'left' | 'right';  // 현재 위치
}

// 측정 결과
export type MeasureResult = 'left-heavy' | 'right-heavy' | 'equal';

// 게임 상태
export interface GameState {
  difficulty: DifficultyConfig;
  coins: Coin[];
  fakeCoinId: number;
  measureCount: number;
  isComplete: boolean;
  selectedCoin: number | null;  // 사용자가 선택한 가짜 동전
  history: MeasureHistory[];
  message: string;
}

export interface MeasureHistory {
  leftCoins: number[];
  rightCoins: number[];
  result: MeasureResult;
}

/**
 * 초기 게임 상태 생성
 */
export function createInitialState(difficulty: DifficultyConfig): GameState {
  const fakeCoinId = Math.floor(Math.random() * difficulty.coinCount);
  
  const coins: Coin[] = Array.from({ length: difficulty.coinCount }, (_, i) => ({
    id: i,
    isFake: i === fakeCoinId,
    isEliminated: false,
    position: 'pool',
  }));
  
  return {
    difficulty,
    coins,
    fakeCoinId,
    measureCount: 0,
    isComplete: false,
    selectedCoin: null,
    history: [],
    message: '',
  };
}

/**
 * 동전을 저울에 올리기/내리기
 */
export function moveCoin(state: GameState, coinId: number, position: 'pool' | 'left' | 'right'): GameState {
  if (state.isComplete) return state;
  
  const newCoins = state.coins.map(coin => {
    if (coin.id === coinId) {
      return { ...coin, position };
    }
    return coin;
  });
  
  return {
    ...state,
    coins: newCoins,
    message: '',
  };
}

/**
 * 저울 측정
 */
export function measure(state: GameState): GameState {
  if (state.isComplete) return state;
  
  const leftCoins = state.coins.filter(c => c.position === 'left');
  const rightCoins = state.coins.filter(c => c.position === 'right');
  
  // 양쪽에 동전이 있어야 측정 가능
  if (leftCoins.length === 0 || rightCoins.length === 0) {
    return {
      ...state,
      message: '⚠️ 양쪽 저울에 동전을 올려주세요!',
    };
  }
  
  // 양쪽 개수가 같아야 함
  if (leftCoins.length !== rightCoins.length) {
    return {
      ...state,
      message: '⚠️ 양쪽에 같은 수의 동전을 올려주세요!',
    };
  }
  
  // 가짜 동전이 어느 쪽에 있는지 확인
  const leftHasFake = leftCoins.some(c => c.isFake);
  const rightHasFake = rightCoins.some(c => c.isFake);
  
  let result: MeasureResult;
  let resultMessage: string;
  
  if (leftHasFake) {
    result = 'right-heavy';  // 왼쪽이 가벼움 = 오른쪽이 무거움
    resultMessage = '⬅️ 왼쪽이 가볍습니다! (가짜 동전이 왼쪽에 있음)';
  } else if (rightHasFake) {
    result = 'left-heavy';  // 오른쪽이 가벼움 = 왼쪽이 무거움
    resultMessage = '➡️ 오른쪽이 가볍습니다! (가짜 동전이 오른쪽에 있음)';
  } else {
    result = 'equal';
    resultMessage = '⚖️ 균형! (가짜 동전이 저울 위에 없음)';
  }
  
  // 탈락 동전 마킹 (결과에 따라)
  const newCoins = state.coins.map(coin => {
    if (result === 'equal') {
      // 균형이면 저울 위 동전들은 모두 진짜
      if (coin.position === 'left' || coin.position === 'right') {
        return { ...coin, isEliminated: true, position: 'pool' as const };
      }
    } else if (result === 'right-heavy') {
      // 왼쪽이 가벼우면 오른쪽 + pool 동전들은 진짜
      if (coin.position === 'right') {
        return { ...coin, isEliminated: true, position: 'pool' as const };
      }
      if (coin.position === 'pool' && !coin.isEliminated) {
        return { ...coin, isEliminated: true };
      }
    } else {
      // 오른쪽이 가벼우면 왼쪽 + pool 동전들은 진짜
      if (coin.position === 'left') {
        return { ...coin, isEliminated: true, position: 'pool' as const };
      }
      if (coin.position === 'pool' && !coin.isEliminated) {
        return { ...coin, isEliminated: true };
      }
    }
    // 가벼운 쪽 동전은 pool로 이동하지만 eliminated 아님
    if (coin.position === 'left' || coin.position === 'right') {
      return { ...coin, position: 'pool' as const };
    }
    return coin;
  });
  
  return {
    ...state,
    coins: newCoins,
    measureCount: state.measureCount + 1,
    history: [...state.history, {
      leftCoins: leftCoins.map(c => c.id),
      rightCoins: rightCoins.map(c => c.id),
      result,
    }],
    message: resultMessage,
  };
}

/**
 * 가짜 동전 선택 (정답 제출)
 */
export function selectFakeCoin(state: GameState, coinId: number): GameState {
  if (state.isComplete) return state;
  
  const isCorrect = coinId === state.fakeCoinId;
  
  return {
    ...state,
    selectedCoin: coinId,
    isComplete: true,
    message: isCorrect
      ? `🎉 정답! ${state.measureCount}번 측정으로 가짜 동전(${coinId + 1}번)을 찾았습니다! ${state.measureCount <= state.difficulty.optimalMeasures ? '(최적 해!)' : ''}`
      : `❌ 오답! ${coinId + 1}번은 진짜 동전이에요. 정답은 ${state.fakeCoinId + 1}번이었습니다.`,
  };
}

/**
 * 남은 용의자 동전 수
 */
export function getRemainingCandidates(state: GameState): number {
  return state.coins.filter(c => !c.isEliminated).length;
}

/**
 * 힌트 생성
 */
export function getHint(state: GameState): string {
  const remaining = getRemainingCandidates(state);
  
  if (remaining === 1) {
    return '💡 용의자가 1개뿐이에요! 바로 선택하세요!';
  }
  
  const third = Math.floor(remaining / 3);
  
  if (third >= 1) {
    return `💡 남은 ${remaining}개 동전을 3그룹(${third}, ${third}, ${remaining - 2 * third}개)으로 나눠보세요!`;
  } else {
    return `💡 남은 동전이 ${remaining}개예요. 저울에 1개씩 올려 비교해보세요!`;
  }
}

/**
 * 최적 전략 계산 (log₃N)
 */
export function calculateOptimalMeasures(coinCount: number): number {
  return Math.ceil(Math.log(coinCount) / Math.log(3));
}

/**
 * 해설
 */
export const EXPLANATION = `
## 가짜 동전 찾기의 수학

### 왜 3그룹이 효율적일까?

정보이론 관점에서 생각해봅시다:

**이진 탐색 (2그룹)**
- 한 번 측정으로 절반을 탈락시킴
- 8개 동전 → 4개 → 2개 → 1개
- 최대 **3번** 측정 필요

**삼진 탐색 (3그룹)**
- 한 번 측정으로 2/3를 탈락시킴!
- 9개 동전 → 3개 → 1개
- 최대 **2번** 측정으로 충분!

### 핵심 전략

1. 동전을 **3등분**합니다
2. 두 그룹을 저울에 올립니다
3. 결과 해석:
   - **균형** → 올리지 않은 그룹에 가짜 있음
   - **불균형** → 가벼운 쪽에 가짜 있음
4. 용의자가 1개 남을 때까지 반복!

### 시간복잡도

- 이진 탐색: O(log₂N)
- 삼진 탐색: O(log₃N)

log₃N < log₂N 이므로 삼진 탐색이 더 효율적!

| 동전 수 | 이진 탐색 | 삼진 탐색 |
|--------|----------|----------|
| 3개 | 2번 | **1번** |
| 9개 | 4번 | **2번** |
| 27개 | 5번 | **3번** |
`;
