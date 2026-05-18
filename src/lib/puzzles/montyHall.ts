export type Strategy = 'stay' | 'switch';

export interface RoundState {
  carDoor: 0 | 1 | 2;
  firstPick: 0 | 1 | 2;
  hostOpens: 0 | 1 | 2;
  switchTarget: 0 | 1 | 2;
}

type DoorIdx = 0 | 1 | 2;

function pickDoor(rng: () => number): DoorIdx {
  return Math.floor(rng() * 3) as DoorIdx;
}

// rng 가 [0,1) 외 값을 주는 비정상 케이스를 막기 위한 클램프
function safeIndex(value: number, max: number): number {
  if (value < 0) return 0;
  if (value >= max) return max - 1;
  return value;
}

function chooseHostDoor(carDoor: DoorIdx, firstPick: DoorIdx, rng: () => number): DoorIdx {
  const candidates: DoorIdx[] = [];
  for (let i = 0 as DoorIdx; i < 3; i = (i + 1) as DoorIdx) {
    if (i !== carDoor && i !== firstPick) candidates.push(i);
  }
  const idx = safeIndex(Math.floor(rng() * candidates.length), candidates.length);
  return candidates[idx];
}

function chooseSwitchTarget(firstPick: DoorIdx, hostOpens: DoorIdx): DoorIdx {
  for (let i = 0 as DoorIdx; i < 3; i = (i + 1) as DoorIdx) {
    if (i !== firstPick && i !== hostOpens) return i;
  }
  // 도달 불가: firstPick != hostOpens 보장됨
  return 0;
}

export function playRound(firstPick: DoorIdx, rng: () => number = Math.random): RoundState {
  const carDoor = pickDoor(rng);
  const hostOpens = chooseHostDoor(carDoor, firstPick, rng);
  const switchTarget = chooseSwitchTarget(firstPick, hostOpens);
  return { carDoor, firstPick, hostOpens, switchTarget };
}

export function simulateOne(strategy: Strategy, rng: () => number = Math.random): boolean {
  const firstPick = pickDoor(rng);
  const round = playRound(firstPick, rng);
  const finalPick = strategy === 'switch' ? round.switchTarget : round.firstPick;
  return finalPick === round.carDoor;
}

export function simulateMany(
  strategy: Strategy,
  n: number,
  rng: () => number = Math.random,
): { wins: number; total: number; rate: number } {
  let wins = 0;
  for (let i = 0; i < n; i++) {
    if (simulateOne(strategy, rng)) wins++;
  }
  return { wins, total: n, rate: n === 0 ? 0 : wins / n };
}

export function simulateBoth(
  n: number,
  rng: () => number = Math.random,
): {
  stay: { wins: number; total: number; rate: number };
  switch: { wins: number; total: number; rate: number };
} {
  return {
    stay: simulateMany('stay', n, rng),
    switch: simulateMany('switch', n, rng),
  };
}
