/**
 * 에라토스테네스의 체 퍼즐 게임 로직
 * 
 * 핵심 메커니즘:
 * 1. 2부터 N까지의 숫자를 나열
 * 2. 가장 작은 소수를 찾아 그 배수들을 모두 제거
 * 3. √N까지 반복하면 남은 숫자가 모두 소수
 */

export interface NumberState {
  value: number;          // 숫자 값 (2-N)
  isPrime: boolean;       // 소수인지 (아직 제거되지 않음)
  isEliminated: boolean;  // 제거되었는지
  eliminatedBy: number | null;  // 어떤 소수에 의해 제거되었는지
}

export interface SieveState {
  numbers: NumberState[];
  limit: number;                // 범위 상한 (2-1000)
  currentPrime: number;         // 현재 처리 중인 소수 (0 = 시작 전)
  currentStep: number;          // 현재 단계
  totalSteps: number;           // 총 단계 수
  isComplete: boolean;          // 완료 여부
  highlightedNumbers: number[]; // 현재 제거 중인 숫자들
  foundPrimes: number[];        // 발견된 소수들
}

export const MIN_LIMIT = 10;
export const MAX_LIMIT = 1000;
export const DEFAULT_LIMIT = 100;

// 프리셋 범위 옵션
export const LIMIT_PRESETS = [10, 30, 50, 100, 200, 500, 1000];

/**
 * 초기 게임 상태 생성
 */
export function createInitialState(limit: number = DEFAULT_LIMIT): SieveState {
  // 범위 제한
  const safeLimit = Math.min(Math.max(limit, MIN_LIMIT), MAX_LIMIT);
  
  const numbers: NumberState[] = [];
  for (let i = 2; i <= safeLimit; i++) {
    numbers.push({
      value: i,
      isPrime: true,
      isEliminated: false,
      eliminatedBy: null,
    });
  }
  
  // 총 단계 수 = √N 이하의 소수 개수
  const sqrtLimit = Math.floor(Math.sqrt(safeLimit));
  const totalSteps = countPrimesUpTo(sqrtLimit);
  
  return {
    numbers,
    limit: safeLimit,
    currentPrime: 0,
    currentStep: 0,
    totalSteps,
    isComplete: false,
    highlightedNumbers: [],
    foundPrimes: [],
  };
}

/**
 * n 이하의 소수 개수 계산 (단계 수 계산용)
 */
function countPrimesUpTo(n: number): number {
  if (n < 2) return 0;
  
  const sieve = new Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;
  
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false;
      }
    }
  }
  
  return sieve.filter(Boolean).length;
}

/**
 * 다음 소수 찾기
 */
function findNextPrime(state: SieveState): number | null {
  const sqrtLimit = Math.floor(Math.sqrt(state.limit));
  
  for (const num of state.numbers) {
    if (num.value > sqrtLimit) break;
    if (num.isPrime && !num.isEliminated && num.value > state.currentPrime) {
      return num.value;
    }
  }
  
  return null;
}

/**
 * 특정 숫자의 배수 반환 (자기 자신 제외)
 */
export function getMultiples(prime: number, limit: number): number[] {
  const multiples: number[] = [];
  // prime * prime부터 시작 (그 이전 배수들은 이미 제거됨)
  for (let i = prime * prime; i <= limit; i += prime) {
    multiples.push(i);
  }
  return multiples;
}

/**
 * 다음 단계 진행 (다음 소수의 배수 제거)
 */
export function advanceStep(state: SieveState): SieveState {
  if (state.isComplete) return state;
  
  const nextPrime = findNextPrime(state);
  
  // 더 이상 처리할 소수가 없음
  if (nextPrime === null) {
    // 남은 모든 소수 수집
    const allPrimes = state.numbers
      .filter(n => n.isPrime && !n.isEliminated)
      .map(n => n.value);
    
    return {
      ...state,
      isComplete: true,
      highlightedNumbers: [],
      foundPrimes: allPrimes,
    };
  }
  
  const multiples = getMultiples(nextPrime, state.limit);
  
  const newNumbers = state.numbers.map(num => {
    if (multiples.includes(num.value) && num.isPrime) {
      return {
        ...num,
        isPrime: false,
        isEliminated: true,
        eliminatedBy: nextPrime,
      };
    }
    return num;
  });
  
  const newFoundPrimes = [...state.foundPrimes, nextPrime];
  
  return {
    ...state,
    numbers: newNumbers,
    currentPrime: nextPrime,
    currentStep: state.currentStep + 1,
    highlightedNumbers: multiples,
    foundPrimes: newFoundPrimes,
  };
}

/**
 * 모든 단계 완료
 */
export function completeAll(state: SieveState): SieveState {
  let currentState = state;
  while (!currentState.isComplete) {
    currentState = advanceStep(currentState);
  }
  return {
    ...currentState,
    highlightedNumbers: [],
  };
}

/**
 * 소수 개수 반환
 */
export function countPrimes(state: SieveState): number {
  return state.numbers.filter(n => n.isPrime && !n.isEliminated).length;
}

/**
 * 소수 목록 반환
 */
export function getPrimeNumbers(state: SieveState): number[] {
  return state.numbers
    .filter(n => n.isPrime && !n.isEliminated)
    .map(n => n.value);
}

/**
 * 해설 텍스트
 */
export const EXPLANATION = `
## 🎯 에라토스테네스의 체란?

고대 그리스의 수학자 **에라토스테네스**가 발명한 소수 찾기 알고리즘입니다.

### 📝 알고리즘 원리

1. **2부터 N까지** 모든 자연수를 나열합니다
2. **가장 작은 소수(2)**를 찾아 원으로 표시합니다
3. 그 소수의 **모든 배수**를 지웁니다 (2×2=4, 2×3=6, ...)
4. 다음 지워지지 않은 수를 찾아 **2-3번을 반복**합니다
5. **√N까지만** 반복하면 됩니다!

### 💡 왜 √N까지만?

N보다 작은 합성수(소수가 아닌 수)는 반드시 **√N 이하의 약수**를 가집니다.

예를 들어, 100의 경우:
- √100 = 10
- 100 이하의 합성수는 모두 10 이하의 소수(2, 3, 5, 7)로 나누어 떨어집니다
- 따라서 10까지만 확인하면 충분!

### ⚡ 시간 복잡도

**O(N log log N)** - 매우 효율적인 알고리즘입니다!

각 소수 p에 대해 N/p개의 배수를 지우므로:
- N/2 + N/3 + N/5 + N/7 + ... ≈ N × log(log N)

### 🧮 소수의 개수 (소수 정리)

N까지의 소수 개수는 약 **N / ln(N)** 개입니다.

| 범위 | 소수 개수 | 예측값 |
|------|----------|--------|
| 100 | 25 | ~22 |
| 1000 | 168 | ~145 |
`;

/**
 * 범위별 예상 소수 개수 (참고용)
 */
export function getExpectedPrimeCount(n: number): number {
  if (n < 2) return 0;
  // 소수 정리: π(n) ≈ n / ln(n)
  return Math.round(n / Math.log(n));
}
