export function collatzNext(n: number): number {
  return n % 2 === 0 ? n / 2 : n * 3 + 1;
}

export function collatzSequence(start: number): number[] {
  const seq = [start];
  let cur = start;
  while (cur !== 1) {
    cur = collatzNext(cur);
    seq.push(cur);
    if (seq.length > 10000) break; // safety
  }
  return seq;
}

export function collatzStats(seq: number[]) {
  return {
    steps: seq.length - 1,
    max: Math.max(...seq),
    maxStep: seq.indexOf(Math.max(...seq)),
  };
}

// SVG graph helpers
export function toGraphPoints(
  seq: number[],
  width: number,
  height: number,
  padding: number
): string {
  if (seq.length < 2) return '';
  const maxVal = Math.max(...seq);
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return seq
    .map((v, i) => {
      const x = padding + (i / (seq.length - 1)) * innerW;
      const y = padding + (1 - v / maxVal) * innerH;
      return `${x},${y}`;
    })
    .join(' ');
}

// 규칙 발견 퍼즐용 예시 데이터
export const EVEN_EXAMPLES = [
  { input: 6, output: 3 },
  { input: 8, output: 4 },
  { input: 12, output: 6 },
  { input: 20, output: 10 },
];

export const ODD_EXAMPLES = [
  { input: 3, output: 10 },
  { input: 5, output: 16 },
  { input: 7, output: 22 },
  { input: 9, output: 28 },
];

export const QUIZ_STEPS = [
  { n: 6, isEven: true },
  { n: 3, isEven: false },
  { n: 5, isEven: false },
  { n: 8, isEven: true },
  { n: 11, isEven: false },
];
