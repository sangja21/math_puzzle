// 미분·적분 단원 공유 수치 헬퍼 (단원 8 differential · 단원 9 integral)

export type Fn = (x: number) => number;

/** 중앙차분 수치미분 */
export function numericDerivative(f: Fn, x: number, h = 1e-4): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** 두 점 사이 평균변화율 (할선의 기울기) */
export function averageRate(f: Fn, a: number, b: number): number {
  if (a === b) return numericDerivative(f, a);
  return (f(b) - f(a)) / (b - a);
}

/** x0 에서의 접선: y = m(x − x0) + f(x0) → 양 끝점 샘플 */
export function tangentSamples(
  f: Fn,
  x0: number,
  xMin: number,
  xMax: number,
): { x: number; y: number }[] {
  const m = numericDerivative(f, x0);
  const y0 = f(x0);
  return [
    { x: xMin, y: m * (xMin - x0) + y0 },
    { x: xMax, y: m * (xMax - x0) + y0 },
  ];
}

/** 사다리꼴 공식 수치적분 */
export function trapezoidIntegral(f: Fn, a: number, b: number, n = 200): number {
  const h = (b - a) / n;
  let sum = (f(a) + f(b)) / 2;
  for (let i = 1; i < n; i++) sum += f(a + i * h);
  return sum * h;
}

/** 리만 합 직사각형 (적분 시각화용) — n개 막대의 {x, width, height} */
export function riemannRects(
  f: Fn,
  a: number,
  b: number,
  n: number,
): { x: number; width: number; height: number }[] {
  const w = (b - a) / n;
  const rects: { x: number; width: number; height: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x = a + i * w;
    rects.push({ x, width: w, height: f(x + w / 2) }); // 중점 규칙
  }
  return rects;
}

export interface Extremum {
  x: number;
  y: number;
  kind: 'max' | 'min';
}

/** 구간 내 극값을 수치 탐색 (도함수 부호 변화 스캔) */
export function findExtrema(f: Fn, xMin: number, xMax: number, scanN = 800): Extremum[] {
  const out: Extremum[] = [];
  const step = (xMax - xMin) / scanN;
  let prev = numericDerivative(f, xMin);
  for (let i = 1; i <= scanN; i++) {
    const x = xMin + i * step;
    const d = numericDerivative(f, x);
    if (prev > 0 && d <= 0) {
      const xs = refine(f, x - step, x, true);
      out.push({ x: xs, y: f(xs), kind: 'max' });
    } else if (prev < 0 && d >= 0) {
      const xs = refine(f, x - step, x, false);
      out.push({ x: xs, y: f(xs), kind: 'min' });
    }
    prev = d;
  }
  return out;
}

/** 이분법으로 f'=0 지점 정밀화 */
function refine(f: Fn, lo: number, hi: number, isMax: boolean, iter = 40): number {
  for (let i = 0; i < iter; i++) {
    const mid = (lo + hi) / 2;
    const d = numericDerivative(f, mid);
    if ((isMax && d > 0) || (!isMax && d < 0)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
