// 포탄쏘기 게임 — 물리·충돌·레벨 데이터

export const G = 9.8;

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number; // 좌하단 x (m)
  y: number; // 좌하단 y (m)
  w: number; // 폭 (m)
  h: number; // 높이 (m)
}

// 시간 t에서의 포탄 위치 (실세계 m)
export function trajectoryAt(
  angleDeg: number,
  speed: number,
  t: number,
  originX: number = 0,
): Vec2 {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: originX + speed * Math.cos(rad) * t,
    y: speed * Math.sin(rad) * t - 0.5 * G * t * t,
  };
}

// 궤적 샘플 (지면에 닿거나 maxT 도달 시 종료)
export function trajectorySamples(
  angleDeg: number,
  speed: number,
  options: {
    dt?: number;
    maxT?: number;
    minY?: number;
    originX?: number;
  } = {},
): Vec2[] {
  const dt = options.dt ?? 0.04;
  const maxT = options.maxT ?? 6;
  const minY = options.minY ?? -0.5;
  const originX = options.originX ?? 0;
  const samples: Vec2[] = [];
  for (let t = 0; t <= maxT; t += dt) {
    const p = trajectoryAt(angleDeg, speed, t, originX);
    samples.push(p);
    if (p.y < minY) break;
  }
  return samples;
}

// 점이 사각형 안인가
export function pointInRect(p: Vec2, r: Rect): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

// 궤적이 사각형과 교차하는가 (선분-사각형 근사: 끝점이 사각형 안이면 교차)
export function pathIntersectsRect(path: Vec2[], r: Rect): boolean {
  for (const p of path) {
    if (pointInRect(p, r)) return true;
  }
  return false;
}

// 레벨 결과 판정 — 궤적과 표적·장애물·지면 우선순위
export function checkPath(
  path: Vec2[],
  target: Rect,
  obstacles: Rect[] | undefined,
): 'hit' | 'miss-obstacle' | 'miss' {
  // 시간 순 traversal — 어느 사건이 먼저 발생하는지가 중요
  for (const p of path) {
    if (obstacles) {
      for (const o of obstacles) {
        if (pointInRect(p, o)) return 'miss-obstacle';
      }
    }
    if (pointInRect(p, target)) return 'hit';
    if (p.y < 0) return 'miss';
  }
  return 'miss';
}

// 꼭짓점 좌표 (학습 안내용)
export function trajectoryVertex(angleDeg: number, speed: number): Vec2 {
  const rad = (angleDeg * Math.PI) / 180;
  // 최고점에 도달하는 시간 t* = v sin θ / g
  const tStar = (speed * Math.sin(rad)) / G;
  return trajectoryAt(angleDeg, speed, Math.max(0, tStar));
}

// 사거리 (지면에서 발사·착탄 가정)
export function trajectoryRange(angleDeg: number, speed: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return (speed * speed * Math.sin(2 * rad)) / G;
}

export interface Level {
  id: number;
  name: string;
  hint: string;
  target: Rect;
  obstacles?: Rect[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: '쉬움',
    hint: '발사각 45° 가 보통 가장 멀리 가요.',
    target: { x: 11.5, y: 0, w: 2, h: 1.5 },
  },
  {
    id: 2,
    name: '높이',
    hint: '표적이 공중에 있어요. 각도를 더 높여보세요.',
    target: { x: 15.5, y: 4, w: 2, h: 1.5 },
  },
  {
    id: 3,
    name: '벽 너머',
    hint: '벽에 부딪히지 않게 *높이* 발사하세요.',
    target: { x: 21, y: 0, w: 2, h: 1.5 },
    obstacles: [{ x: 9.5, y: 0, w: 1, h: 7 }],
  },
  {
    id: 4,
    name: '먼 곳',
    hint: '초속을 충분히 올려야 닿을 수 있어요.',
    target: { x: 27, y: 1.5, w: 2, h: 1.5 },
  },
];

// 슬라이더 범위 / 디폴트
export const ANGLE_MIN = 10;
export const ANGLE_MAX = 80;
export const ANGLE_STEP = 1;
export const ANGLE_DEFAULT = 45;
export const SPEED_MIN = 5;
export const SPEED_MAX = 25;
export const SPEED_STEP = 0.5;
export const SPEED_DEFAULT = 15;

// ════════════════════════════════════════════════════════════
// 대결 모드 (Duel) — 체력제, 라운드 제한 없음
// ════════════════════════════════════════════════════════════

export const ENEMY_X = 30; // 적 초기 위치
export const MAX_HP = 100;
export const HIT_DAMAGE = 25;
// 적이 거의 정확해지는 발사 횟수 (이 이후엔 노이즈 0)
export const ENEMY_PRECISION_AT = 4;

// 이동 가능 범위
export const USER_X_MIN = -2;
export const USER_X_MAX = 10;
export const ENEMY_X_MIN = 20;
export const ENEMY_X_MAX = 33;
export const MOVE_STEP = 1; // 사용자 한 번 이동 시 1m
export const ENEMY_MOVE_RANGE = 3; // 적 이동 ±3m 랜덤

// 사용자 / 적 대포 bbox 팩토리 (위치에 따라 동적)
export function userBbox(userX: number): Rect {
  return { x: userX - 0.7, y: 0, w: 1.4, h: 1.2 };
}
export function enemyBbox(enemyX: number): Rect {
  return { x: enemyX - 0.7, y: 0, w: 1.4, h: 1.2 };
}

// 후방 호환 — 옛 USER_BBOX/ENEMY_BBOX 도 유지 (CannonTab 의 TargetMode 가 미사용이지만 import 안전)
export const USER_BBOX: Rect = userBbox(0);
export const ENEMY_BBOX: Rect = enemyBbox(ENEMY_X);

export interface EnemyShot {
  angleDeg: number;
  speed: number;
}

// 적이 발사 — 누적 발사 횟수가 늘수록 정확해짐 + 거리 기반 속도
export function computeEnemyShot(
  shotIndex: number,
  distance: number = ENEMY_X,
): EnemyShot {
  const baseAngle = 45;
  const safeDistance = Math.max(5, Math.min(40, distance));
  const baseSpeed = Math.sqrt(safeDistance * G);
  const noiseScale = Math.max(0, 1 - shotIndex / ENEMY_PRECISION_AT);
  const angleNoise = (Math.random() - 0.5) * 2 * 20 * noiseScale;
  const speedNoise = (Math.random() - 0.5) * 2 * 5 * noiseScale;
  const a = Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, baseAngle + angleNoise));
  const v = Math.max(SPEED_MIN, Math.min(SPEED_MAX, baseSpeed + speedNoise));
  return { angleDeg: a, speed: v };
}

// 매 라운드 새 벽 1~2개 생성
export function generateWalls(userX: number, enemyX: number): Rect[] {
  const minDist = 4;
  const usableMin = userX + minDist;
  const usableMax = enemyX - minDist;
  if (usableMax - usableMin < 2) return [];

  const count = Math.random() < 0.5 ? 1 : 2;
  const walls: Rect[] = [];
  if (count === 1) {
    const wx = usableMin + Math.random() * (usableMax - usableMin);
    const wh = 2 + Math.random() * 5;
    walls.push({ x: wx - 0.4, y: 0, w: 0.8, h: wh });
  } else {
    const mid = (usableMin + usableMax) / 2;
    if (mid - usableMin > 1.5) {
      const w1x = usableMin + Math.random() * (mid - usableMin - 1);
      walls.push({ x: w1x - 0.4, y: 0, w: 0.8, h: 2 + Math.random() * 5 });
    }
    if (usableMax - mid > 1.5) {
      const w2x = mid + 1 + Math.random() * (usableMax - mid - 1);
      walls.push({ x: w2x - 0.4, y: 0, w: 0.8, h: 2 + Math.random() * 5 });
    }
  }
  return walls;
}

// 적 랜덤 이동
export function randomEnemyMove(currentX: number): number {
  const delta = (Math.random() - 0.5) * 2 * ENEMY_MOVE_RANGE;
  return Math.max(ENEMY_X_MIN, Math.min(ENEMY_X_MAX, currentX + delta));
}

// 적 포탄: 우측에서 좌측으로 (originX 출발, 좌향 발사)
export function enemyTrajectoryAt(
  angleDeg: number,
  speed: number,
  t: number,
  originX: number = ENEMY_X,
): Vec2 {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: originX - speed * Math.cos(rad) * t,
    y: speed * Math.sin(rad) * t - 0.5 * G * t * t,
  };
}

export function enemyTrajectorySamples(
  angleDeg: number,
  speed: number,
  options: {
    dt?: number;
    maxT?: number;
    minY?: number;
    originX?: number;
  } = {},
): Vec2[] {
  const dt = options.dt ?? 0.04;
  const maxT = options.maxT ?? 6;
  const minY = options.minY ?? -0.5;
  const originX = options.originX ?? ENEMY_X;
  const samples: Vec2[] = [];
  for (let t = 0; t <= maxT; t += dt) {
    const p = enemyTrajectoryAt(angleDeg, speed, t, originX);
    samples.push(p);
    if (p.y < minY) break;
  }
  return samples;
}
