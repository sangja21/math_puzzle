// 적분 — 잘게 쪼갤수록 정확해진다 단원 보조 로직

import { type Fn } from './calculus';

// ─── 면적 측량 미션 (게임) ───────────────────────
export interface AreaMission {
  id: string;
  name: string;
  emoji: string;
  scene: string;
  /** 곡선 f(x) ≥ 0, x ∈ [0, 8] */
  f: Fn;
  /** 정확한 면적 (닫힌 형태) */
  exact: number;
  /** 정답 풀이 한 줄 */
  exactNote: string;
  /** y 표시 범위 */
  yMax: number;
  /** 추정 슬라이더 */
  guessMin: number;
  guessMax: number;
  guessStep: number;
}

export const AX_MIN = 0;
export const AX_MAX = 8;

export const AREA_MISSIONS: readonly AreaMission[] = [
  {
    id: 'triangle',
    name: '비탈길 잔디밭',
    emoji: '⛳',
    scene: '직선 비탈 아래 잔디밭 — 사실 삼각형이라 정답을 알 수 있어요. 직사각형들이 정말 그 값으로 다가갈까요?',
    f: (x) => x / 2,
    exact: 16,
    exactNote: '삼각형이니까 8 × 4 ÷ 2 = 16 — 직사각형 합도 정확히 16으로!',
    yMax: 4.6,
    guessMin: 4,
    guessMax: 30,
    guessStep: 0.5,
  },
  {
    id: 'parabola',
    name: '포물선 언덕',
    emoji: '🏛️',
    scene: '아르키메데스가 BC 250년에 측량한 바로 그 모양 — 포물선 아래 면적!',
    f: (x) => 4 - ((x - 4) * (x - 4)) / 4,
    exact: 64 / 3,
    exactNote: '아르키메데스의 정리: 내접 삼각형(8×4÷2=16)의 4/3 배 = 21.33',
    yMax: 4.6,
    guessMin: 8,
    guessMax: 32,
    guessStep: 0.5,
  },
  {
    id: 'wave',
    name: '출렁이는 호수',
    emoji: '🌊',
    scene: '물결치는 수면 아래 면적은? 출렁임에 속지 마세요!',
    f: (x) => 2 + Math.sin((Math.PI * x) / 2),
    exact: 16,
    exactNote: '물결의 봉우리와 골짜기가 정확히 상쇄 — 평평한 높이 2와 똑같은 16!',
    yMax: 3.4,
    guessMin: 6,
    guessMax: 28,
    guessStep: 0.5,
  },
];

/** 분할 수 단계 */
export const N_STEPS = [1, 2, 4, 8, 16, 32, 64, 128] as const;

/** 중점 직사각형 합 */
export function midpointSum(mission: AreaMission, n: number): number {
  const w = (AX_MAX - AX_MIN) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += mission.f(AX_MIN + (i + 0.5) * w) * w;
  }
  return sum;
}

/** 추정 오차율(%) */
export function areaErrorPct(mission: AreaMission, guess: number): number {
  return (Math.abs(guess - mission.exact) / mission.exact) * 100;
}

/** 오차율 → 별 0~3 (≤5% ⭐3, ≤12% ⭐2, ≤25% ⭐1) */
export function areaStars(mission: AreaMission, guess: number): number {
  const err = areaErrorPct(mission, guess);
  if (err <= 5) return 3;
  if (err <= 12) return 2;
  if (err <= 25) return 1;
  return 0;
}

// ─── 아르키메데스 실진법 (원리 탭 §3) ────────────
export interface ArchTriangle {
  /** 꼭짓점 3개 (x, y) */
  pts: [number, number][];
  stage: number;
}

/**
 * 포물선 언덕(미션 2와 동일 곡선) 안에 내접 삼각형을 단계별 생성.
 * stage 0 = 큰 삼각형 1개, stage k = 2^k 개 추가.
 */
export function archTriangles(maxStage: number): ArchTriangle[] {
  const f = AREA_MISSIONS[1].f;
  const out: ArchTriangle[] = [];
  // 각 단계의 구간 목록 — stage 0 은 [0, 8]
  let intervals: [number, number][] = [[AX_MIN, AX_MAX]];
  for (let stage = 0; stage <= maxStage; stage++) {
    const next: [number, number][] = [];
    for (const [a, b] of intervals) {
      const m = (a + b) / 2;
      out.push({
        pts: [
          [a, f(a)],
          [m, f(m)],
          [b, f(b)],
        ],
        stage,
      });
      next.push([a, m], [m, b]);
    }
    intervals = next;
  }
  return out;
}

/** 단계까지의 누적 삼각형 넓이 — T·(1 + 1/4 + … + (1/4)^k) */
export function archSum(maxStage: number): number {
  const T = 16; // 내접 큰 삼각형
  let sum = 0;
  for (let k = 0; k <= maxStage; k++) sum += T * Math.pow(0.25, k);
  return sum;
}
