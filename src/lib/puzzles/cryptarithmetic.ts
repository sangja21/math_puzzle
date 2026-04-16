export type Assignment = Record<string, number | null>;

export interface AdditionPuzzle {
  id: string;
  type: 'addition';
  title: string;
  description: string;
  operands: string[][];
  result: string[];
  solution: Record<string, number>;
  hint: string;
}

export interface ReversalPuzzle {
  id: string;
  type: 'reversal';
  title: string;
  description: string;
  solution: Record<string, number>;
  defaultRepeat: number;
}

export const LEVEL1_PUZZLES: AdditionPuzzle[] = [
  {
    id: 'go_out',
    type: 'addition',
    title: 'GO + GO = OUT',
    description: '각 알파벳은 서로 다른 숫자(0~9)를 나타냅니다. G, O, U, T에 맞는 숫자를 찾아보세요!',
    operands: [['G', 'O'], ['G', 'O']],
    result: ['O', 'U', 'T'],
    solution: { G: 8, O: 7, U: 1, T: 4 },
    hint: 'GO를 두 번 더하면 OUT! 맨 앞 자리가 올림수에서 나온다는 걸 생각해보세요.',
  },
  {
    id: 'odd_even',
    type: 'addition',
    title: 'ODD + ODD = EVEN',
    description: '홀수(ODD) 두 개를 더하면 짝수(EVEN)! 각 알파벳에 숫자를 대입해보세요.',
    operands: [['O', 'D', 'D'], ['O', 'D', 'D']],
    result: ['E', 'V', 'E', 'N'],
    solution: { O: 6, D: 5, E: 1, V: 3, N: 0 },
    hint: 'D + D = N (올림 가능), 같은 수를 두 배 하면 짝수가 됩니다. E는 결과의 맨 앞자리이자 세 번째 자리!',
  },
];

export const LEVEL2_PUZZLE: AdditionPuzzle = {
  id: 'send_more_money',
  type: 'addition',
  title: 'SEND + MORE = MONEY',
  description: '1924년 헨리 듀드니가 만든 역사상 가장 유명한 복면산입니다. 각 알파벳에 서로 다른 숫자를 넣어 등식을 완성하세요.',
  operands: [['S', 'E', 'N', 'D'], ['M', 'O', 'R', 'E']],
  result: ['M', 'O', 'N', 'E', 'Y'],
  solution: { S: 9, E: 5, N: 6, D: 7, M: 1, O: 0, R: 8, Y: 2 },
  hint: 'MONEY는 5자리, SEND와 MORE는 4자리이므로 올림이 발생합니다. M은 1이에요!',
};

export const LEVEL3_PUZZLE: ReversalPuzzle = {
  id: 'reversal',
  type: 'reversal',
  title: 'ABC···CDE × F = EDC···CBA',
  description: '어떤 수에 F를 곱하면 앞뒤가 뒤집힌 수가 됩니다! 가운데 C가 늘어나도 여전히 성립할까요?',
  solution: { A: 2, B: 1, C: 9, D: 7, E: 8, F: 4 },
  defaultRepeat: 2,
};

/**
 * Build the number string for Level 3 based on repeat count
 * repeat=2: ABCCDE, repeat=3: ABCCCDE, etc.
 * Actually: repeat=2 → AB CC DE (219978), but letter pattern is A B [C×n] D E
 * Default: A=2,B=1,C=9,D=7,E=8,F=4
 * n=2: 219978 × 4 = 879912  (AB + CC + DE)
 * n=3: 2199978 × 4 = 8799912
 */
export function buildLevel3Number(repeat: number, assignment: Assignment): number | null {
  const A = assignment['A'];
  const B = assignment['B'];
  const C = assignment['C'];
  const D = assignment['D'];
  const E = assignment['E'];
  if (A === null || B === null || C === null || D === null || E === null) return null;
  const digits = [A, B, ...Array(repeat).fill(C), D, E];
  return digits.reduce((acc, d) => acc * 10 + d, 0);
}

export function buildLevel3Reversed(repeat: number, assignment: Assignment): number | null {
  const A = assignment['A'];
  const B = assignment['B'];
  const C = assignment['C'];
  const D = assignment['D'];
  const E = assignment['E'];
  if (A === null || B === null || C === null || D === null || E === null) return null;
  const digits = [E, D, ...Array(repeat).fill(C), B, A];
  return digits.reduce((acc, d) => acc * 10 + d, 0);
}

export function getLevel3Letters(repeat: number): string[] {
  return ['A', 'B', ...Array(repeat).fill('C'), 'D', 'E'];
}

export function getLevel3ResultLetters(repeat: number): string[] {
  return ['E', 'D', ...Array(repeat).fill('C'), 'B', 'A'];
}

/** Check if all unique letter→digit assignments have no duplicates */
export function hasDuplicate(assignment: Assignment): boolean {
  const vals = Object.values(assignment).filter((v) => v !== null) as number[];
  return vals.length !== new Set(vals).size;
}

/** Validate addition puzzle column-by-column, returns per-column result */
export interface ColumnStatus {
  correct: boolean;
  partial: boolean; // digits assigned but wrong
  empty: boolean;   // some digits not yet assigned
}

export function validateAddition(
  operands: string[][],
  result: string[],
  assignment: Assignment
): { isComplete: boolean; isCorrect: boolean; columnStatuses: ColumnStatus[] } {
  // Align operands right to result length
  const len = result.length;
  const aligned = operands.map((op) => {
    const padded = Array(len - op.length).fill(null).concat(op);
    return padded;
  });

  const columnStatuses: ColumnStatus[] = [];
  let carry = 0;
  let isCorrect = true;
  let isComplete = true;

  // Process right to left
  for (let col = len - 1; col >= 0; col--) {
    const resLetter = result[col];
    const resVal = assignment[resLetter];

    const colLetters = aligned.map((op) => op[col]);
    const colVals = colLetters.map((l) => (l === null ? 0 : assignment[l ?? ''] ?? null));

    const hasNull = resVal === null || colVals.some((v) => v === null);

    if (hasNull) {
      isComplete = false;
      columnStatuses[col] = { correct: false, partial: false, empty: true };
      continue;
    }

    const sum = (colVals as number[]).reduce((a, b) => a + b, 0) + carry;
    const digit = sum % 10;
    carry = Math.floor(sum / 10);

    if (digit === resVal) {
      columnStatuses[col] = { correct: true, partial: false, empty: false };
    } else {
      columnStatuses[col] = { correct: false, partial: true, empty: false };
      isCorrect = false;
    }
  }

  // Remaining carry must be 0
  if (carry !== 0) isCorrect = false;

  return { isComplete, isCorrect, columnStatuses };
}

export function validateReversal(
  repeat: number,
  assignment: Assignment
): { isComplete: boolean; isCorrect: boolean } {
  const F = assignment['F'];
  const left = buildLevel3Number(repeat, assignment);
  const right = buildLevel3Reversed(repeat, assignment);
  if (F === null || left === null || right === null) {
    return { isComplete: false, isCorrect: false };
  }
  return { isComplete: true, isCorrect: left * F === right };
}
