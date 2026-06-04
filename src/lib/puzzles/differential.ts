// 미분 — 롤러코스터의 속도 단원 보조 로직

import { type Fn, numericDerivative, findExtrema, type Extremum } from './calculus';

// ─── 롤러코스터 트랙 (게임) ──────────────────────
export type RoundKind = 'steepest' | 'extrema';

export interface CoasterRound {
  id: string;
  name: string;
  emoji: string;
  /** 미션 한 줄 설명 */
  task: string;
  kind: RoundKind;
  /** 트랙 높이 함수 h(x), x ∈ [0, 10] */
  h: Fn;
  /** 트랙 y 표시 범위 */
  yMax: number;
}

export const X_MIN = 0;
export const X_MAX = 10;

export const COASTER_ROUNDS: readonly CoasterRound[] = [
  {
    id: 'first-drop',
    name: '첫 활강',
    emoji: '🎢',
    task: '가장 가파르게 내려가는 지점에 마커를 세우세요!',
    kind: 'steepest',
    h: (x) => 2.2 + 1.8 * Math.cos((Math.PI * x) / 10),
    yMax: 4.6,
  },
  {
    id: 'hills',
    name: '봉우리와 골짜기',
    emoji: '🏔️',
    task: '기울기가 0이 되는 곳 — 봉우리·골짜기 3곳을 모두 찾으세요!',
    kind: 'extrema',
    h: (x) => 2.2 + 1.1 * Math.sin(1.05 * x),
    yMax: 4.2,
  },
  {
    id: 'grand-finale',
    name: '그랜드 피날레',
    emoji: '🏁',
    task: '트랙 전체에서 가장 가파른 활강 지점은 단 한 곳 — 찾아내세요!',
    kind: 'steepest',
    h: (x) => 3.4 + 1.2 * Math.sin(0.8 * x) - 0.15 * x,
    yMax: 5.2,
  },
];

/** 트랙의 기울기 h'(x) */
export function trackSlope(round: CoasterRound, x: number): number {
  return numericDerivative(round.h, x);
}

/** 가장 가파른 하강 지점 (h' 최소) — 수치 스캔 */
export function steepestX(round: CoasterRound): number {
  let best = X_MIN;
  let bestD = Infinity;
  const n = 2000;
  for (let i = 0; i <= n; i++) {
    const x = X_MIN + ((X_MAX - X_MIN) * i) / n;
    const d = numericDerivative(round.h, x);
    if (d < bestD) {
      bestD = d;
      best = x;
    }
  }
  return best;
}

/** 트랙의 극값 목록 */
export function trackExtrema(round: CoasterRound): Extremum[] {
  return findExtrema(round.h, X_MIN, X_MAX);
}

/** 지점 추측 → 별 0~3 (x 오차 기준) */
export function starsForSpot(guessX: number, answerX: number): number {
  const err = Math.abs(guessX - answerX);
  if (err <= 0.35) return 3;
  if (err <= 0.8) return 2;
  if (err <= 1.5) return 1;
  return 0;
}

/** 극값 잡기 판정 — 허용 오차 내면 해당 극값 인덱스, 아니면 -1 */
export function hitExtremum(extrema: Extremum[], x: number, tol = 0.35): number {
  let best = -1;
  let bestErr = tol;
  extrema.forEach((e, i) => {
    const err = Math.abs(e.x - x);
    if (err <= bestErr) {
      bestErr = err;
      best = i;
    }
  });
  return best;
}

// ─── 원리 탭 — 거리·시간 예제 ────────────────────
/** § 1·2 — 자전거 주행: s(t) = t² (t시간 동안 간 거리 km) */
export const rideDistance: Fn = (t) => t * t;
