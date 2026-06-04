// 코사인함수 — 지구에서 달까지의 거리 단원 보조 로직

const DEG = Math.PI / 180;

// ─── 특수각 cos 값 ───────────────────────────────
export const SPECIAL_COS = [
  { deg: 0, cos: 1, label: '1' },
  { deg: 30, cos: Math.sqrt(3) / 2, label: '√3 / 2 ≈ 0.866' },
  { deg: 45, cos: Math.SQRT1_2, label: '√2 / 2 ≈ 0.707' },
  { deg: 60, cos: 0.5, label: '1/2' },
  { deg: 90, cos: 0, label: '0' },
] as const;

// ─── 코사인 법칙 ─────────────────────────────────
/** SAS — 두 변 a, b 와 사잇각 C(도) 로 마주보는 변 c */
export function lawOfCosines(a: number, b: number, gammaDeg: number): number {
  const c2 = a * a + b * b - 2 * a * b * Math.cos(gammaDeg * DEG);
  return Math.sqrt(Math.max(c2, 0));
}

// ─── 삼각측량 ────────────────────────────────────
export interface TriangulationResult {
  /** 관측점 A → 목표 거리 */
  distA: number;
  /** 관측점 B → 목표 거리 */
  distB: number;
  /** 기선에서 목표까지의 수직 거리 */
  height: number;
  /** 목표 꼭짓점의 각 (180 − α − β) */
  apexDeg: number;
}

/**
 * 기선 길이 baseline, 양 끝 관측각 α·β(기선에서 잰 각, 도) 로
 * 목표까지의 거리를 구한다 (사인 법칙 → 거리, 수직 거리는 sin 투영).
 * α + β ≥ 180° 면 시선이 만나지 않으므로 null.
 */
export function triangulate(
  baseline: number,
  alphaDeg: number,
  betaDeg: number,
): TriangulationResult | null {
  const apexDeg = 180 - alphaDeg - betaDeg;
  if (apexDeg <= 0.1) return null;
  const sinApex = Math.sin(apexDeg * DEG);
  const distA = (baseline * Math.sin(betaDeg * DEG)) / sinApex;
  const distB = (baseline * Math.sin(alphaDeg * DEG)) / sinApex;
  const height = distA * Math.sin(alphaDeg * DEG);
  return { distA, distB, height, apexDeg };
}

// ─── 관측 미션 (게임) ────────────────────────────
export interface Mission {
  id: string;
  name: string;
  emoji: string;
  /** 장면 설명 한 줄 */
  scene: string;
  /** 기선 길이 (단위 포함 표기는 unit) */
  baseline: number;
  unit: string;
  /** 목표 위치 — 기선 왼쪽 끝(A)을 원점, 기선 방향이 +x. y > 0 */
  target: { x: number; y: number };
  /** 거리 추정 슬라이더 범위 */
  guessMin: number;
  guessMax: number;
  guessStep: number;
  /** 별 3개 기준 오차율(%) — 그 2배까지 별 2개 */
  starPct: number;
  /** 망원경 조준 슬라이더 — 범위·스텝·허용 오차 (도) */
  aim: { min: number; max: number; step: number; tol: number };
  /** 장면 눈금선 간격 (거리 추정 단계에서 표시) */
  gridEvery: number;
}

export const MISSIONS: readonly Mission[] = [
  {
    id: 'flag',
    name: '운동장의 깃발',
    emoji: '🚩',
    scene: '운동장 건너편 깃발까지 — 줄자 없이 각도만으로!',
    baseline: 40,
    unit: 'm',
    target: { x: 24, y: 50 },
    guessMin: 10,
    guessMax: 120,
    guessStep: 1,
    starPct: 8,
    aim: { min: 0, max: 90, step: 0.5, tol: 0.35 },
    gridEvery: 10,
  },
  {
    id: 'river',
    name: '강 건너 나무',
    emoji: '🌳',
    scene: '다리도 배도 없이 강 건너 나무까지의 거리를 재요.',
    baseline: 60,
    unit: 'm',
    target: { x: 45, y: 110 },
    guessMin: 30,
    guessMax: 300,
    guessStep: 5,
    starPct: 8,
    aim: { min: 0, max: 90, step: 0.5, tol: 0.35 },
    gridEvery: 25,
  },
  {
    id: 'peak',
    name: '먼 산봉우리',
    emoji: '⛰️',
    scene: '마을 양 끝에서 산봉우리를 관측 — 측량사의 실제 작업!',
    baseline: 2,
    unit: 'km',
    target: { x: 1.3, y: 4.2 },
    guessMin: 1,
    guessMax: 10,
    guessStep: 0.1,
    starPct: 6,
    aim: { min: 0, max: 90, step: 0.5, tol: 0.35 },
    gridEvery: 1,
  },
  {
    id: 'moon',
    name: '지구에서 달까지',
    emoji: '🌙',
    scene: '지구 반대편 두 천문대에서 동시에 달을 관측 — 책 속 바로 그 이야기!',
    baseline: 10000,
    unit: 'km',
    target: { x: 5000, y: 380000 },
    guessMin: 100000,
    guessMax: 800000,
    guessStep: 10000,
    starPct: 5,
    aim: { min: 88, max: 90, step: 0.01, tol: 0.012 },
    gridEvery: 100000,
  },
];

/** 관측점에서 목표를 바라본, 기선과 이루는 각 (도) */
export function viewAngle(mission: Mission, point: 'A' | 'B'): number {
  const { target, baseline } = mission;
  if (point === 'A') {
    return Math.atan2(target.y, target.x) / DEG;
  }
  // B 는 기선 오른쪽 끝 — 기선의 −x 방향에서 잰 각
  return Math.atan2(target.y, baseline - target.x) / DEG;
}

/** 목표까지의 실제 수직 거리 (기선 → 목표) */
export function trueDistance(mission: Mission): number {
  return mission.target.y;
}

/** 추정 오차율(%) → 별 0~3 */
export function starsForGuess(mission: Mission, guess: number): number {
  const truth = trueDistance(mission);
  const errPct = (Math.abs(guess - truth) / truth) * 100;
  if (errPct <= mission.starPct) return 3;
  if (errPct <= mission.starPct * 2) return 2;
  if (errPct <= mission.starPct * 4) return 1;
  return 0;
}

export function errorPct(mission: Mission, guess: number): number {
  const truth = trueDistance(mission);
  return (Math.abs(guess - truth) / truth) * 100;
}

/** 천 단위 콤마 + 단위 */
export function fmtDist(v: number, unit: string): string {
  const rounded = v >= 1000 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${rounded.toLocaleString('ko-KR')}${unit}`;
}
