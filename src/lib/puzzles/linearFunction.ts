export interface QuizQuestion {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  a: number;
  b: number;
}

export const SLOPE_VALUES = [-3, -2, -1, 1, 2, 3];
export const INTERCEPT_VALUES = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

export function generateQuizQuestion(): QuizQuestion {
  const a = SLOPE_VALUES[Math.floor(Math.random() * SLOPE_VALUES.length)];
  const b = INTERCEPT_VALUES[Math.floor(Math.random() * INTERCEPT_VALUES.length)];
  const x1 = [-4, -3, -2, -1][Math.floor(Math.random() * 4)];
  const x2 = x1 + (Math.random() < 0.5 ? 2 : 3);
  return {
    p1: { x: x1, y: a * x1 + b },
    p2: { x: x2, y: a * x2 + b },
    a,
    b,
  };
}

export function generateGameTarget(): { a: number; b: number } {
  const a = SLOPE_VALUES[Math.floor(Math.random() * SLOPE_VALUES.length)];
  const b = [-4, -3, -2, -1, 0, 1, 2, 3, 4][Math.floor(Math.random() * 9)];
  return { a, b };
}

// 수학 좌표 → SVG 픽셀 (범위: x,y ∈ [-10,10], SVG 400×400)
export function toSvgX(x: number, svgW = 400): number {
  return ((x + 10) / 20) * svgW;
}
export function toSvgY(y: number, svgH = 400): number {
  return ((10 - y) / 20) * svgH;
}

// 직선의 SVG 양 끝점 (x=-10 ~ x=10 범위, y를 -12~12 클램프)
export function getLineSvgPoints(
  a: number,
  b: number,
  svgW = 400,
  svgH = 400,
): { x1: number; y1: number; x2: number; y2: number } {
  const yLeft = Math.max(-12, Math.min(12, a * -10 + b));
  const yRight = Math.max(-12, Math.min(12, a * 10 + b));
  return {
    x1: toSvgX(-10, svgW),
    y1: toSvgY(yLeft, svgH),
    x2: toSvgX(10, svgW),
    y2: toSvgY(yRight, svgH),
  };
}

export const OBSERVATION_POINTS = [
  'a(기울기) > 0 이면 오른쪽으로 올라가는 직선이에요.',
  'a(기울기) < 0 이면 오른쪽으로 내려가는 직선이에요.',
  'a = 0 이면 수평선(가로선)이 돼요.',
  '|a|가 클수록 직선이 더 가파르게 기울어요.',
  'b(y절편)는 직선이 y축과 만나는 점이에요.',
  'b가 커지면 직선이 위로, 작아지면 아래로 이동해요.',
];

function fmt(n: number): string {
  return parseFloat(n.toFixed(1)).toString();
}

export function formatEquation(a: number, b: number): string {
  const fa = fmt(a);
  const fb = fmt(Math.abs(b));
  const aStr = a === 1 ? '' : a === -1 ? '-' : fa;
  const bStr = b === 0 ? '' : b > 0 ? ` + ${fb}` : ` - ${fb}`;
  if (a === 0) return `y = ${fmt(b)}`;
  return `y = ${aStr}x${bStr}`;
}

export const CODING_TABLE_X_VALUES = [-2, -1, 0, 1, 2, 3];
