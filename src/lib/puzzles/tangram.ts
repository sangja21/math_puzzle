// 탱그램 로직 — 7조각의 정의, 회전·미러·평행이동 변환, 충돌, 매칭
//
// 좌표계: 큰 정사각형(4×4) 한 변 = 4 단위. y축은 화면 좌표(아래로 증가)이지만
// 면적·매칭 계산은 부호와 무관하므로 그대로 사용한다.

export type PieceId =
  | 'large1'
  | 'large2'
  | 'medium'
  | 'small1'
  | 'small2'
  | 'square'
  | 'parallelogram';

export interface Vec {
  x: number;
  y: number;
}

export interface Piece {
  id: PieceId;
  /** 표준 자세(회전 0°, 위치 (0,0) 기준)에서 꼭짓점들 — 조각의 무게중심을 원점으로 한다. */
  vertices: Vec[];
  color: string;
  /** 평행사변형만 좌우 반전 가능 */
  flippable?: boolean;
}

export type Rotation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

export interface Placement {
  id: PieceId;
  rotation: Rotation;
  /** 평행사변형이면 -1 가능, 나머지는 1 */
  mirror: 1 | -1;
  /** 보드 위 평행이동 (격자 단위) */
  tx: number;
  ty: number;
}

export interface Silhouette {
  id: string;
  name: string;
  emoji: string;
  /** 외곽 꼭짓점 (격자 좌표, 시계 혹은 반시계 일관) */
  outline: Vec[];
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

// ── 4×4 정사각형의 정식 분할 (절대 좌표) ──
// 7조각의 합 = 큰 정사각형. 각 조각을 무게중심 기준으로 옮겨 표준 vertices를 만든다.
const ABSOLUTE: Record<PieceId, Vec[]> = {
  large1: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 2, y: 2 },
  ],
  large2: [
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 2, y: 2 },
  ],
  medium: [
    { x: 0, y: 4 },
    { x: 2, y: 4 },
    { x: 0, y: 2 },
  ],
  small1: [
    { x: 2, y: 4 },
    { x: 4, y: 4 },
    { x: 3, y: 3 },
  ],
  small2: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
  ],
  square: [
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 2, y: 4 },
    { x: 1, y: 3 },
  ],
  parallelogram: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
    { x: 0, y: 2 },
  ],
};

const COLOR: Record<PieceId, string> = {
  large1: '#ef4444',
  large2: '#f59e0b',
  medium: '#10b981',
  small1: '#3b82f6',
  small2: '#a855f7',
  square: '#ec4899',
  parallelogram: '#06b6d4',
};

function centroid(vs: Vec[]): Vec {
  let sx = 0;
  let sy = 0;
  for (const v of vs) {
    sx += v.x;
    sy += v.y;
  }
  return { x: sx / vs.length, y: sy / vs.length };
}

function shoelaceArea(vs: Vec[]): number {
  let sum = 0;
  for (let i = 0; i < vs.length; i++) {
    const a = vs[i];
    const b = vs[(i + 1) % vs.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

function buildPiece(id: PieceId): Piece {
  const abs = ABSOLUTE[id];
  const c = centroid(abs);
  const verts = abs.map((v) => ({ x: v.x - c.x, y: v.y - c.y }));
  return {
    id,
    vertices: verts,
    color: COLOR[id],
    flippable: id === 'parallelogram',
  };
}

export const PIECES: Record<PieceId, Piece> = {
  large1: buildPiece('large1'),
  large2: buildPiece('large2'),
  medium: buildPiece('medium'),
  small1: buildPiece('small1'),
  small2: buildPiece('small2'),
  square: buildPiece('square'),
  parallelogram: buildPiece('parallelogram'),
};

// 부동소수 노이즈를 줄여 회전 4번 = 제자리 보장. 0.0001 단위로 스냅.
function clean(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function transformedVertices(p: Placement): Vec[] {
  const piece = PIECES[p.id];
  const rad = (p.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return piece.vertices.map((v) => {
    const mx = v.x * p.mirror;
    const x = mx * cos - v.y * sin + p.tx;
    const y = mx * sin + v.y * cos + p.ty;
    return { x: clean(x), y: clean(y) };
  });
}

// ─── 다각형 유틸 ───

function pointInPolygon(pt: Vec, poly: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// SAT(분리축 정리)로 두 볼록 다각형 교차 검사. 탱그람 조각은 모두 볼록.
function projectPolygon(poly: Vec[], axis: Vec): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const v of poly) {
    const d = v.x * axis.x + v.y * axis.y;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return [min, max];
}

function getAxes(poly: Vec[]): Vec[] {
  const axes: Vec[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const edge = { x: b.x - a.x, y: b.y - a.y };
    const len = Math.hypot(edge.x, edge.y) || 1;
    axes.push({ x: -edge.y / len, y: edge.x / len });
  }
  return axes;
}

// 면적 교차가 작은 epsilon 이상일 때만 충돌로 본다. 가장자리 접촉(공유 변)은 허용.
const OVERLAP_EPS = 0.05;

export function overlap(a: Placement, b: Placement): boolean {
  const pa = transformedVertices(a);
  const pb = transformedVertices(b);
  const axes = [...getAxes(pa), ...getAxes(pb)];
  let minOverlap = Infinity;
  for (const axis of axes) {
    const [minA, maxA] = projectPolygon(pa, axis);
    const [minB, maxB] = projectPolygon(pb, axis);
    const o = Math.min(maxA, maxB) - Math.max(minA, minB);
    if (o <= 0) return false;
    if (o < minOverlap) minOverlap = o;
  }
  return minOverlap > OVERLAP_EPS;
}

// 조각이 목표 실루엣 안에 들어있는지 — 모든 꼭짓점 + 변의 중점들이 외곽 내부인지로 근사.
// 완벽한 polygon clipping 대신, 변 위에 표본점을 두는 방식.
function pieceInsideTarget(piece: Vec[], target: Vec[]): boolean {
  const tol = 0.15;
  // 외곽을 살짝 부풀려(점이 경계에 정확히 있을 때 통과되도록) point-in-polygon 한 번 + 경계 점 처리.
  for (const v of piece) {
    if (!pointInPolygon(v, target) && !nearBoundary(v, target, tol)) return false;
  }
  // 변 표본 — 변 위에 균등하게 4점.
  for (let i = 0; i < piece.length; i++) {
    const a = piece[i];
    const b = piece[(i + 1) % piece.length];
    for (let t = 0.25; t < 1; t += 0.25) {
      const m = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      if (!pointInPolygon(m, target) && !nearBoundary(m, target, tol)) return false;
    }
  }
  return true;
}

function nearBoundary(pt: Vec, poly: Vec[], tol: number): boolean {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / (len2 || 1)));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    if (Math.hypot(pt.x - px, pt.y - py) < tol) return true;
  }
  return false;
}

export function matchesTarget(
  placements: Placement[],
  target: { vertices: Vec[] },
): boolean {
  if (placements.length !== 7) return false;
  // 1. 조각끼리 겹치지 않을 것
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      if (overlap(placements[i], placements[j])) return false;
    }
  }
  // 2. 모든 조각이 외곽 안에 있을 것
  for (const p of placements) {
    if (!pieceInsideTarget(transformedVertices(p), target.vertices)) return false;
  }
  // 3. 조각 면적 합 = 외곽 면적 (둘 다 16 이지만 안전망)
  const sumPieces = placements.reduce(
    (s, p) => s + shoelaceArea(transformedVertices(p)),
    0,
  );
  const targetArea = shoelaceArea(target.vertices);
  return Math.abs(sumPieces - targetArea) < 0.5;
}

// ── 사전 정의 실루엣 (모두 면적 16) ──
export const SILHOUETTES: readonly Silhouette[] = [
  {
    id: 'square',
    name: '정사각형',
    emoji: '⬛',
    outline: [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
    ],
    difficulty: 'easy',
    hint: '조각을 처음 자른 그대로 맞추면 돼요.',
  },
  {
    id: 'rectangle',
    name: '긴 직사각형',
    emoji: '🟦',
    outline: [
      { x: 0, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 2 },
      { x: 0, y: 2 },
    ],
    difficulty: 'easy',
    hint: '큰 삼각형 두 개를 양 끝에 길게 놓아 보세요.',
  },
  {
    id: 'triangle',
    name: '큰 산',
    emoji: '⛰️',
    outline: [
      { x: 0, y: 4 },
      { x: 8, y: 4 },
      { x: 4, y: 0 },
    ],
    difficulty: 'medium',
    hint: '두 큰 삼각형이 산의 양쪽 비탈이 됩니다.',
  },
  {
    id: 'house',
    name: '집',
    emoji: '🏠',
    outline: [
      { x: 0, y: 5 },
      { x: 4, y: 5 },
      { x: 4, y: 2 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
    ],
    difficulty: 'medium',
    hint: '지붕 삼각형을 먼저 정한 뒤 사각형 몸체를 채워보세요.',
  },
];

// 외부에서 면적 검증용
export function polygonArea(vs: Vec[]): number {
  return shoelaceArea(vs);
}
