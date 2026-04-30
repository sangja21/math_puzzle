// 이차함수 — y = ax² + bx + c 의 평가·꼭짓점·근 + 표시 헬퍼

export function evaluateQuadratic(
  a: number,
  b: number,
  c: number,
  x: number,
): number {
  return a * x * x + b * x + c;
}

export interface VertexPoint {
  x: number;
  y: number;
}

export function vertex(a: number, b: number, c: number): VertexPoint {
  if (a === 0) return { x: 0, y: c };
  const x = -b / (2 * a);
  return { x, y: evaluateQuadratic(a, b, c, x) };
}

export type Roots =
  | { count: 0 }
  | { count: 1; x: number }
  | { count: 2; x1: number; x2: number };

export function roots(a: number, b: number, c: number): Roots {
  if (a === 0) {
    if (b === 0) return { count: 0 };
    return { count: 1, x: -c / b };
  }
  const disc = b * b - 4 * a * c;
  if (disc < -1e-9) return { count: 0 };
  if (disc < 1e-9) return { count: 1, x: -b / (2 * a) };
  const s = Math.sqrt(disc);
  return {
    count: 2,
    x1: (-b - s) / (2 * a),
    x2: (-b + s) / (2 * a),
  };
}

function fmt(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(2)).toString();
}

export function formatQuadratic(a: number, b: number, c: number): string {
  const parts: string[] = [];

  if (a !== 0) {
    if (a === 1) parts.push('x²');
    else if (a === -1) parts.push('-x²');
    else parts.push(`${fmt(a)}x²`);
  }

  if (b !== 0) {
    const abs = Math.abs(b);
    const coef = abs === 1 ? '' : fmt(abs);
    if (parts.length === 0) {
      parts.push(`${b > 0 ? '' : '-'}${coef}x`);
    } else {
      parts.push(`${b > 0 ? ' + ' : ' − '}${coef}x`);
    }
  }

  if (c !== 0) {
    const abs = Math.abs(c);
    if (parts.length === 0) {
      parts.push(fmt(c));
    } else {
      parts.push(`${c > 0 ? ' + ' : ' − '}${fmt(abs)}`);
    }
  }

  if (parts.length === 0) return 'y = 0';
  return `y = ${parts.join('')}`;
}

// § 6 근 카드 3장의 예시 함수
export interface RootExample {
  label: string;
  a: number;
  b: number;
  c: number;
}
export const ROOT_EXAMPLES: RootExample[] = [
  { label: '근 2개', a: 1, b: 0, c: -4 }, // x² - 4
  { label: '근 1개', a: 1, b: 0, c: 0 }, //  x²
  { label: '근 0개', a: 1, b: 0, c: 4 }, //  x² + 4
];

// § 2 표 데이터
export const BASIC_TABLE_X: number[] = [-2, -1, 0, 1, 2];
