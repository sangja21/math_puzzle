// AI 딥러닝 시리즈 · 01 내적(Dot Product) — 뉴런의 가중합
//
// 딥러닝 뉴런 하나가 하는 일은 결국 내적입니다.
//   출력 = a·b = a₁b₁ + a₂b₂ + ... + aₙbₙ   (+ 편향, 활성화)
//   a = 입력(inputs),  b = 가중치(weights)
//
// 아래 30문제는 『딥러닝 수학 워크북 01 내적』을 그대로 옮긴 것으로,
// 두 유형으로 나뉩니다.
//   - forward : a와 b가 주어지고 출력 a·b 를 계산    → 순전파(forward pass)
//   - weight  : 빈칸 한 개 + 목표 출력이 주어지고 빈칸을 찾기 → 학습(가중치 찾기)

export type BlankTarget =
  | { kind: 'result' }
  | { kind: 'a'; idx: number }
  | { kind: 'b'; idx: number };

export interface Problem {
  /** 워크북 문제 번호 (1~30) */
  id: number;
  /** 입력 벡터 a (가로) — 빈칸이면 null */
  a: (number | null)[];
  /** 가중치 벡터 b (세로) — 빈칸이면 null */
  b: (number | null)[];
  /** 알려진 출력값 (weight 유형) 또는 null (forward 유형) */
  result: number | null;
  /** 빈칸이 어디에 있는지 */
  blank: BlankTarget;
  /** 빈칸의 정답 */
  answer: number;
  /** forward = 출력 계산, weight = 가중치/입력 역추적 */
  mode: 'forward' | 'weight';
}

export interface Stage {
  id: string;
  title: string;
  emoji: string;
  /** 이 스테이지가 가르치는 딥러닝 개념 한 줄 */
  concept: string;
  problems: Problem[];
}

// forward 문제 헬퍼: 출력이 빈칸
const fwd = (id: number, a: number[], b: number[]): Problem => ({
  id,
  a,
  b,
  result: null,
  blank: { kind: 'result' },
  answer: a.reduce((s, ai, i) => s + ai * b[i], 0),
  mode: 'forward',
});

// weight 문제 헬퍼: a 또는 b 의 한 원소가 빈칸, 출력은 주어짐
const wgt = (
  id: number,
  a: (number | null)[],
  b: (number | null)[],
  result: number,
  answer: number,
): Problem => {
  let blank: BlankTarget = { kind: 'result' };
  const ai = a.findIndex((v) => v === null);
  if (ai >= 0) blank = { kind: 'a', idx: ai };
  else {
    const bi = b.findIndex((v) => v === null);
    blank = { kind: 'b', idx: bi };
  }
  return { id, a, b, result, blank, answer, mode: 'weight' };
};

export const STAGES: Stage[] = [
  {
    id: 'neuron-1d',
    title: '뉴런의 탄생 — 입력이 하나',
    emoji: '🌱',
    concept:
      '입력 1개짜리 뉴런은 그냥 곱셈이에요. a·b 는 "입력 × 가중치". 여기서 가중치를 역으로 찾는 게 바로 학습의 씨앗입니다.',
    problems: [
      fwd(1, [3], [5]), // 15
      fwd(2, [4], [2]), // 8
      fwd(3, [-3], [2]), // -6
      wgt(4, [null], [2], 6, 3), // a₁=3
      wgt(5, [-3], [null], 9, -3), // b₁=-3
    ],
  },
  {
    id: 'neuron-2d-forward',
    title: '입력이 둘 — 가중합의 시작',
    emoji: '⚡',
    concept:
      '입력이 2개가 되면 두 곱을 더합니다: a₁b₁ + a₂b₂. 이 "곱해서 더하기(가중합)"가 모든 신경망의 기본 연산이에요.',
    problems: [
      fwd(6, [1, 2], [1, 1]), // 3
      fwd(7, [1, 2], [1, 2]), // 5
      fwd(8, [1, 3], [4, 1]), // 7
      fwd(9, [1, -1], [4, 1]), // 3
      fwd(10, [0, -1], [4, 1]), // -1
      fwd(11, [0, -3], [-4, 2]), // -6
      fwd(12, [0, -3], [-4, 0]), // 0
    ],
  },
  {
    id: 'learning-2d',
    title: '가중치를 찾아라 — 학습',
    emoji: '🎯',
    concept:
      '출력을 알고 가중치를 거꾸로 맞히는 것 — 이게 딥러닝의 "학습"이에요. 신경망은 원하는 출력이 나오도록 가중치를 조금씩 바꿔갑니다.',
    problems: [
      wgt(13, [1, null], [2, 3], 5, 1), // a₂=1
      wgt(14, [1, null], [2, 3], 2, 0), // a₂=0
      wgt(15, [1, null], [4, 3], 1, -1), // a₂=-1
      wgt(16, [1, null], [2, 3], 8, 2), // a₂=2
    ],
  },
  {
    id: 'neuron-3d',
    title: '더 많은 입력 — 3차원 뉴런',
    emoji: '🧠',
    concept:
      '입력이 3개든 1000개든 원리는 똑같아요: 각 입력 × 가중치를 모두 더한다. 실제 뉴런은 수백~수천 개의 입력을 이렇게 처리합니다.',
    problems: [
      fwd(17, [1, 1, 1], [1, 2, 3]), // 6
      fwd(18, [1, 0, -1], [4, 9, 3]), // 1
      fwd(19, [1, 0, -1], [0, 1, 0]), // 0
      wgt(20, [1, 0, null], [8, 4, 5], 3, -1), // a₃=-1
      wgt(21, [null, 1, 0], [4, 2, 9], 6, 1), // a₁=1
      wgt(22, [null, 1, 0], [4, 2, 9], -2, -1), // a₁=-1
      wgt(23, [3, 1, -2], [1, 4, null], 7, 0), // b₃=0
      wgt(24, [2, null, -9], [1, 3, 0], -1, -1), // a₂=-1
    ],
  },
  {
    id: 'layers',
    title: '층을 쌓다 — 다층 신경망',
    emoji: '🏗️',
    concept:
      '한 층의 출력들이 다음 층의 입력이 됩니다. 25~29번에서 나온 출력 5개를 30번의 가중치 b로 다시 넣어보세요 — 이게 바로 "층 쌓기(deep)"예요.',
    problems: [
      fwd(25, [1, 0, 1], [4, 1, 7]), // 11
      fwd(26, [1, 0, 0, 1], [4, 1, 7, 3]), // 7
      fwd(27, [1, 0, 0, 1, 1], [4, 1, 7, 3, 6]), // 13
      fwd(28, [1, 0, 0, 0, 1, 1], [4, 1, 7, 3, 6, 2]), // 12
      fwd(29, [0, 1, 0, 0, 1, 1, 0], [4, 1, 7, 3, 6, 2, 5]), // 9
      // 30번: b = [25,26,27,28,29 번의 출력] = [11,7,13,12,9]
      fwd(30, [1, 0, 0, 0, -1], [11, 7, 13, 12, 9]), // 2
    ],
  },
];

export const ALL_PROBLEMS: Problem[] = STAGES.flatMap((s) => s.problems);

/** 실제로 채워진(정답이 반영된) a 벡터 */
export function filledA(p: Problem): number[] {
  return p.a.map((v, i) => (v === null && p.blank.kind === 'a' && p.blank.idx === i ? p.answer : (v ?? 0)));
}

/** 실제로 채워진(정답이 반영된) b 벡터 */
export function filledB(p: Problem): number[] {
  return p.b.map((v, i) => (v === null && p.blank.kind === 'b' && p.blank.idx === i ? p.answer : (v ?? 0)));
}

/** a·b 최종 출력값 */
export function outputOf(p: Problem): number {
  const a = filledA(p);
  const b = filledB(p);
  return a.reduce((s, ai, i) => s + ai * b[i], 0);
}

/** 항별 곱 [a_i * b_i] — 뉴런 시각화용 */
export function termProducts(p: Problem): number[] {
  const a = filledA(p);
  const b = filledB(p);
  return a.map((ai, i) => ai * b[i]);
}

/** 사용자가 채워야 하는 빈칸의 라벨 (예: a₂, b₃, a·b) */
export function blankLabel(p: Problem): string {
  const sub = (n: number) => '₀₁₂₃₄₅₆₇₈₉'[n];
  if (p.blank.kind === 'result') return 'a·b';
  if (p.blank.kind === 'a') return `a${sub(p.blank.idx + 1)}`;
  return `b${sub(p.blank.idx + 1)}`;
}
