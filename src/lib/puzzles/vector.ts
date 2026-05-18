// 벡터 — 심술궂은 제트기류 단원 보조 로직

export interface Vec2 {
  x: number;
  y: number;
}

export const vec = (x: number, y: number): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v: Vec2, k: number): Vec2 => ({ x: v.x * k, y: v.y * k });
export const mag = (v: Vec2): number => Math.hypot(v.x, v.y);

// 각도 — 도(°) 단위, 양의 x축이 0°, 반시계로 증가
export const angleDeg = (v: Vec2): number => {
  const rad = Math.atan2(v.y, v.x);
  return (rad * 180) / Math.PI;
};

export const fromPolarDeg = (magnitude: number, angle: number): Vec2 => {
  const rad = (angle * Math.PI) / 180;
  return { x: magnitude * Math.cos(rad), y: magnitude * Math.sin(rad) };
};

// 두 점 사이 거리
export const distance = (a: Vec2, b: Vec2): number => mag(sub(b, a));

// 벡터를 (x성분, y성분) 으로 분해 — 이미 (x,y) 이므로 직관 시각화용 헬퍼
export const decompose = (v: Vec2): { x: Vec2; y: Vec2 } => ({
  x: { x: v.x, y: 0 },
  y: { x: 0, y: v.y },
});

// ─── 비행기 항로 시뮬레이션 ───────────────────────────────

export interface JetStage {
  id: number;
  name: string;
  /** 출발지 */
  start: Vec2;
  /** 목적지 */
  goal: Vec2;
  /** 제트기류 벡터 (속도) */
  wind: Vec2;
  /** 비행기 자체 속력 (조절 X — 방향만 조절) */
  planeSpeed: number;
  /** 시뮬 총 시간 단위 */
  duration: number;
  /** 도착 판정 허용 반경 */
  tolerance: number;
  hint: string;
}

// 좌표는 격자 단위. 시각화 범위 [-10, 10] x [-10, 10] 가정
export const JET_STAGES: JetStage[] = [
  {
    id: 1,
    name: '훈련 비행 — 옆바람',
    start: { x: -8, y: 0 },
    goal: { x: 8, y: 0 },
    // 살짝 북쪽으로 미는 바람
    wind: { x: 0, y: 0.8 },
    planeSpeed: 3.2,
    duration: 5,
    tolerance: 1.2,
    hint: '바람이 위쪽으로 미니까, 비행기 방향을 살짝 아래쪽으로 향해야 똑바로 가요.',
  },
  {
    id: 2,
    name: '제트기류 — 강한 옆바람',
    start: { x: -8, y: -4 },
    goal: { x: 8, y: 4 },
    wind: { x: 0, y: -1.6 },
    planeSpeed: 3.5,
    duration: 5,
    tolerance: 1.2,
    hint: '아래로 미는 바람이 강해요. 더 위쪽을 향해야 합니다.',
  },
  {
    id: 3,
    name: '맞바람 + 옆바람',
    start: { x: -7, y: -6 },
    goal: { x: 7, y: 6 },
    wind: { x: -1.2, y: -1.2 },
    planeSpeed: 3.6,
    duration: 6,
    tolerance: 1.2,
    hint: '바람이 비스듬히 막아요. 비행기 방향을 바람 반대쪽으로 더 기울이세요.',
  },
  {
    id: 4,
    name: '난기류 — 강한 측풍',
    start: { x: 6, y: -8 },
    goal: { x: -6, y: 8 },
    wind: { x: 1.8, y: 0.6 },
    planeSpeed: 3.8,
    duration: 6,
    tolerance: 1.2,
    hint: '바람이 오른쪽 위로 강하게 밀어요. 왼쪽 아래로 보정.',
  },
];

/**
 * 비행기 + 바람 합성으로 t 시점 위치 계산.
 * resultVel = planeVel + wind, 위치 = start + resultVel * t
 */
export function flightPosition(
  start: Vec2,
  planeVel: Vec2,
  wind: Vec2,
  t: number,
): Vec2 {
  const v = add(planeVel, wind);
  return add(start, scale(v, t));
}

/** 시뮬 전체 시간 동안의 궤적 샘플 — duration 을 step 으로 나눈 점들 */
export function flightTrajectory(
  stage: JetStage,
  planeHeadingDeg: number,
  steps = 60,
): Vec2[] {
  const planeVel = fromPolarDeg(stage.planeSpeed, planeHeadingDeg);
  const out: Vec2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * stage.duration;
    out.push(flightPosition(stage.start, planeVel, stage.wind, t));
  }
  return out;
}

/** 도착 판정 — 마지막 위치가 목표 반경 안인지 */
export function isArrived(stage: JetStage, planeHeadingDeg: number): boolean {
  const traj = flightTrajectory(stage, planeHeadingDeg, 1);
  const end = traj[traj.length - 1];
  return distance(end, stage.goal) <= stage.tolerance;
}

/** 이상적인 비행기 헤딩(º) — 비행기 속도 V_p, 바람 W 일 때 결과 벡터가 (goal-start) 방향을 향하도록 */
export function idealHeadingDeg(stage: JetStage): number | null {
  // 결과방향 단위벡터 = d, 바람 = w, 비행기속력 = s 라 하면
  // s * (cosθ, sinθ) + w = k * d (k>0). θ 풀이.
  const d = sub(stage.goal, stage.start);
  const dLen = mag(d);
  if (dLen < 1e-6) return null;
  const dx = d.x / dLen;
  const dy = d.y / dLen;
  const w = stage.wind;
  const s = stage.planeSpeed;
  // (s cosθ + w.x) / (s sinθ + w.y) = dx/dy 같은 식으로 풀기보다,
  // d 방향에 수직인 성분을 비행기로 상쇄해야 한다는 조건을 이용:
  // 비행기의 수직성분 = -바람의 수직성분
  // 수직단위벡터 n = (-dy, dx)
  const wPerp = w.x * -dy + w.y * dx;
  // s * sin(α) = -wPerp, α = θ - 진행각
  const sinA = -wPerp / s;
  if (Math.abs(sinA) > 1) return null; // 바람이 너무 강해 보정 불가
  const alpha = Math.asin(sinA);
  const baseAngle = Math.atan2(dy, dx);
  return ((baseAngle + alpha) * 180) / Math.PI;
}
