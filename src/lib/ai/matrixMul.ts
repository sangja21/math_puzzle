// AI 딥러닝 시리즈 · 02 행렬 곱셈(Matrix Multiplication) — 층 하나를 통째로
//
// 01에서 배운 내적(뉴런 하나)을 격자로 쌓으면 신경망의 "한 층"이 됩니다.
//   C = L · T,  C[r][c] = Σ_k L[r][k] × T[k][c]
//   L(왼쪽 행렬)의 r번째 '행'과 T(위쪽 행렬)의 c번째 '열'의 내적 = 출력 한 칸
//
// 워크북과 같은 배치를 씁니다: 위쪽 행렬 T가 열을 내려주고(↓),
// 왼쪽 행렬 L이 행을 밀어주고(→), 두 줄이 만나는 칸이 곱의 결과.
//
// 아래 24개 퍼즐 = 워크북 02장 50개 빈칸(문제 1~50)을 그대로 옮긴 것.
// 빈칸은 결과(out)뿐 아니라 L·T 안에도 있어서, 결과를 보고 가중치를
// 거꾸로 찾는 "학습" 유형도 함께 들어 있습니다.

/** null = 빈칸 */
export type Grid = (number | null)[][];

export type Where = 'left' | 'top' | 'out';

export interface Blank {
  /** 워크북 문제 번호 (1~50) */
  id: number;
  where: Where;
  r: number;
  c: number;
  answer: number;
}

export interface Puzzle {
  key: string;
  /** 왼쪽(행을 공급하는) 행렬 이름 */
  leftName: 'A' | 'B';
  /** 위쪽(열을 공급하는) 행렬 이름 */
  topName: 'A' | 'B';
  /** m×n */
  left: Grid;
  /** n×p */
  top: Grid;
  /** m×p */
  out: Grid;
  blanks: Blank[];
}

export interface Stage {
  id: string;
  title: string;
  emoji: string;
  /** 이 스테이지가 가르치는 딥러닝 개념 한 줄 */
  concept: string;
  puzzles: Puzzle[];
}

/** 퍼즐 정의 헬퍼 — blanks 는 워크북 번호 순으로 정렬해 둔다 */
const pz = (
  key: string,
  names: 'AB' | 'BA',
  left: Grid,
  top: Grid,
  out: Grid,
  blanks: Blank[],
): Puzzle => ({
  key,
  leftName: names === 'AB' ? 'A' : 'B',
  topName: names === 'AB' ? 'B' : 'A',
  left,
  top,
  out,
  blanks: [...blanks].sort((x, y) => x.id - y.id),
});

const o = (id: number, r: number, c: number, answer: number): Blank => ({ id, where: 'out', r, c, answer });
const l = (id: number, r: number, c: number, answer: number): Blank => ({ id, where: 'left', r, c, answer });
const t = (id: number, r: number, c: number, answer: number): Blank => ({ id, where: 'top', r, c, answer });

export const STAGES: Stage[] = [
  {
    id: 'one-cell',
    title: '한 칸 = 내적 하나',
    emoji: '🌱',
    concept:
      '행렬 곱의 출력 한 칸은 01장에서 푼 내적 그대로예요. 왼쪽 행렬의 한 "행"과 위쪽 행렬의 한 "열"이 만나 뉴런 하나의 출력을 만듭니다.',
    puzzles: [
      // 1
      pz('p1', 'AB', [[3]], [[5, 2]], [[15, null]], [o(1, 0, 1, 6)]),
      // 2
      pz('p2', 'AB', [[3], [2]], [[4]], [[12], [null]], [o(2, 1, 0, 8)]),
      // 3, 4
      pz('p3', 'AB', [[1], [-1]], [[1, -1]], [[1, null], [-1, null]], [o(3, 0, 1, -1), o(4, 1, 1, 1)]),
      // 5, 6
      pz('p4', 'AB', [[3], [2]], [[2, -2]], [[6, null], [null, -4]], [o(5, 1, 0, 4), o(6, 0, 1, -6)]),
      // 7, 8 — 결과를 보고 A·B 안의 빈칸을 거꾸로 찾기
      pz('p5', 'AB', [[1], [null]], [[null, -5]], [[3, -5], [0, 0]], [l(7, 1, 0, 0), t(8, 0, 0, 3)]),
      // 9, 10
      pz('p6', 'AB', [[1], [null]], [[4, -2]], [[4, -2], [0, null]], [l(9, 1, 0, 0), o(10, 1, 1, 0)]),
    ],
  },
  {
    id: 'layer-2x2',
    title: '2×2 — 뉴런 두 개, 입력 두 벌',
    emoji: '⚡',
    concept:
      '2×2 곱셈은 뉴런 2개짜리 층에 입력 2벌을 한 번에 통과시킨 것과 같아요. 내적 4번을 표 한 장으로 정리한 셈이죠.',
    puzzles: [
      // 11, 12
      pz('p7', 'AB', [[1, 1], [1, -1]], [[1, 3], [3, 2]], [[4, null], [-2, null]], [o(11, 0, 1, 5), o(12, 1, 1, 1)]),
      // 13, 14
      pz('p8', 'AB', [[1, 1], [1, -1]], [[2, 5], [4, 3]], [[6, null], [null, 2]], [o(13, 1, 0, -2), o(14, 0, 1, 8)]),
      // 15, 16
      pz('p9', 'AB', [[3, 2], [4, 5]], [[1, 1], [-1, 1]], [[1, 5], [null, null]], [o(15, 1, 0, -1), o(16, 1, 1, 9)]),
      // 17, 18
      pz('p10', 'AB', [[5, 5], [-2, 2]], [[1, 1], [-1, 1]], [[null, 10], [-4, null]], [o(17, 0, 0, 0), o(18, 1, 1, 0)]),
    ],
  },
  {
    id: 'shapes',
    title: '모양이 곧 층의 구조',
    emoji: '📐',
    concept:
      '(m×n)·(n×p) = (m×p). 가운데 n이 맞아야 곱할 수 있어요 — n은 "입력 개수", m은 "데이터 벌 수", p는 "뉴런 개수"라고 읽으면 신경망 층이 그대로 보입니다.',
    puzzles: [
      // 19, 20 — (2×2)·(2×4)
      pz('p11', 'AB',
        [[3, 1], [2, 4]],
        [[1, 1, -1, -1], [-1, 1, 1, -1]],
        [[2, 4, null, -4], [null, 6, 2, -6]],
        [o(19, 1, 0, -2), o(20, 0, 2, -2)]),
      // 21, 22 — (3×2)·(2×4)
      pz('p12', 'AB',
        [[1, 1], [1, -1], [1, 0]],
        [[4, 3, 2, 1], [1, 2, 1, 2]],
        [[5, 5, 3, 3], [3, 1, null, -1], [4, 3, 2, null]],
        [o(21, 1, 2, 1), o(22, 2, 3, 1)]),
      // 23, 24 — (2×3)·(3×2)
      pz('p13', 'AB',
        [[1, 0, 1], [0, 1, 1]],
        [[2, 1], [3, 5], [4, -1]],
        [[6, 0], [null, null]],
        [o(23, 1, 0, 7), o(24, 1, 1, 4)]),
      // 25, 26 — (2×3)·(3×2)
      pz('p14', 'AB',
        [[3, 3, -1], [2, 1, 3]],
        [[1, 1], [1, 0], [0, 1]],
        [[null, null], [3, 5]],
        [o(25, 0, 0, 6), o(26, 0, 1, 2)]),
    ],
  },
  {
    id: 'order',
    title: 'A·B ≠ B·A — 순서를 바꾸면',
    emoji: '🔄',
    concept:
      '같은 두 행렬이라도 순서를 바꾸면 결과의 크기부터 달라져요. 신경망에서 "층을 어느 쪽에 곱하느냐"가 완전히 다른 연산인 이유입니다. 바로 앞 스테이지의 23~26번과 비교해 보세요.',
    puzzles: [
      // 27, 28 — 13번 퍼즐의 B·A
      pz('p15', 'BA',
        [[2, 1], [3, 5], [4, -1]],
        [[1, 0, 1], [0, 1, 1]],
        [[2, 1, 3], [3, 5, null], [null, -1, 3]],
        [o(27, 2, 0, 4), o(28, 1, 2, 8)]),
      // 29, 30 — 14번 퍼즐의 B·A
      pz('p16', 'BA',
        [[1, 1], [1, -1], [1, 0]],
        [[3, 3, -1], [2, 1, 3]],
        [[5, 4, null], [1, 2, -4], [3, null, -1]],
        [o(29, 2, 1, 3), o(30, 0, 2, 2)]),
    ],
  },
  {
    id: 'learn',
    title: '가중치를 역추적 — 학습',
    emoji: '🎯',
    concept:
      '결과가 주어지고 행렬 안쪽이 비어 있어요. 원하는 출력이 나오도록 가중치를 거꾸로 맞히는 것 — 이게 바로 신경망이 "배우는" 방향입니다.',
    puzzles: [
      // 31, 32
      pz('p17', 'AB',
        [[0, 1, null], [1, 1, 1]],
        [[3, 2], [2, 1], [1, null]],
        [[2, 1], [6, 1]],
        [l(31, 0, 2, 0), t(32, 2, 1, -2)]),
      // 33, 34
      pz('p18', 'AB',
        [[null, 0, 1], [1, 1, 0]],
        [[-2, null], [4, 4], [3, 1]],
        [[1, 3], [2, 6]],
        [l(33, 0, 0, 1), t(34, 0, 1, 2)]),
    ],
  },
  {
    id: 'wider',
    title: '입력 4개 — 층이 넓어진다',
    emoji: '🧩',
    concept:
      '입력 차원이 4로 늘어도 규칙은 그대로. 왼쪽 행렬의 각 행이 "데이터 한 벌"이고, 결과의 각 행이 그 데이터에 대한 층의 출력이에요.',
    puzzles: [
      // 35, 36 — (2×4)·(4×2)
      pz('p19', 'AB',
        [[1, 1, 0, 1], [1, 0, 1, -1]],
        [[3, 2], [2, 0], [1, 2], [4, 3]],
        [[9, null], [null, 1]],
        [o(35, 1, 0, 0), o(36, 0, 1, 5)]),
      // 37, 38 — 19번 퍼즐의 B·A: (4×2)·(2×4)
      pz('p20', 'BA',
        [[3, 2], [2, 0], [1, 2], [4, 3]],
        [[1, 1, 0, 1], [1, 0, 1, -1]],
        [[5, 3, 2, 1], [2, null, 0, 2], [3, 1, null, -1], [7, 4, 3, 1]],
        [o(37, 1, 1, 2), o(38, 2, 2, 2)]),
      // 39, 40 — 왼쪽이 "이웃 둘을 더하는" 행렬
      pz('p21', 'AB',
        [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1], [1, 0, 0, 1]],
        [[3, 2], [2, 1], [1, 1], [4, 3]],
        [[5, 3], [3, null], [null, 4], [7, 5]],
        [o(39, 1, 1, 2), o(40, 2, 0, 5)]),
      // 41, 42 — 같은 자리에 +1/-1 → "차이"를 뽑는 행렬
      pz('p22', 'AB',
        [[1, -1, 0, 0], [0, 1, -1, 0], [0, 0, 1, -1], [-1, 0, 0, 1]],
        [[3, 2], [2, 1], [1, 1], [4, 3]],
        [[1, 1], [1, null], [null, -2], [1, 1]],
        [o(41, 1, 1, 0), o(42, 2, 0, -3)]),
    ],
  },
  {
    id: 'big',
    title: '0과 1로 만든 행렬 — 골라내고 섞기',
    emoji: '🏗️',
    concept:
      '0/1로만 이루어진 행렬을 곱하면 값을 "고르고 더하는" 일이 돼요. 원-핫 인코딩, 임베딩 조회(lookup), 어텐션의 뼈대가 전부 이 모양입니다.',
    puzzles: [
      // 43, 44 — (2×4)·(4×5)
      pz('p23', 'AB',
        [[9, -2, 0, 5], [6, 3, 1, 4]],
        [[1, 0, 0, 0, 1], [0, 1, 0, 0, 1], [0, 0, 1, 0, 0], [1, 0, 0, 1, 0]],
        [[14, null, 0, 5, 7], [10, 3, 1, 4, null]],
        [o(43, 0, 1, -2), o(44, 1, 4, 9)]),
      // 45~50 — (7×4)·(4×5), 행렬 안쪽에도 빈칸
      pz('p24', 'AB',
        [
          [1, 1, 1, 0],
          [0, 1, 1, 1],
          [1, 0, 1, 0],
          [1, 1, 0, 1],
          [1, 1, -1, 0],
          [null, 1, 0, 1],
          [1, 0, null, 0],
        ],
        [
          [0, 0, 0, 1, 1],
          [1, 0, 1, 0, 1],
          [0, 1, 1, 0, 1],
          [0, 0, 0, 1, 0],
        ],
        [
          [1, null, 2, 1, 3],
          [1, 1, 2, 1, null],
          [0, 1, 1, 1, 2],
          [1, 0, null, 2, 2],
          [1, -1, 0, null, 1],
          [1, 0, 1, 1, 1],
          [0, 1, 1, 1, 2],
        ],
        [
          o(45, 0, 1, 1),
          o(46, 1, 4, 2),
          o(47, 3, 2, 1),
          o(48, 4, 3, 1),
          l(49, 5, 0, 0),
          l(50, 6, 2, 1),
        ]),
    ],
  },
];

export const ALL_PUZZLES: Puzzle[] = STAGES.flatMap((s) => s.puzzles);
export const ALL_BLANKS: Blank[] = ALL_PUZZLES.flatMap((p) => p.blanks);

/** 정답이 채워진 격자 */
function fill(grid: Grid, blanks: Blank[], where: Where): number[][] {
  return grid.map((row, r) =>
    row.map((v, c) => {
      if (v !== null) return v;
      const b = blanks.find((x) => x.where === where && x.r === r && x.c === c);
      return b ? b.answer : 0;
    }),
  );
}

export const filledLeft = (p: Puzzle) => fill(p.left, p.blanks, 'left');
export const filledTop = (p: Puzzle) => fill(p.top, p.blanks, 'top');
export const filledOut = (p: Puzzle) => fill(p.out, p.blanks, 'out');

export const rows = (g: Grid) => g.length;
export const cols = (g: Grid) => g[0].length;

/** 퍼즐의 크기 표기 — 예: "2×3 · 3×2 → 2×2" */
export function shapeLabel(p: Puzzle): string {
  return `${rows(p.left)}×${cols(p.left)} · ${rows(p.top)}×${cols(p.top)} → ${rows(p.out)}×${cols(p.out)}`;
}

/** 첨자 (C₂₁ 같은 표기용, 1-based) */
export function sub(n: number): string {
  return String(n)
    .split('')
    .map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])
    .join('');
}

/** 빈칸의 이름 — 예: C₂₁, A₁₃, B₃₂ */
export function blankLabel(p: Puzzle, b: Blank): string {
  const name = b.where === 'out' ? 'C' : b.where === 'left' ? p.leftName : p.topName;
  return `${name}${sub(b.r + 1)}${sub(b.c + 1)}`;
}

export interface ExplainTerm {
  left: number | null; // null = 이 항이 미지수
  top: number | null;
}

export interface Explain {
  /** 설명에 쓰는 결과 칸의 위치 */
  r: number;
  c: number;
  terms: ExplainTerm[];
  /** 결과값 (풀기 전부터 알려져 있으면 숫자, 아니면 null) */
  known: number | null;
  /** 정답까지 반영한 결과값 */
  value: number;
}

/**
 * 빈칸 하나를 설명할 "결과 칸"을 고른다.
 * - out 빈칸: 자기 자신
 * - left(r,k) 빈칸: 같은 행에서, T[k][c]가 0이 아니고 결과가 이미 알려진 열 c
 * - top(k,c) 빈칸: 같은 열에서, L[r][k]가 0이 아니고 결과가 이미 알려진 행 r
 */
export function explainFor(p: Puzzle, b: Blank): Explain {
  let r = b.r;
  let c = b.c;

  if (b.where === 'left') {
    const k = b.c;
    for (let cc = 0; cc < cols(p.top); cc++) {
      const tv = p.top[k][cc];
      if (tv !== null && tv !== 0 && p.out[b.r][cc] !== null) { c = cc; break; }
    }
  } else if (b.where === 'top') {
    const k = b.r;
    c = b.c;
    for (let rr = 0; rr < rows(p.left); rr++) {
      const lv = p.left[rr][k];
      if (lv !== null && lv !== 0 && p.out[rr][b.c] !== null) { r = rr; break; }
    }
  }

  const L = filledLeft(p);
  const T = filledTop(p);
  const n = cols(p.left);
  const terms: ExplainTerm[] = [];
  for (let k = 0; k < n; k++) {
    terms.push({
      left: p.left[r][k] === null ? null : L[r][k],
      top: p.top[k][c] === null ? null : T[k][c],
    });
  }
  const value = Array.from({ length: n }, (_, k) => L[r][k] * T[k][c]).reduce((s, v) => s + v, 0);

  return { r, c, terms, known: p.out[r][c], value };
}
