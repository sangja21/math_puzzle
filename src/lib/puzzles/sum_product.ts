/**
 * Mr.P(Product)와 Mr.S(Sum) 퍼즐 (The Impossible Puzzle) 로직
 * 
 * 문제 정의:
 * 1. P와 S에게 2보다 크거나 같은 두 정수 x, y (x <= y)가 있다.
 * 2. P에게는 곱(x*y), S에게는 합(x+y)을 알려준다.
 * 3. 대화:
 *    - P: "나는 두 수를 모릅니다." (Step 1)
 *    - S: "당신이 모른다는 것을 나는 이미 알고 있었습니다." (Step 2)
 *    - P: "이제 두 수를 알겠습니다." (Step 3)
 *    - S: "나도 이제 두 수를 알겠습니다." (Step 4)
 */

export interface Candidate {
  x: number;
  y: number;
  s: number;
  p: number;
  // 유니크 키 생성용
  id: string;
}

export const DEFAULT_MAX_NUM = 20;
export const MAX_RANGE_LIMIT = 20;
export const MIN_RANGE_LIMIT = 5;

/**
 * 초기 후보군 생성 (2 <= x <= y <= max)
 */
export function generateCandidates(maxNum: number): Candidate[] {
  // 범위 제한 적용 (방어적 프로그래밍)
  const safeMax = Math.min(Math.max(maxNum, MIN_RANGE_LIMIT), MAX_RANGE_LIMIT);
  const candidates: Candidate[] = [];
  for (let x = 2; x <= safeMax; x++) {
    for (let y = x; y <= safeMax; y++) {
      candidates.push({
        x,
        y,
        s: x + y,
        p: x * y,
        id: `${x}-${y}`
      });
    }
  }
  return candidates;
}

/**
 * Step 1: P가 "모르겠다"고 함.
 * 의미: 주어진 곱 P를 만드는 (x, y) 쌍이 유일하지 않음.
 * 필터링: 곱 P의 빈도가 2 이상인 후보만 생존.
 */
export function applyStep1(candidates: Candidate[]): Candidate[] {
  const productCounts = new Map<number, number>();
  
  // 곱 빈도 계산
  candidates.forEach(c => {
    productCounts.set(c.p, (productCounts.get(c.p) || 0) + 1);
  });

  // 유일한 곱을 가진 후보 제거 (P가 바로 알았을 것이므로)
  return candidates.filter(c => (productCounts.get(c.p) || 0) > 1);
}

/**
 * Step 2: S가 "P가 모른다는 걸 이미 알고 있었다"고 함.
 * 의미: S가 가진 합 S를 만드는 *모든* (x, y) 분할이 Step 1의 조건(P가 모름)을 만족해야 함.
 * 필터링: 합 S의 분할 중 하나라도 Step 1에서 제거된(=P가 알 수 있는) 경우가 있다면, 그 S는 불가능.
 */
export function applyStep2(allCandidates: Candidate[], step1Candidates: Candidate[]): Candidate[] {
  // Step 1에서 살아남은 후보들의 집합
  const step1Ids = new Set(step1Candidates.map(c => c.id));
  
  // "위험한 합" 식별
  // 전체 후보군 중에서 Step 1을 통과하지 못한(=P가 알 수 있는) 녀석들을 찾음
  const dangerousSums = new Set<number>();
  allCandidates.forEach(c => {
    if (!step1Ids.has(c.id)) {
      dangerousSums.add(c.s);
    }
  });

  // 위험한 합을 가진 후보들을 Step 1 결과에서 제거
  return step1Candidates.filter(c => !dangerousSums.has(c.s));
}

/**
 * Step 3: P가 "이제 알겠다"고 함.
 * 의미: P가 가진 곱 P를 만드는 후보들 중, Step 2까지 살아남은 후보가 '오직 하나'여야 함.
 */
export function applyStep3(step2Candidates: Candidate[]): Candidate[] {
  const productCounts = new Map<number, number>();
  
  step2Candidates.forEach(c => {
    productCounts.set(c.p, (productCounts.get(c.p) || 0) + 1);
  });

  return step2Candidates.filter(c => productCounts.get(c.p) === 1);
}

/**
 * Step 4: S가 "나도 이제 알겠다"고 함.
 * 의미: S가 가진 합 S를 만드는 후보들 중, Step 3까지 살아남은 후보가 '오직 하나'여야 함.
 */
export function applyStep4(step3Candidates: Candidate[]): Candidate[] {
  const sumCounts = new Map<number, number>();
  
  step3Candidates.forEach(c => {
    sumCounts.set(c.s, (sumCounts.get(c.s) || 0) + 1);
  });

  return step3Candidates.filter(c => sumCounts.get(c.s) === 1);
}

/**
 * 모든 단계 실행 헬퍼
 */
export interface SolutionSteps {
  initial: Candidate[];
  step1: Candidate[];
  step2: Candidate[];
  step3: Candidate[];
  step4: Candidate[];
}

export function solvePuzzle(maxNum: number): SolutionSteps {
  // 범위 제한은 generateCandidates 내부에서도 적용되지만, 명시적으로 한 번 더 체크
  const safeMax = Math.min(Math.max(maxNum, MIN_RANGE_LIMIT), MAX_RANGE_LIMIT);
  const initial = generateCandidates(safeMax);
  const step1 = applyStep1(initial);
  const step2 = applyStep2(initial, step1); // 주의: 전체 후보군 정보가 필요함
  const step3 = applyStep3(step2);
  const step4 = applyStep4(step3);

  return { initial, step1, step2, step3, step4 };
}
