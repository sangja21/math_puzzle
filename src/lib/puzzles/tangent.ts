// 탄젠트함수 — 탈레스와 피라미드의 비밀 단원 보조 로직

const DEG = Math.PI / 180;

// ─── 특수각 tan 값 ───────────────────────────────
export const SPECIAL_TAN = [
  { deg: 0, tan: 0, label: '0' },
  { deg: 30, tan: Math.tan(30 * DEG), label: '√3 / 3 ≈ 0.577' },
  { deg: 45, tan: 1, label: '1' },
  { deg: 60, tan: Math.sqrt(3), label: '√3 ≈ 1.732' },
  { deg: 80, tan: Math.tan(80 * DEG), label: '≈ 5.671' },
] as const;

/** 경사도(%) = tan θ × 100 */
export function slopePercent(deg: number): number {
  return Math.tan(deg * DEG) * 100;
}

/** 경사도(%) → 각도 */
export function slopeToDeg(pct: number): number {
  return Math.atan(pct / 100) / DEG;
}

// ─── 경사 안전 기준 카드 ─────────────────────────
export interface SlopeStandard {
  emoji: string;
  name: string;
  maxPct: number;
  desc: string;
}

export const SLOPE_STANDARDS: readonly SlopeStandard[] = [
  { emoji: '♿', name: '휠체어 경사로', maxPct: 5, desc: '법정 기준 1/12 ≈ 8.3%, 권장은 5% 이하' },
  { emoji: '🛣️', name: '고속도로', maxPct: 8, desc: '오르막 차로가 생기는 한계 경사' },
  { emoji: '🚂', name: '산악 열차', maxPct: 48, desc: '스위스 필라투스 철도 — 세계에서 가장 가파른 톱니바퀴 열차' },
  { emoji: '🎢', name: '롤러코스터', maxPct: 100, desc: '45° (tan 45° = 1) 를 넘어 수직 낙하까지!' },
];

// ─── 탈레스 비례 ─────────────────────────────────
/** 내 키·내 그림자·목표 그림자 → 목표 높이 (닮음 비례) */
export function thalesHeight(myH: number, myShadow: number, targetShadow: number): number {
  return (myH / myShadow) * targetShadow;
}

/** 높이/그림자 비 → 태양 고도각 (도) */
export function sunAltitudeDeg(myH: number, myShadow: number): number {
  return Math.atan2(myH, myShadow) / DEG;
}

// ─── 그림자 측량 미션 ────────────────────────────
export interface ShadowMission {
  id: string;
  name: string;
  emoji: string;
  scene: string;
  /** 관찰자 — 키는 모든 미션 공통 1.6m */
  myShadow: number;
  /** 목표 그림자 길이 (m) */
  targetShadow: number;
  /** 목표 실제 높이 (m) = thalesHeight 로 일치 */
  height: number;
  /** 줄자 슬라이더 스텝 (m) */
  tapeStep: number;
  /** 높이 추정 슬라이더 */
  guessMin: number;
  guessMax: number;
  guessStep: number;
  /** 비고 (장면 하단 한 줄) */
  note?: string;
}

export const MY_HEIGHT = 1.6;

export const SHADOW_MISSIONS: readonly ShadowMission[] = [
  {
    id: 'tree',
    name: '마당의 큰 나무',
    emoji: '🌳',
    scene: '사다리 없이 나무의 키를 재 보자 — 그림자만 있으면 돼!',
    myShadow: 3.2,
    targetShadow: 16,
    height: 8,
    tapeStep: 0.5,
    guessMin: 1,
    guessMax: 20,
    guessStep: 0.5,
  },
  {
    id: 'flag',
    name: '학교 국기게양대',
    emoji: '🇰🇷',
    scene: '아무도 모르는 게양대의 높이, 오늘 밝혀진다.',
    myShadow: 2.4,
    targetShadow: 18,
    height: 12,
    tapeStep: 0.5,
    guessMin: 1,
    guessMax: 25,
    guessStep: 0.5,
  },
  {
    id: 'obelisk',
    name: '룩소르 오벨리스크',
    emoji: '🗿',
    scene: '이집트의 거대 돌기둥 — 탈레스가 살던 시대로 출발!',
    myShadow: 1.6,
    targetShadow: 20,
    height: 20,
    tapeStep: 0.5,
    guessMin: 5,
    guessMax: 40,
    guessStep: 1,
    note: '내 그림자와 키가 같은 시각 — 그림자 길이가 곧 높이!',
  },
  {
    id: 'pyramid',
    name: '쿠푸 대피라미드',
    emoji: '🔺',
    scene: '책 속 바로 그 장면 — 탈레스가 파라오 앞에서 피라미드를 측량한다!',
    myShadow: 2.4,
    targetShadow: 219,
    height: 146,
    tapeStep: 1,
    guessMin: 50,
    guessMax: 300,
    guessStep: 1,
    note: '피라미드 그림자는 한가운데(중심)부터 재요.',
  },
];

/** 추정 오차율(%) */
export function shadowErrorPct(mission: ShadowMission, guess: number): number {
  return (Math.abs(guess - mission.height) / mission.height) * 100;
}

/** 오차율 → 별 0~3 (≤5% ⭐3, ≤10% ⭐2, ≤20% ⭐1) */
export function shadowStars(mission: ShadowMission, guess: number): number {
  const err = shadowErrorPct(mission, guess);
  if (err <= 5) return 3;
  if (err <= 10) return 2;
  if (err <= 20) return 1;
  return 0;
}

export function fmtM(v: number): string {
  return `${v % 1 === 0 ? v : v.toFixed(1)}m`;
}
