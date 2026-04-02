// 이상한 주사위 (Sicherman Dice) 퍼즐 로직

// 정상 주사위
export const NORMAL_DIE = [1, 2, 3, 4, 5, 6];

// 시커만 주사위 (정답)
export const SICHERMAN_A = [1, 2, 2, 3, 3, 4];
export const SICHERMAN_B = [1, 3, 4, 5, 6, 8];

// 정상 주사위 두 개의 합 분포 (2~12)
export function getNormalSumDistribution(): Map<number, number> {
  const dist = new Map<number, number>();
  for (const a of NORMAL_DIE) {
    for (const b of NORMAL_DIE) {
      const sum = a + b;
      dist.set(sum, (dist.get(sum) || 0) + 1);
    }
  }
  return dist;
}

// 임의의 두 주사위의 합 분포
export function getSumDistribution(dieA: number[], dieB: number[]): Map<number, number> {
  const dist = new Map<number, number>();
  for (const a of dieA) {
    for (const b of dieB) {
      const sum = a + b;
      dist.set(sum, (dist.get(sum) || 0) + 1);
    }
  }
  return dist;
}

// 두 분포가 같은지 비교
export function distributionsEqual(
  d1: Map<number, number>,
  d2: Map<number, number>
): boolean {
  if (d1.size !== d2.size) return false;
  for (const [key, val] of d1) {
    if (d2.get(key) !== val) return false;
  }
  return true;
}

// 시커만 주사위 굴리기
export function rollSichermanDice(): { a: number; b: number; sum: number } {
  const a = SICHERMAN_A[Math.floor(Math.random() * 6)];
  const b = SICHERMAN_B[Math.floor(Math.random() * 6)];
  return { a, b, sum: a + b };
}

// 정상 주사위 굴리기
export function rollNormalDice(): { a: number; b: number; sum: number } {
  const a = NORMAL_DIE[Math.floor(Math.random() * 6)];
  const b = NORMAL_DIE[Math.floor(Math.random() * 6)];
  return { a, b, sum: a + b };
}

// 합 분포 표 데이터 (6x6)
export function getSumTable(dieA: number[], dieB: number[]): number[][] {
  return dieA.map((a) => dieB.map((b) => a + b));
}

// 두 배열이 같은지 비교 (정렬된 상태)
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

// 정답 검증: 사용자가 입력한 두 주사위가 정상 주사위와 같은 합 분포를 가지면서
// 일반 주사위(1~6, 1~6)와는 다른 조합인지 확인
export function validateAnswer(userDieA: number[], userDieB: number[]): { valid: boolean; reason: string } {
  if (userDieA.length !== 6 || userDieB.length !== 6) {
    return { valid: false, reason: '각 주사위에 6개의 숫자를 모두 입력해주세요.' };
  }
  if (userDieA.some((n) => n < 1 || !Number.isInteger(n)) || userDieB.some((n) => n < 1 || !Number.isInteger(n))) {
    return { valid: false, reason: '1 이상의 자연수만 입력할 수 있어요.' };
  }

  const sortedA = [...userDieA].sort((a, b) => a - b);
  const sortedB = [...userDieB].sort((a, b) => a - b);
  const normalSorted = [...NORMAL_DIE].sort((a, b) => a - b);

  // 둘 다 일반 주사위면 거부
  if (arraysEqual(sortedA, normalSorted) && arraysEqual(sortedB, normalSorted)) {
    return { valid: false, reason: '그건 일반 주사위잖아요! 😅 1~6이 아닌 다른 눈을 찾아보세요.' };
  }

  const normalDist = getNormalSumDistribution();
  const userDist = getSumDistribution(userDieA, userDieB);

  if (!distributionsEqual(normalDist, userDist)) {
    return { valid: false, reason: '이 주사위의 합 분포는 정상 주사위와 달라요. 다시 생각해보세요!' };
  }

  return { valid: true, reason: '' };
}

// 합 기록 히스토리
export interface RollHistory {
  id: number;
  sum: number;
}

// 합 빈도 계산
export function getFrequencyFromHistory(history: RollHistory[]): Map<number, number> {
  const freq = new Map<number, number>();
  for (let s = 2; s <= 12; s++) freq.set(s, 0);
  for (const roll of history) {
    freq.set(roll.sum, (freq.get(roll.sum) || 0) + 1);
  }
  return freq;
}
