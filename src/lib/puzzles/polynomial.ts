// 다항함수 — 평가, 보간, 차수별 샘플 (Chebyshev 기반)

export type Coeffs = number[]; // 저차→고차: [a0, a1, a2, ...]

export function evaluatePolynomial(coeffs: Coeffs, x: number): number {
  // Horner 방식: 고차에서부터 누적
  let y = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    y = y * x + coeffs[i];
  }
  return y;
}

export interface Point {
  x: number;
  y: number;
}

// Lagrange 보간 — N개의 점을 모두 지나는 최대 N-1차 다항을 평가하는 함수 반환
export function lagrangeInterpolate(points: Point[]): (x: number) => number {
  if (points.length === 0) return () => 0;
  return (x: number) => {
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      let term = points[i].y;
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        const denom = points[i].x - points[j].x;
        if (Math.abs(denom) < 1e-12) return NaN;
        term *= (x - points[j].x) / denom;
      }
      sum += term;
    }
    return sum;
  };
}

// 차수별 시범용 다항: x∈[-5,5]에서 y∈[-5,5]를 정확히 채우는 Chebyshev T_n(x/5)·5
// 굽이(turning points) 수 = 차수 - 1, 모두 viewport 안에 들어옴
export const DEGREE_SAMPLES: Record<number, Coeffs> = {
  1: [0, 1], // y = x
  2: [-5, 0, 0.4], // 0.4x² - 5
  3: [0, -3, 0, 0.16], // 0.16x³ - 3x
  4: [5, 0, -1.6, 0, 0.064], // 0.064x⁴ - 1.6x² + 5
  5: [0, 1, 0, -0.16, 0, 0.0256], // 0.0256x⁵ - 0.16x³ + x
  6: [-5, 0, 0.72, 0, -0.0768, 0, 0.002048],
  7: [0, -7, 0, 2.24, 0, -0.1792, 0, 0.004096],
};

// 차수 → (이론상) 굽이 최대 개수
export function maxTurningPoints(degree: number): number {
  return Math.max(0, degree - 1);
}

// 차수 → 끝단 거동 라벨
export type EndBehavior = 'both-up' | 'both-down' | 'left-down-right-up' | 'left-up-right-down';

export function endBehaviorOf(degree: number, leadingPositive: boolean): EndBehavior {
  const isEven = degree % 2 === 0;
  if (isEven) return leadingPositive ? 'both-up' : 'both-down';
  return leadingPositive ? 'left-down-right-up' : 'left-up-right-down';
}

// 룽게 함수 — f(x) = 5 / (1 + x²) on x ∈ [-5, 5]
// 등간격 점이 늘어날수록 가장자리에서 보간 다항이 진동 폭발
export function rungeFunction(x: number): number {
  return 5 / (1 + x * x);
}

export function rungePoints(n: number, xMin = -5, xMax = 5): Point[] {
  if (n < 2) return [];
  const step = (xMax - xMin) / (n - 1);
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const x = xMin + i * step;
    out.push({ x, y: rungeFunction(x) });
  }
  return out;
}

// 차수 N인 다항을 사람이 읽을 수 있는 식으로 (간단 버전, 0 계수 생략)
export function formatPolynomial(coeffs: Coeffs): string {
  const fmt = (n: number) =>
    Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(3)).toString();
  const parts: string[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (Math.abs(c) < 1e-9) continue;
    const abs = Math.abs(c);
    const sign = c > 0 ? '+' : '−';
    const coef = abs === 1 && i > 0 ? '' : fmt(abs);
    const xPart = i === 0 ? '' : i === 1 ? 'x' : `x^${i}`;
    if (parts.length === 0) {
      parts.push(`${c < 0 ? '−' : ''}${coef}${xPart}`);
    } else {
      parts.push(`${sign} ${coef}${xPart}`);
    }
  }
  if (parts.length === 0) return 'y = 0';
  return `y = ${parts.join(' ')}`;
}
