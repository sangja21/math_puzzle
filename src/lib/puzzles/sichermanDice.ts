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

// 정답 검증: 사용자가 입력한 두 주사위가 정상 주사위와 같은 합 분포를 가지는지
export function validateAnswer(userDieA: number[], userDieB: number[]): boolean {
  if (userDieA.length !== 6 || userDieB.length !== 6) return false;
  if (userDieA.some((n) => n < 1) || userDieB.some((n) => n < 1)) return false;

  const normalDist = getNormalSumDistribution();
  const userDist = getSumDistribution(userDieA, userDieB);

  return distributionsEqual(normalDist, userDist);
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
